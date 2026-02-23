import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { db, storage, auth } from './firebase';
import { Nominee, NomineeDocument, UserRole } from '../types';
import { INITIAL_GKK_WINNERS } from '../constants';

// Collection references
export const NOMINEES_COLLECTION = 'nominees';
export const ADMINS_COLLECTION = 'admins';
export const REU_COLLECTION = 'reu';
export const SCD_COLLECTION = 'scd';
export const EVALUATORS_COLLECTION = 'evaluators';
export const INVITES_COLLECTION = 'invites';
export const APPLICATIONS_COLLECTION = 'applications';
export const WINNERS_COLLECTION = 'gkk_winners';
export const FILES_COLLECTION = 'gkk_files';

/**
 * Helper to get collection name from role
 */
const getCollectionForRole = (role: UserRole | 'nominee_invite'): string => {
    switch (role) {
        case 'admin': return ADMINS_COLLECTION;
        case 'reu': return REU_COLLECTION;
        case 'scd_team_leader': return SCD_COLLECTION;
        case 'evaluator': return EVALUATORS_COLLECTION;
        case 'nominee': return NOMINEES_COLLECTION;
        case 'nominee_invite': return INVITES_COLLECTION;
        default: return NOMINEES_COLLECTION;
    }
};

/**
 * Creates a new user profile document in the correct collection
 */
export const createUserProfile = async (uid: string, email: string, role: UserRole) => {
    const collectionName = getCollectionForRole(role);
    const userRef = doc(db, collectionName, uid);
    await setDoc(userRef, {
        email,
        role,
        createdAt: new Date().toISOString(),
        status: role === 'nominee' ? 'pending' : 'completed'
    }, { merge: true });
};

export const createNominee = async (uid: string, regId: string, name: string, nomineeCategory: Nominee['details']['nomineeCategory'], email: string) => {
    // 1. Create/Update user profile in nominees
    const nomineeDocRef = doc(db, NOMINEES_COLLECTION, uid);
    await setDoc(nomineeDocRef, {
        id: uid,
        email,
        role: 'nominee',
        createdAt: new Date().toISOString()
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
    const appRef = doc(db, APPLICATIONS_COLLECTION, uid);
    await updateDoc(appRef, {
        ...updates,
        updatedAt: new Date().toISOString()
    });
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
 * Fetches a user's role by checking all role-specific collections
 */
export const getUserRole = async (uid: string): Promise<UserRole | null> => {
    const collections = [ADMINS_COLLECTION, REU_COLLECTION, SCD_COLLECTION, EVALUATORS_COLLECTION, NOMINEES_COLLECTION];

    for (const coll of collections) {
        const userRef = doc(db, coll, uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data().role as UserRole;
        }
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
        return true;
    } catch (error) {
        console.error(`Error updating stage ${stage} verdict:`, error);
        return false;
    }
};

/**
 * Simulates authentication by finding a user by email across all relevant collections
 */
export const getUserByEmail = async (email: string): Promise<{ uid: string, role: UserRole } | null> => {
    const collections = [ADMINS_COLLECTION, REU_COLLECTION, SCD_COLLECTION, EVALUATORS_COLLECTION, NOMINEES_COLLECTION];

    for (const collName of collections) {
        const collRef = collection(db, collName);
        const q = query(collRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            return {
                uid: docSnap.id,
                role: docSnap.data().role
            };
        }
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
 * Checks both APPLICATIONS and INVITES collections.
 */
export const getNomineeByPassKey = async (passKey: string): Promise<Nominee | null> => {
    // Check active applications
    const appsRef = collection(db, APPLICATIONS_COLLECTION);
    const q1 = query(appsRef, where('regId', '==', passKey));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) return snap1.docs[0].data() as Nominee;

    // Check unused invites
    const invitesRef = collection(db, INVITES_COLLECTION);
    const q2 = query(invitesRef, where('regId', '==', passKey));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) return snap2.docs[0].data() as Nominee;

    return null;
};

/**
 * Validates and activates an unused PassKey for a new Nominee Application.
 */
export const activateAccessKey = async (passKey: string, uid: string): Promise<boolean> => {
    try {
        const invitesRef = collection(db, INVITES_COLLECTION);
        const q = query(invitesRef, where('regId', '==', passKey), where('status', '==', 'unused'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return false;

        const inviteDoc = querySnapshot.docs[0];
        const inviteData = inviteDoc.data();

        // 1. Create the official Nominee profile
        const nomineeRef = doc(db, NOMINEES_COLLECTION, uid);
        await setDoc(nomineeRef, {
            email: inviteData.email,
            role: 'nominee',
            createdAt: new Date().toISOString(),
            id: uid
        });

        // 2. Create the Application document
        const appRef = doc(db, APPLICATIONS_COLLECTION, uid);
        await setDoc(appRef, {
            ...inviteData,
            id: uid,
            status: 'in_progress',
            activatedAt: new Date().toISOString(),
            role: 'nominee'
        });

        // 3. Delete the invite record
        await deleteDoc(inviteDoc.ref);

        return true;
    } catch (error) {
        console.error("Error activating access key", error);
        return false;
    }
};

/**
 * Verifies an access key (Pass Key) for Staff across role-specific collections.
 */
export const verifyAccessKey = async (passKey: string): Promise<{ uid: string, role: UserRole } | null> => {
    const collections = [ADMINS_COLLECTION, REU_COLLECTION, SCD_COLLECTION, EVALUATORS_COLLECTION];

    for (const collName of collections) {
        const collRef = collection(db, collName);
        const q = query(collRef, where('regId', '==', passKey));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            return {
                uid: docSnap.id,
                role: docSnap.data().role
            };
        }
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
            WINNERS_COLLECTION
        ];

        for (const collName of collectionsToClear) {
            const collRef = collection(db, collName);
            const snapshot = await getDocs(collRef);
            await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, collName, d.id))));
            console.log(`Cleared ${collName}`);
        }

        console.log("Seeding Role-Specific Collections & Applications...");

        // Seed Staff
        const staffDocs = [
            { id: 'user_reu_mock', email: 'reu@oshe.gov.ph', role: 'reu', regId: 'GKK-KEY-REU', coll: REU_COLLECTION },
            { id: 'user_scd_mock', email: 'scd@oshe.gov.ph', role: 'scd_team_leader', regId: 'GKK-KEY-SCD', coll: SCD_COLLECTION },
            { id: 'user_admin_mock', email: 'admin@oshe.gov.ph', role: 'admin', regId: 'GKK-KEY-ADMIN', coll: ADMINS_COLLECTION },
            { id: 'user_evaluator_mock', email: 'evaluator@oshe.gov.ph', role: 'evaluator', regId: 'GKK-KEY-EVAL', coll: EVALUATORS_COLLECTION }
        ];

        for (const s of staffDocs) {
            const { coll, ...data } = s;
            await setDoc(doc(db, coll, s.id), {
                ...data,
                name: s.role.toUpperCase() + ' User',
                status: 'completed',
                createdAt: new Date().toISOString()
            });
        }

        // Seed 1 Active Demo Nominee & Application
        const demoUid = 'user_demo_nominee';
        await setDoc(doc(db, NOMINEES_COLLECTION, demoUid), {
            id: demoUid,
            email: 'nominee@gkk.gov.ph',
            role: 'nominee',
            createdAt: new Date().toISOString()
        });

        await setDoc(doc(db, APPLICATIONS_COLLECTION, demoUid), {
            id: demoUid,
            regId: 'NOM-2024-8821',
            role: 'nominee',
            status: 'in_progress',
            name: 'Demo Manufacturing Corp',
            email: 'nominee@gkk.gov.ph',
            industry: 'Manufacturing',
            region: 'NCR',
            submittedDate: new Date().toISOString(),
            documents: []
        });

        // Seed 19 Unused Invites
        for (let i = 2; i <= 20; i++) {
            const passKey = `GKK-2024-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
            const inviteId = `invite_${i}`;
            await setDoc(doc(db, INVITES_COLLECTION, inviteId), {
                id: inviteId,
                regId: passKey,
                role: 'nominee_invite',
                status: 'unused',
                name: 'Pending Registration',
                email: `invite_${i}@pending.gkk`,
                industry: 'Unspecified',
                region: `Region ${i % 17 + 1}`,
                submittedDate: new Date().toISOString(),
                documents: []
            });
        }

        // Seed Winners
        for (const winner of INITIAL_GKK_WINNERS) {
            await setDoc(doc(collection(db, WINNERS_COLLECTION)), winner);
        }

        console.log(`Successfully seeded system accounts and winners.`);
        return true;
    } catch (err) {
        console.error("Failed to seed database:", err);
        return false;
    }
};
