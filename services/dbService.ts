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
export const SYSTEM_LOGS_COLLECTION = 'system_logs';
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
 * Verifies an access key (Pass Key) for any user role via the unified Access Keys collection.
 */
export const verifyAccessKey = async (passKey: string): Promise<{ uid: string, role: UserRole, status: string } | null> => {
    try {
        const keysRef = collection(db, ACCESS_KEYS_COLLECTION);
        const q = query(keysRef, where('keyId', '==', passKey));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();
            return {
                uid: data.userId || `virtual_${passKey}`,
                role: data.role as UserRole,
                status: data.status
            };
        }
    } catch (err) {
        console.error("Key verification failed", err);
    }

    return null;
};

export const seedFirebase = async () => {
    try {
        console.log("Cleaning Database (Strict Minimal Schema)...");
        const collectionsToClear = [
            USERS_COLLECTION,
            ACCESS_KEYS_COLLECTION,
            APPLICATIONS_COLLECTION,
            REQUIREMENTS_COLLECTION,
            WINNERS_COLLECTION,
            SYSTEM_LOGS_COLLECTION
        ];

        for (const collName of collectionsToClear) {
            const collRef = collection(db, collName);
            const snapshot = await getDocs(collRef);
            await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, collName, d.id))));
            console.log(`Cleared ${collName}`);
        }

        console.log("Seeding Unified Database...");

        // 1. Staff Users & Keys
        const staffRoles = [
            { email: 'admin@oshe.gov.ph', role: 'admin', region: 'NCR' },
            { email: 'reu@oshe.gov.ph', role: 'reu', region: 'Region 1' },
            { email: 'scd@oshe.gov.ph', role: 'scd_team_leader', region: 'NCR' },
            { email: 'evaluator@oshe.gov.ph', role: 'evaluator', region: 'Region 2' },
        ];

        for (const s of staffRoles) {
            const uid = `user_${s.role}_mock`;
            const keyId = `GKK-KEY-${s.role.toUpperCase()}`;

            // Single Users Table
            await setDoc(doc(db, USERS_COLLECTION, uid), {
                userId: uid,
                email: s.email,
                role: s.role,
                name: s.role.toUpperCase() + ' User',
                status: 'active',
                createdAt: new Date().toISOString(),
                region: s.region
            });

            // Access Keys Table
            await setDoc(doc(db, ACCESS_KEYS_COLLECTION, keyId), {
                keyId: keyId,
                userId: uid,
                role: s.role,
                status: 'reusable', // Staff keys are reusable for tests
                issuedAt: new Date().toISOString(),
                activatedAt: new Date().toISOString(),
                email: s.email,
                name: s.role.toUpperCase() + ' User',
                region: s.region
            });
        }

        // 2. Nominee Activation Keys (5 Unused for activation testing)
        const activationKeys = ['ACT-001', 'ACT-002', 'ACT-003', 'ACT-004', 'ACT-005'];
        for (const key of activationKeys) {
            await setDoc(doc(db, ACCESS_KEYS_COLLECTION, key), {
                keyId: key,
                role: 'nominee',
                status: 'issued',
                issuedAt: new Date().toISOString(),
                region: 'NCR'
            });
        }

        // 3. Dynamic Requirements
        const stage1Reqs = [
            { category: 'Compliance', label: 'WAIR Report' },
            { category: 'Compliance', label: 'AEDR Report' },
            { category: 'Legal', label: 'Fire Safety Cert' },
            { category: 'Systems', label: 'OSH Policy' }
        ];

        await setDoc(doc(db, REQUIREMENTS_COLLECTION, 'cat_industry'), {
            categoryId: 'cat_industry',
            categoryName: 'Industry & Construction',
            lastUpdated: new Date().toISOString(),
            stage1: stage1Reqs,
            stage2: [],
            stage3: []
        });

        // 4. GKK Winners
        for (const winner of INITIAL_GKK_WINNERS) {
            await setDoc(doc(collection(db, WINNERS_COLLECTION)), winner);
        }

        console.log("Database successfully consolidated to 5 tables.");
        return true;
    } catch (err) {
        console.error("Failed to seed database:", err);
        return false;
    }
};

