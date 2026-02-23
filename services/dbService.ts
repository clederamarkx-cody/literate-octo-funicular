import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { db, storage, auth } from './firebase';
import { Nominee, NomineeDocument, UserRole } from '../types';
import { INITIAL_GKK_WINNERS } from '../constants';
export const TEST_MODE = false; // Set to true to bypass DB lookups for UI testing

// Collection references
// Unified Collection Names (Approved Minimal Schema)
export const USERS_COLLECTION = 'users';
export const ACCESS_KEYS_COLLECTION = 'accessKeys';
export const APPLICATIONS_COLLECTION = 'applications';
export const REQUIREMENTS_COLLECTION = 'requirements';
export const WINNERS_COLLECTION = 'gkk_winners';

// Legacy/Internal Collection Names used for seeding/cleanup
export const NOMINEES_COLLECTION = 'nominees';
export const ADMINS_COLLECTION = 'admins';
export const REU_COLLECTION = 'reu';
export const SCD_COLLECTION = 'scd_team_leaders';
export const EVALUATORS_COLLECTION = 'evaluators';
export const INVITES_COLLECTION = 'invites';
export const EVALUATIONS_REVIEWS_COLLECTION = 'evaluation_reviews';
export const AWARD_CATEGORIES_COLLECTION = 'award_categories';
export const SYSTEM_LOGS_COLLECTION = 'system_logs';
export const SETTINGS_COLLECTION = 'settings';

/**
 * Standardized Logging for Audit Trails
 */
export const logAction = async (action: string, details: string, appId?: string) => {
    try {
        const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        await setDoc(doc(db, SYSTEM_LOGS_COLLECTION, logId), {
            logId,
            userId: auth.currentUser?.uid || 'system',
            userEmail: auth.currentUser?.email || 'system@gkk.gov',
            action,
            details,
            applicationId: appId || 'n/a',
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        console.warn("Logging failed", e);
    }
};

/**
 * Fetches requirements list from Firestore based on category
 */
export const getRequirementsByCategory = async (category: string) => {
    try {
        const docRef = doc(db, REQUIREMENTS_COLLECTION, `cat_${category.toLowerCase()}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return docSnap.data();

        // Fallback to Industry if not found
        const fallbackRef = doc(db, REQUIREMENTS_COLLECTION, 'cat_industry');
        const fallbackSnap = await getDoc(fallbackRef);
        return fallbackSnap.data();
    } catch (e) {
        console.error("Failed to fetch requirements", e);
        return null;
    }
};

/**
 * Valid Role Type mapping
 */
export const isValidRole = (role: string): role is UserRole => {
    return ['admin', 'reu', 'scd_team_leader', 'evaluator', 'nominee'].includes(role);
};

/**
 * Creates a new central user profile
 */
export const createUserProfile = async (uid: string, email: string, role: UserRole) => {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(userRef, {
        userId: uid,
        email,
        role,
        createdAt: new Date().toISOString(),
        status: role === 'nominee' ? 'pending' : 'active'
    }, { merge: true });
};

export const createNominee = async (uid: string, regId: string, name: string, nomineeCategory: Nominee['details']['nomineeCategory'], email: string) => {
    // 1. Create/Update universal user profile
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(userDocRef, {
        userId: uid,
        email,
        role: 'nominee',
        createdAt: new Date().toISOString(),
        status: 'active'
    }, { merge: true });

    // 2. Create the actual application
    const appDocRef = doc(db, APPLICATIONS_COLLECTION, uid); // Using uid as appId for simplicity here, they map 1:1
    const newApplication: Nominee = {
        id: uid,
        regId,
        name,
        email,
        role: 'nominee',
        industry: 'Unspecified',
        region: 'NCR',
        status: 'in_progress',
        submittedDate: new Date().toISOString(),
        round2Unlocked: false,
        documents: [],
        details: {
            nomineeCategory,
            employees: '',
            address: '',
            representative: '',
            designation: '',
            email: '',
            phone: '',
            safetyOfficer: ''
        }
    };

    await setDoc(appDocRef, newApplication);
    return newApplication;
};

/**
 * Fetches an application by the nominee's ID
 */
export const getNominee = async (uid: string): Promise<Nominee | null> => {
    // 2. Fallback to Firebase
    const appRef = doc(db, APPLICATIONS_COLLECTION, uid);
    const appSnap = await getDoc(appRef);

    if (appSnap.exists()) {
        return appSnap.data() as Nominee;
    }

    return null;
};

/**
 * Updates a nominee's application
 */
export const updateNominee = async (uid: string, updates: Partial<Nominee>) => {
    // 2. Original Firebase Update
    const appRef = doc(db, APPLICATIONS_COLLECTION, uid);
    await updateDoc(appRef, {
        ...updates,
        updatedAt: new Date().toISOString()
    });

    await logAction('UPDATE_NOMINEE', `Fields updated: ${Object.keys(updates).join(', ')}`, uid);
};

export const updateDocumentEvaluation = async (appId: string, slotId: string, verdict: 'pass' | 'fail') => {
    const appRef = doc(db, APPLICATIONS_COLLECTION, appId);
    const appSnap = await getDoc(appRef);

    if (appSnap.exists()) {
        const data = appSnap.data() as Nominee;
        const updatedDocs = data.documents.map(doc =>
            doc.slotId === slotId ? { ...doc, verdict } : doc
        );

        await updateDoc(appRef, { documents: updatedDocs });
        await logAction('VERIFY_DOCUMENT', `Slot ${slotId} marked as ${verdict.toUpperCase()}`, appId);
        return true;
    }
    return false;
};

/**
 * Adds an uploaded document to the nominee's application record
 */
export const addNomineeDocument = async (uid: string, document: NomineeDocument) => {
    const appRef = doc(db, APPLICATIONS_COLLECTION, uid);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) return;

    const nominee = appSnap.data() as Nominee;
    const existingDocs = nominee.documents || [];
    const updatedDocs = existingDocs.filter(d => d.slotId !== document.slotId);
    updatedDocs.push(document);

    await updateDoc(appRef, {
        documents: updatedDocs
    });
};

/**
 * Uploads a file directly to Firebase Cloud Storage with streaming progress.
 */
export const uploadNomineeFile = async (
    uid: string,
    documentId: string,
    file: File,
    onProgress?: (progress: number) => void,
    cancelToken?: { cancel?: () => void }
): Promise<string> => {
    const fileUid = `${uid}_${documentId}_${Date.now()}`;
    // Optionally change the path if you want it aligned with applications
    const storageRef = ref(storage, `nominee_docs/${uid}/${fileUid}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    if (cancelToken) {
        cancelToken.cancel = () => uploadTask.cancel();
    }

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                if (onProgress) onProgress(progress);
            },
            (error) => {
                console.error("Storage upload failed", error);
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });
};

/**
 * Dynamically resolves File URLs. 
 */
export const resolveFileUrl = async (url: string | null | undefined): Promise<string> => {
    return url || '';
};

/**
 * Fetches all applications (Used by Evaluators/Admins)
 */
export const getAllNominees = async (): Promise<Nominee[]> => {
    const appsRef = collection(db, APPLICATIONS_COLLECTION);
    const querySnapshot = await getDocs(appsRef);
    return querySnapshot.docs.map(doc => doc.data() as Nominee);
};

/**
 * Fetches a user's role by checking the unified users collection
 */
export const getUserRole = async (uid: string): Promise<UserRole | null> => {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data().role as UserRole;
    }
    return null;
};

/**
 * Updates the evaluation verdict for a specific stage
 */
export const updateStageVerdict = async (nomineeId: string, stage: 1 | 2 | 3, verdict: 'Pass' | 'Fail') => {
    try {
        const appRef = doc(db, APPLICATIONS_COLLECTION, nomineeId);
        const updateData: Partial<Nominee> = {};

        switch (stage) {
            case 1: updateData.stage1Verdict = verdict; break;
            case 2: updateData.stage2Verdict = verdict; break;
            case 3: updateData.stage3Verdict = verdict; break;
        }

        await updateDoc(appRef, updateData);
        await logAction('SUBMIT_VERDICT', `Stage ${stage} marked as ${verdict.toUpperCase()}`, nomineeId);
        return true;
    } catch (error) {
        console.error(`Error updating stage ${stage} verdict:`, error);
        return false;
    }
};

/**
 * Finds a user by email across the unified Users collection
 */
export const getUserByEmail = async (email: string): Promise<{ uid: string, role: UserRole } | null> => {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        return {
            uid: docSnap.id,
            role: docSnap.data().role as UserRole
        };
    }

    return null;
};

/**
 * Fetches all GKK Winners records
 */
export const getGKKWinners = async (): Promise<any[]> => {
    const winnersRef = collection(db, WINNERS_COLLECTION);
    const querySnapshot = await getDocs(winnersRef);
    const firestoreWinners = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return firestoreWinners.length > 0 ? firestoreWinners : INITIAL_GKK_WINNERS;
};

/**
 * Fetches an application by their registration/invitation key (Pass Key)
 */
export const getNomineeByPassKey = async (passKey: string): Promise<Nominee | null> => {
    // Check active applications linked to the key
    const appsRef = collection(db, APPLICATIONS_COLLECTION);
    const q1 = query(appsRef, where('regId', '==', passKey));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) return snap1.docs[0].data() as Nominee;

    return null;
};

/**
 * Validates and activates an unused AccessKey for a new Nominee Application.
 */
export const activateAccessKey = async (passKey: string, uid: string): Promise<boolean> => {
    try {
        const keysRef = collection(db, ACCESS_KEYS_COLLECTION);
        const q = query(keysRef, where('keyId', '==', passKey), where('status', '==', 'issued'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return false;

        const inviteDoc = querySnapshot.docs[0];
        const inviteData = inviteDoc.data();

        // 1. Create the unified User profile
        const nomineeRef = doc(db, USERS_COLLECTION, uid);
        await setDoc(nomineeRef, {
            userId: uid,
            email: inviteData.email,
            role: 'nominee',
            createdAt: new Date().toISOString(),
            status: 'active'
        });

        // 2. Pre-Create the generic Application document
        const appRef = doc(db, APPLICATIONS_COLLECTION, uid);
        await setDoc(appRef, {
            ...inviteData,
            applicationId: uid,
            nomineeId: uid,
            id: uid,
            status: 'in_progress',
            activatedAt: new Date().toISOString(),
            role: 'nominee'
        });

        // 3. Mark the Access Key as activated and bind user
        await updateDoc(inviteDoc.ref, {
            status: 'activated',
            userId: uid,
            activatedAt: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error("Error activating access key", error);
        return false;
    }
};

/**
 * Verifies an access key (Pass Key) for Staff via unified Access Keys.
 */
export const verifyAccessKey = async (passKey: string): Promise<{ uid: string, role: UserRole } | null> => {
    // 2. Fallback to Firebase
    const keysRef = collection(db, ACCESS_KEYS_COLLECTION);
    const q = query(keysRef, where('keyId', '==', passKey), where('status', '==', 'reusable'));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        return {
            uid: data.userId || `virtual_${passKey}`, // Provide virtual uid if staff hasn't fully registered
            role: data.role as UserRole
        };
    }

    return null;
};

export const seedFirebase = async () => {
    try {
        console.log("Cleaning Database...");
        const collectionsToClear = [
            NOMINEES_COLLECTION,
            ADMINS_COLLECTION,
            REU_COLLECTION,
            SCD_COLLECTION,
            EVALUATORS_COLLECTION,
            INVITES_COLLECTION,
            APPLICATIONS_COLLECTION,
            WINNERS_COLLECTION,
            EVALUATIONS_REVIEWS_COLLECTION,
            REQUIREMENTS_COLLECTION,
            AWARD_CATEGORIES_COLLECTION,
            SYSTEM_LOGS_COLLECTION,
            SETTINGS_COLLECTION
        ];

        for (const collName of collectionsToClear) {
            const collRef = collection(db, collName);
            const snapshot = await getDocs(collRef);
            await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, collName, d.id))));
            console.log(`Cleared ${collName}`);
        }

        console.log("Seeding Role-Specific Collections & Applications...");

        // ============================================
        // Seed Users, Staff, and Access Keys
        // ============================================

        const USERS_COLLECTION = 'users';
        const ACCESS_KEYS_COLLECTION = 'accessKeys';

        const rolesToSeed = [
            { email: 'admin@oshe.gov.ph', role: 'admin', coll: ADMINS_COLLECTION, region: 'NCR' },
            { email: 'reu@oshe.gov.ph', role: 'reu', coll: REU_COLLECTION, region: 'Region 1' },
            { email: 'scd@oshe.gov.ph', role: 'scd_team_leader', coll: SCD_COLLECTION, region: 'NCR' },
            { email: 'evaluator@oshe.gov.ph', role: 'evaluator', coll: EVALUATORS_COLLECTION, region: 'Region 2' },
        ];

        // Seed Staff inside legacy collections and the centralized Users + Access Keys collections
        for (const s of rolesToSeed) {
            const uid = `user_${s.role}_mock`;
            const keyId = `GKK-KEY-${s.role.toUpperCase()}`;

            // 1. Legacy separate collections
            await setDoc(doc(db, s.coll, uid), {
                id: uid,
                email: s.email,
                role: s.role,
                name: s.role.toUpperCase() + ' User',
                status: 'completed',
                createdAt: new Date().toISOString()
            });

            // 2. Centralized users collection
            await setDoc(doc(db, USERS_COLLECTION, uid), {
                userId: uid,
                email: s.email,
                role: s.role,
                name: s.role.toUpperCase() + ' User',
                status: 'active',
                createdAt: new Date().toISOString(),
                region: s.region
            });

            // 3. Centralized accessKeys collection
            await setDoc(doc(db, ACCESS_KEYS_COLLECTION, keyId), {
                keyId: keyId,
                userId: uid,
                role: s.role,
                status: 'activated',
                issuedAt: new Date().toISOString(),
                activatedAt: new Date().toISOString(),
                regId: keyId,
                email: s.email,
                name: s.role.toUpperCase() + ' User',
                region: s.region
            });
        }

        // Seed 1 Active Demo Nominee & Application
        const demoUid = 'user_demo_nominee';

        // Legacy Nominees Collection
        await setDoc(doc(db, NOMINEES_COLLECTION, demoUid), {
            id: demoUid,
            email: 'nominee@gkk.gov.ph',
            role: 'nominee',
            createdAt: new Date().toISOString()
        });

        // Centralized Users Collection
        await setDoc(doc(db, USERS_COLLECTION, demoUid), {
            userId: demoUid,
            email: 'nominee@gkk.gov.ph',
            role: 'nominee',
            name: 'Demo Manufacturing Corp',
            status: 'active',
            createdAt: new Date().toISOString(),
            region: 'NCR',
            nomineeCategory: 'Industry'
        });

        // Centralized AccessKeys Collection
        await setDoc(doc(db, ACCESS_KEYS_COLLECTION, 'NOM-2024-8821'), {
            keyId: 'NOM-2024-8821',
            userId: demoUid,
            role: 'nominee',
            status: 'activated',
            issuedAt: new Date().toISOString(),
            activatedAt: new Date().toISOString(),
            regId: 'NOM-2024-8821',
            email: 'nominee@gkk.gov.ph',
            name: 'Demo Manufacturing Corp',
            region: 'NCR'
        });

        await setDoc(doc(db, APPLICATIONS_COLLECTION, demoUid), {
            id: demoUid,
            applicationId: demoUid,
            nomineeId: demoUid,
            regId: 'NOM-2024-8821',
            role: 'nominee',
            status: 'in_progress',
            name: 'Demo Manufacturing Corp',
            organizationName: 'Demo Manufacturing Corp',
            email: 'nominee@gkk.gov.ph',
            focalEmail: 'nominee@gkk.gov.ph',
            industry: 'Manufacturing',
            industrySector: 'Manufacturing',
            region: 'NCR',
            category: 'industry',
            submittedDate: new Date().toISOString(),
            documents: []
        });

        // Seed 19 Unused Invites in legacy and AccessKeys
        for (let i = 2; i <= 20; i++) {
            const passKey = `GKK-2024-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
            const inviteId = `invite_${i}`;
            const invEmail = `invite_${i}@pending.gkk`;
            const invRegion = `Region ${i % 17 + 1}`;

            // Legacy invites
            await setDoc(doc(db, INVITES_COLLECTION, inviteId), {
                id: inviteId,
                regId: passKey,
                role: 'nominee_invite',
                status: 'unused',
                name: 'Pending Registration',
                email: invEmail,
                industry: 'Unspecified',
                region: invRegion,
                submittedDate: new Date().toISOString(),
                documents: []
            });

            // Centralized AccessKeys
            await setDoc(doc(db, ACCESS_KEYS_COLLECTION, passKey), {
                keyId: passKey,
                role: 'nominee',
                status: 'issued',
                issuedAt: new Date().toISOString(),
                regId: passKey,
                email: invEmail,
                name: 'Pending Registration',
                region: invRegion,
                industry: 'Unspecified'
            });
        }

        // Seed Winners
        for (const winner of INITIAL_GKK_WINNERS) {
            await setDoc(doc(collection(db, WINNERS_COLLECTION)), winner);
        }

        // ============================================
        // Seed Extended Schema (Compatibility Test)
        // ============================================

        // Seed Categories
        await setDoc(doc(db, AWARD_CATEGORIES_COLLECTION, 'cat_industry'), { categoryId: 'industry', name: 'Private Sector', description: 'Industry Sector Awards' });
        await setDoc(doc(db, AWARD_CATEGORIES_COLLECTION, 'cat_micro'), { categoryId: 'microEnterprises', name: 'Micro Enterprises', description: 'Small business awards' });

        // Seed Requirements for Industry (Comprehensive 35-item list)
        const industryRequirements = {
            categoryId: 'Industry',
            stage1: [
                { label: '1. Endorsement by DOLE Regional Office', category: 'Compliance' },
                { label: '2. Accomplished GKK Application Form', category: 'Compliance' },
                { label: '3. Company Safety and Health Policy', category: 'Systems' },
                { label: '4. Submitted OSH Program (with Receipt)', category: 'Compliance' },
                { label: '5. Proof of 8-hour OSH Orientation', category: 'Training' },
                { label: '6. Designation of Safety Officer (SO1–SO4)', category: 'Designation' },
                { label: '6a. Mandatory OSH training certificate', category: 'Designation' },
                { label: '6b. Advanced OSH training certificates', category: 'Designation' },
                { label: '7. Occupational Health Personnel designation', category: 'Designation' },
                { label: '7a. First Aid certificate', category: 'Designation' },
                { label: '13. DOLE Registration (Rule 1020)', category: 'Compliance' },
                { label: '20. Valid Fire Safety Certificate (FSIC)', category: 'Safety' },
                { label: '24. Proof of Compliance (SSS/PhilHealth)', category: 'Legal' }
            ],
            stage2: [
                { label: '8a. DOLE Reportorial Requirements (2024)', category: 'Compliance' },
                { label: '8b. DOLE Reportorial Requirements (2025)', category: 'Compliance' },
                { label: '9a. Signed undertaking (No fatality 2024)', category: 'Legal' },
                { label: '9b. Signed undertaking (No fatality 2025)', category: 'Legal' },
                { label: '10a. Work Environment Measurement (2024)', category: 'Systems' },
                { label: '10b. Work Environment Measurement (2025)', category: 'Systems' },
                { label: '11. Written Workplace Policies', category: 'Systems' },
                { label: '12. Risk-based Policy & Program', category: 'Systems' },
                { label: '14. List of Medical Facilities', category: 'Health' },
                { label: '15a. Signed HIRAC / Risk Assessment (2024)', category: 'Systems' },
                { label: '15b. Signed HIRAC / Risk Assessment (2025)', category: 'Systems' },
                { label: '16a. OSH Information Plan (2024)', category: 'Systems' },
                { label: '16b. OSH Information Plan (2025)', category: 'Systems' },
                { label: '17. Valid Permits to Operate', category: 'Safety' },
                { label: '18. Electrical Wiring Inspection', category: 'Safety' },
                { label: '19. Employees’ Compensation Logbook', category: 'Health' },
                { label: '21a. Fire Evacuation Drill (2024)', category: 'Safety' },
                { label: '21b. Fire Evacuation Drill (2025)', category: 'Safety' }
            ],
            stage3: [
                { label: '22a. CSR / Community Programs (2024)', category: 'Excellence' },
                { label: '22b. CSR / Community Programs (2025)', category: 'Excellence' },
                { label: '23a. OSH Budget (2024)', category: 'Management' },
                { label: '23b. OSH Budget (2025)', category: 'Management' },
                { label: '25. Environmental Laws Compliance', category: 'Legal' },
                { label: '33. Valid OSH-related Awards (ISO)', category: 'Excellence' },
                { label: '34. Industry-specific compliances', category: 'Compliance' },
                { label: '35. Additional documents', category: 'Other' }
            ]
        };

        const constructionAdditional = [
            { label: '26. Valid PCAB Registration', category: 'Construction' },
            { label: '27. CSHP (submitted & received)', category: 'Construction' },
            { label: '27a. DPWH-approved CSHP', category: 'Construction' },
            { label: '28. Actual Project Completion (S-curve)', category: 'Construction' },
            { label: '29. Valid CHE Testing', category: 'Construction' },
            { label: '30. TESDA Certification for CHE Operators', category: 'Construction' },
            { label: '31. Worker’s Skills Certification', category: 'Construction' },
            { label: '32. Temporary Welfare Facilities', category: 'Construction' }
        ];

        await setDoc(doc(db, REQUIREMENTS_COLLECTION, 'cat_industry'), industryRequirements);
        await setDoc(doc(db, REQUIREMENTS_COLLECTION, 'cat_construction'), {
            categoryId: 'Construction',
            stage1: [...industryRequirements.stage1],
            stage2: [...industryRequirements.stage2, ...constructionAdditional.slice(0, 4)],
            stage3: [...industryRequirements.stage3, ...constructionAdditional.slice(4)]
        });

        // Seed Settings
        await setDoc(doc(db, SETTINGS_COLLECTION, 'system_config'), {
            key: 'maintenance_mode',
            value: false
        });

        // Seed System Logs
        await setDoc(doc(db, SYSTEM_LOGS_COLLECTION, 'log_1'), {
            logId: 'log_1',
            userId: 'system',
            action: 'database_seed',
            details: 'Initial database structure generated.',
            timestamp: new Date().toISOString()
        });

        // Seed dummy evaluation for the demo app
        await setDoc(doc(db, EVALUATIONS_REVIEWS_COLLECTION, 'eval_demo_1'), {
            evaluationId: 'eval_demo_1',
            applicationId: demoUid,
            evaluatorId: 'user_reu_mock',
            role: 'reu',
            decision: 'Pass',
            remarks: 'Looks good',
            visibility: true,
            evaluatedAt: new Date().toISOString(),
            status: 'completed'
        });

        console.log(`Successfully seeded system accounts, winners, and extended schema.`);
        return true;
    } catch (err) {
        console.error("Failed to seed database:", err);
        return false;
    }
};
