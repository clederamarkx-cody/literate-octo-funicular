import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { db, storage, auth } from './firebase';
import { Nominee, NomineeDocument, UserRole } from '../types';
import { INITIAL_GKK_WINNERS } from '../constants';

// Collection references
export const NOMINEES_COLLECTION = 'nominees';
export const WINNERS_COLLECTION = 'gkk_winners';
export const FILES_COLLECTION = 'gkk_files'; // Metadata collection for Storage files if needed

/**
 * Creates a new user profile document directly in the NOMINEES collection
 */
export const createUserProfile = async (uid: string, email: string, role: UserRole) => {
    const nomineeRef = doc(db, NOMINEES_COLLECTION, uid);
    await setDoc(nomineeRef, {
        email,
        role,
        createdAt: new Date().toISOString(),
        documents: [],
        status: 'pending'
    }, { merge: true });
};

export const createNominee = async (uid: string, regId: string, name: string, nomineeCategory: Nominee['details']['nomineeCategory'], email: string) => {
    const nomineeDocRef = doc(db, NOMINEES_COLLECTION, uid);
    const newNominee: Nominee = {
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

    await setDoc(nomineeDocRef, newNominee);
    return newNominee;
};

/**
 * Fetches a nominee by their ID (which is their User UID)
 */
export const getNominee = async (uid: string): Promise<Nominee | null> => {
    const nomineeRef = doc(db, NOMINEES_COLLECTION, uid);
    const nomineeSnap = await getDoc(nomineeRef);


    if (nomineeSnap.exists()) {
        return nomineeSnap.data() as Nominee;
    }

    return null;
};

/**
 * Updates a nominee's profile
 */
export const updateNominee = async (uid: string, updates: Partial<Nominee>) => {
    const nomineeRef = doc(db, NOMINEES_COLLECTION, uid);
    const nomineeSnap = await getDoc(nomineeRef);

    if (!nomineeSnap.exists()) {
        // In a real app we might throw an error here, but for now we just proceed
        // to let updateDoc fail if the document doesn't exist
    }

    await updateDoc(nomineeRef, {
        ...updates,
        updatedAt: new Date().toISOString()
    });
};
/**
 * Adds an uploaded document to the nominee's record (implements Option A from schema)
 */
export const addNomineeDocument = async (uid: string, document: NomineeDocument) => {
    const nomineeRef = doc(db, NOMINEES_COLLECTION, uid);
    const nomineeSnap = await getDoc(nomineeRef);

    let nominee: Nominee;
    if (!nomineeSnap.exists()) {
        // In a real flow, this shouldn't happen without a parent doc, but just return early
        return;
    } else {
        nominee = nomineeSnap.data() as Nominee;
    }

    const existingDocs = nominee.documents || [];

    // Filter out previous version of this slot if it exists to avoid duplicates
    const updatedDocs = existingDocs.filter(d => d.slotId !== document.slotId);
    updatedDocs.push(document);

    await updateDoc(nomineeRef, {
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
 * Since we now use native Storage URLs, we simply return the string.
 */
export const resolveFileUrl = async (url: string | null | undefined): Promise<string> => {
    return url || '';
};

/**
 * Fetches all nominees (Used by Evaluators/Admins)
 */
export const getAllNominees = async (): Promise<Nominee[]> => {
    const nomineesRef = collection(db, NOMINEES_COLLECTION);
    const querySnapshot = await getDocs(nomineesRef);
    const firestoreNominees = querySnapshot.docs.map(doc => doc.data() as Nominee);

    return firestoreNominees;
};

/**
 * Fetches a user's role
 */
export const getUserRole = async (uid: string): Promise<UserRole | null> => {
    const nomineeRef = doc(db, NOMINEES_COLLECTION, uid);
    const nomineeSnap = await getDoc(nomineeRef);

    if (nomineeSnap.exists()) {
        return nomineeSnap.data().role;
    }
    return null;
};

/**
 * Updates the evaluation verdict for a specific stage
 */
export const updateStageVerdict = async (nomineeId: string, stage: 1 | 2 | 3, verdict: 'Pass' | 'Fail') => {
    try {
        const nomineeRef = doc(db, NOMINEES_COLLECTION, nomineeId);
        const updateData: Partial<Nominee> = {};

        switch (stage) {
            case 1: updateData.stage1Verdict = verdict; break;
            case 2: updateData.stage2Verdict = verdict; break;
            case 3: updateData.stage3Verdict = verdict; break;
        }

        await updateDoc(nomineeRef, updateData);
        return true;
    } catch (error) {
        console.error(`Error updating stage ${stage} verdict:`, error);
        return false;
    }
};

/**
 * Simulates authentication by finding a user by email
 */
export const getUserByEmail = async (email: string): Promise<{ uid: string, role: UserRole } | null> => {
    const nomineesRef = collection(db, NOMINEES_COLLECTION);
    const q = query(nomineesRef, where('email', '==', email));

    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            return {
                uid: docSnap.id,
                role: docSnap.data().role
            };
        }
    } catch (error) {
        console.error("Error querying user by email", error);
    }

    return null;
};

/**
 * Fetches all GKK Winners records
 */
export const getGKKWinners = async (): Promise<any[]> => {
    const winnersRef = collection(db, WINNERS_COLLECTION);
    const querySnapshot = await getDocs(winnersRef);
    const firestoreWinners = querySnapshot.docs.map(doc => {
        return {
            id: doc.id,
            ...doc.data()
        };
    });

    if (firestoreWinners.length > 0) {
        return firestoreWinners;
    }

    // Fallback if not seeded yet
    return INITIAL_GKK_WINNERS;
};
/**
 * Fetches a nominee by their registration/invitation key (Pass Key)
 */
export const getNomineeByPassKey = async (passKey: string): Promise<Nominee | null> => {
    const nomineesRef = collection(db, NOMINEES_COLLECTION);
    const q = query(nomineesRef, where('regId', '==', passKey));

    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as Nominee;
        }
    } catch (error) {
        console.error("Error querying nominee by pass key", error);
    }

    return null;
};

/**
 * Validates and activates an unused PassKey for a new Nominee.
 * PassKeys are now stored directly in the NOMINEES collection with status 'unused'.
 */
export const activateAccessKey = async (passKey: string, uid: string): Promise<boolean> => {
    try {
        const nomineesRef = collection(db, NOMINEES_COLLECTION);
        const q = query(nomineesRef, where('regId', '==', passKey), where('status', '==', 'unused'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return false;
        }

        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
            status: 'in_progress',
            id: uid, // Update the draft ID to the actual UID
            activatedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error("Error activating access key", error);
        return false;
    }
};

/**
 * Verifies an access key (Pass Key) for Staff (REU, SCD, Admin, Evaluator).
 * These are now profiles in the NOMINEES collection with specific roles.
 */
export const verifyAccessKey = async (passKey: string): Promise<{ uid: string, role: UserRole } | null> => {
    try {
        const nomineesRef = collection(db, NOMINEES_COLLECTION);
        const q = query(nomineesRef, where('regId', '==', passKey));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();
            // Only return if it's NOT a nominee_invite (staff roles)
            if (data.role !== 'nominee_invite') {
                return {
                    uid: docSnap.id,
                    role: data.role
                };
            }
        }
    } catch (error) {
        console.error("Error verifying staff access key", error);
    }
    return null;
};

export const seedFirebase = async () => {
    try {
        console.log("Cleaning Database...");
        const clearCollection = async (collectionName: string) => {
            const collRef = collection(db, collectionName);
            const snapshot = await getDocs(collRef);
            const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, collectionName, docSnap.id)));
            await Promise.all(deletePromises);
            console.log(`Cleared ${collectionName}`);
        };

        // Clear only the 2 Firestore tables
        await clearCollection(NOMINEES_COLLECTION);
        await clearCollection(WINNERS_COLLECTION);

        console.log("Seeding Consolidated NOMINEES collection...");

        // Seed Staff Profiles as Nominee documents
        const staff = [
            { id: 'user_reu_mock', email: 'reu@oshe.gov.ph', role: 'reu', regId: 'GKK-KEY-REU' },
            { id: 'user_scd_mock', email: 'scd@oshe.gov.ph', role: 'scd', regId: 'GKK-KEY-SCD' },
            { id: 'user_admin_mock', email: 'admin@oshe.gov.ph', role: 'admin', regId: 'GKK-KEY-ADMIN' },
            { id: 'user_evaluator_mock', email: 'evaluator@oshe.gov.ph', role: 'evaluator', regId: 'GKK-KEY-EVAL' }
        ];

        for (const s of staff) {
            await setDoc(doc(db, NOMINEES_COLLECTION, s.id), {
                ...s,
                name: s.role.toUpperCase() + ' User',
                status: 'completed', // Staff accounts are fully active
                createdAt: new Date().toISOString()
            });
        }

        // Generate 20 Unused PassKeys as "Nominee Invites"
        for (let i = 1; i <= 20; i++) {
            const randomPart1 = Math.floor(1000 + Math.random() * 9000);
            const randomPart2 = Math.floor(1000 + Math.random() * 9000);
            const passKey = `GKK-2024-${randomPart1}-${randomPart2}`;

            const inviteId = `invite_${i}`;
            await setDoc(doc(db, NOMINEES_COLLECTION, inviteId), {
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

        // Seed GKK Winners
        for (const winner of INITIAL_GKK_WINNERS) {
            const newDocRef = doc(collection(db, WINNERS_COLLECTION));
            await setDoc(newDocRef, winner);
        }

        console.log(`Successfully seeded system accounts and winners.`);
        return true;
    } catch (err) {
        console.error("Failed to seed database:", err);
        return false;
    }
};
