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
 * Ensures a Firebase Auth session is active (silent anonymous sign-in).
 * Required for secure storage operations.
 */
export const ensureFirebaseAuth = async () => {
    if (auth.currentUser) {
        console.log("[AUTH TRACE] User already present:", auth.currentUser.uid);
        return auth.currentUser;
    }

    console.log("[AUTH TRACE] No user found, signing in anonymously...");

    // 10-second Auth Timeout
    const authPromise = signInAnonymously(auth);
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Authentication handshake timed out (10s). Please check your internet connection.")), 10000)
    );

    try {
        const result = (await Promise.race([authPromise, timeoutPromise])) as any;
        console.log("[AUTH TRACE] Silent Anonymous Auth Success:", result.user.uid);
        return result.user;
    } catch (e) {
        console.error("[AUTH TRACE] Silent Anonymous Auth Failed:", e);
        throw e;
    }
};

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
    // 1. Trace Auth State
    console.log("[STORAGE TRACE] Checking Auth...");
    const user = await ensureFirebaseAuth();
    console.log("[STORAGE TRACE] Auth User:", user?.uid || 'NONE', "isAnonymous:", user?.isAnonymous);

    const fileUid = `${uid}_${documentId}_${Date.now()}`;
    const storagePath = `nominee_docs/${uid}/${fileUid}_${file.name}`;
    console.log("[STORAGE TRACE] Starting upload to:", storagePath, "Size:", (file.size / 1024).toFixed(2), "KB");

    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    if (cancelToken) {
        cancelToken.cancel = () => {
            console.log("[STORAGE TRACE] Manual Cancellation Triggered");
            uploadTask.cancel();
        };
    }

    return new Promise((resolve, reject) => {
        let lastBytes = 0;
        let lastActiveTime = Date.now();

        // 15-second "No Progress" Timeout
        const timeoutInterval = setInterval(() => {
            if (Date.now() - lastActiveTime > 15000) {
                console.error("[STORAGE TRACE] TIMEOUT: No progress for 15s");
                clearInterval(timeoutInterval);
                uploadTask.cancel();
                reject(new Error("Upload timed out. Please check your network or Firebase Authentication status."));
            }
        }, 5000);

        uploadTask.on('state_changed',
            (snapshot) => {
                const currentBytes = snapshot.bytesTransferred;
                if (currentBytes > lastBytes) {
                    lastBytes = currentBytes;
                    lastActiveTime = Date.now(); // Reset timeout on actual progress
                }

                const progress = Math.round((currentBytes / snapshot.totalBytes) * 100);
                console.log(`[STORAGE TRACE] Progress: ${progress}% (${currentBytes}/${snapshot.totalBytes} bytes) - State: ${snapshot.state}`);

                if (onProgress) onProgress(progress);
            },
            (error: any) => {
                clearInterval(timeoutInterval);
                console.error("[STORAGE TRACE] FATAL ERROR:", error.code, error.message);

                let userFriendlyError = error.message;
                if (error.code === 'storage/unauthorized') {
                    userFriendlyError = "Unauthenticated. Please ensure Anonymous Auth is enabled in the Firebase Console.";
                } else if (error.code === 'storage/canceled' && (Date.now() - lastActiveTime > 15000)) {
                    userFriendlyError = "Upload connection stalled and was timed out.";
                }

                reject(new Error(userFriendlyError));
            },
            async () => {
                clearInterval(timeoutInterval);
                console.log("[STORAGE TRACE] Upload Complete! Fetching URL...");
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log("[STORAGE TRACE] Download URL retrieved.");
                    resolve(downloadURL);
                } catch (e) {
                    console.error("[STORAGE TRACE] URL Resolution Error:", e);
                    reject(e);
                }
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
 * This consolidates User profile and Application record creation.
 */
export const activateAccessKey = async (
    passKey: string,
    uid: string,
    details: { email: string; companyName: string; category: string }
): Promise<boolean> => {
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
            email: details.email,
            role: 'nominee',
            createdAt: new Date().toISOString(),
            status: 'active'
        });

        // 2. Pre-Create the Application document
        const appRef = doc(db, APPLICATIONS_COLLECTION, uid);
        await setDoc(appRef, {
            ...inviteData,
            applicationId: uid,
            nomineeId: uid,
            id: uid,
            name: details.companyName,
            email: details.email,
            industry: details.category,
            status: 'in_progress',
            role: 'nominee',
            activatedAt: new Date().toISOString(),
            documents: [],
            region: inviteData.region || 'NCR',
            round2Unlocked: false,
            round3Unlocked: false,
            details: {
                nomineeCategory: details.category,
                email: details.email,
                employees: '',
                address: '',
                representative: '',
                designation: '',
                phone: '',
                safetyOfficer: ''
            }
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


/**
 * Issues a new Access Key for a Nominee.
 */
export const issueAccessKey = async (data: { companyName: string, email: string, region: string }): Promise<string> => {
    try {
        // Generate a random high-entropy key
        const random = Math.floor(1000 + Math.random() * 9000).toString();
        const keyId = `GKK-2024-${data.companyName.substring(0, 3).toUpperCase()}-${random}`;

        await setDoc(doc(db, ACCESS_KEYS_COLLECTION, keyId), {
            keyId,
            role: 'nominee',
            status: 'issued',
            issuedAt: new Date().toISOString(),
            email: data.email,
            name: data.companyName,
            region: data.region
        });

        await logAction('ISSUE_KEY', `Issued key ${keyId} to ${data.companyName}`);
        return keyId;
    } catch (err) {
        console.error("Failed to issue key", err);
        throw err;
    }
};

/**
 * Fetches all access keys for management
 */
export const getAllAccessKeys = async () => {
    try {
        const keysRef = collection(db, ACCESS_KEYS_COLLECTION);
        const q = query(keysRef, where('role', '==', 'nominee'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (err) {
        console.error("Failed to fetch keys", err);
        return [];
    }
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

        // 2b. Pre-activated Demo Nominees (Access Key and Email)
        const demoNominees = [
            { uid: 'user_demo_8821', passKey: 'NOM-2024-8821', email: 'safety@acme-industrial.ph', name: 'Acme industrial Phils.' },
            { uid: 'user_demo_email', passKey: 'NOM-DEMO-EMAIL', email: 'nominee@gkk.gov.ph', name: 'Demo Nominee (Email Login)' }
        ];

        for (const demo of demoNominees) {
            await setDoc(doc(db, ACCESS_KEYS_COLLECTION, demo.passKey), {
                keyId: demo.passKey,
                userId: demo.uid,
                role: 'nominee',
                status: 'activated',
                activatedAt: new Date().toISOString(),
                email: demo.email,
                name: demo.name,
                region: 'Region IV-A'
            });

            await setDoc(doc(db, USERS_COLLECTION, demo.uid), {
                userId: demo.uid,
                email: demo.email,
                role: 'nominee',
                name: demo.name,
                status: 'active',
                createdAt: new Date().toISOString()
            });

            await setDoc(doc(db, APPLICATIONS_COLLECTION, demo.uid), {
                id: demo.uid,
                regId: demo.passKey,
                name: demo.name,
                email: demo.email,
                role: 'nominee',
                industry: 'Manufacturing',
                region: 'Region IV-A',
                status: 'in_progress',
                submittedDate: new Date().toISOString(),
                round2Unlocked: false, // FORCE UNLOCK STAGE 1
                round3Unlocked: false,
                documents: [],
                details: {
                    nomineeCategory: 'Industry',
                    employees: '250',
                    address: 'Batangas Industrial Park',
                    representative: 'Juan Dela Cruz',
                    designation: 'Safety Manager',
                    email: demo.email,
                    phone: '0917-123-4567',
                    safetyOfficer: 'Engr. Maria Clara'
                }
            });
        }

        // 3. Dynamic Requirements
        const stage1Reqs = [
            { category: 'Management', label: '1. Endorsement by DOLE Regional Office' },
            { category: 'Management', label: '2. Accomplished GKK Application Form' },
            { category: 'Systems', label: '3. Company Safety and Health Policy (Signed)' },
            { category: 'Systems', label: '4. OSH Program (Submitted + Full Copy)' },
            { category: 'Training', label: '5. Proof of 8-hour OSH Orientation' },
            { category: 'Designation', label: '6. Designation of Safety Officer (SO1-SO4)' },
            { category: 'Training', label: '6a. Mandatory OSH Training Certificate' },
            { category: 'Training', label: '6b. Advanced/Specialized OSH Training' },
            { category: 'Designation', label: '7. Occupational Health Personnel Designation' },
            { category: 'Training', label: '7a. OSH Training or First Aid Certificate' },
            { category: 'Compliance', label: '8a. DOLE Reportorial Requirements (2024)' },
            { category: 'Compliance', label: '8b. DOLE Reportorial Requirements (2025)' },
            { category: 'Legal', label: '9a. Signed Undertaking (No Fatality, 2024)' },
            { category: 'Legal', label: '9b. Signed Undertaking (No Fatality, 2025)' },
            { category: 'Health', label: '10a. Work Environment Measurement (2024)' },
            { category: 'Health', label: '10b. Work Environment Measurement (2025)' },
            { category: 'Systems', label: '11. Written Workplace Policies' },
            { category: 'Systems', label: '12. Risk-based Policy & Program' },
            { category: 'Legal', label: '13. DOLE-approved Registration (Rule 1020)' },
            { category: 'Health', label: '14. List of Medical Facilities & Medicines' },
            { category: 'Safety', label: '15a. Signed HIRAC / Risk Assessment (2024)' },
            { category: 'Safety', label: '15b. Signed HIRAC / Risk Assessment (2025)' },
            { category: 'Systems', label: '16a. OSH Information (2024)' },
            { category: 'Systems', label: '16b. OSH Information (2025)' },
            { category: 'Compliance', label: '17. Valid Permits to Operate (Boiler, etc.)' },
            { category: 'Safety', label: '18. Electrical Wiring Installation Inspection' },
            { category: 'Construction', label: '18a. Construction: LGU-issued Certificate' },
            { category: 'Legal', label: '19. Employees’ Compensation Logbook' },
            { category: 'Legal', label: '20. Valid Fire Safety Inspection Certificate' },
            { category: 'Construction', label: '20a. Construction: Fire Safety Evaluation' },
            { category: 'Safety', label: '21a. Fire Evacuation Drill Certificate (2024)' },
            { category: 'Safety', label: '21b. Fire Evacuation Drill Certificate (2025)' },
            { category: 'Excellence', label: '22a. CSR / Community Programs (2024)' },
            { category: 'Excellence', label: '22b. CSR / Community Programs (2025)' },
            { category: 'Management', label: '23a. OSH Budget (2024)' },
            { category: 'Management', label: '23b. OSH Budget (2025)' },
            { category: 'Compliance', label: '24. Proof of Compliance (SSS, PH, etc.)' },
            { category: 'Compliance', label: '25. Environmental Laws Compliance' },
            { category: 'Construction', label: '26. Valid PCAB Registration' },
            { category: 'Construction', label: '27. Original CSHP (Submitted & Received)' },
            { category: 'Construction', label: '27a. DPWH-approved CSHP' },
            { category: 'Construction', label: '28. Actual Project Completion (S-curve)' },
            { category: 'Construction', label: '29. Valid CHE Testing' },
            { category: 'Construction', label: '30. TESDA Certification for CHE Operators' },
            { category: 'Construction', label: '31. Worker’s Skills Certification' },
            { category: 'Construction', label: '31a. TESDA / Company Authorization' },
            { category: 'Construction', label: '32. Temporary Accommodation & Welfare' },
            { category: 'Excellence', label: '33. OSH-related Certifications / Awards' },
            { category: 'Compliance', label: '34. Industry-specific Compliances' },
            { category: 'General', label: '35. Additional Documents (Requested)' }
        ];

        // 3. Dynamic Requirements (Seeding for all common categories)
        const categoriesToSeed = ['industry', 'micro enterprise', 'government', 'individual'];
        for (const catId of categoriesToSeed) {
            await setDoc(doc(db, REQUIREMENTS_COLLECTION, `cat_${catId}`), {
                categoryId: `cat_${catId}`,
                categoryName: catId.charAt(0).toUpperCase() + catId.slice(1),
                lastUpdated: new Date().toISOString(),
                stage1: stage1Reqs,
                stage2: [],
                stage3: []
            });
        }

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

