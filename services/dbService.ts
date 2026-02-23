import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { db, storage, auth } from './firebase';
import { Applicant, ApplicantDocument, UserRole } from '../types';
import { INITIAL_APPLICANTS, INITIAL_HALL_OF_FAME } from '../constants';

// Collection references
export const USERS_COLLECTION = 'users';
export const APPLICANTS_COLLECTION = 'applicants';

/**
 * Creates a new user profile document in Firestore
 */
export const createUserProfile = async (uid: string, email: string, role: UserRole) => {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(userRef, {
        email,
        role,
        createdAt: new Date().toISOString()
    });
};

/**
 * Creates a new applicant/nominee document linked to a user
 */
export const createApplicant = async (uid: string, regId: string, name: string, nomineeCategory: Applicant['details']['nomineeCategory']) => {
    const applicantRef = doc(db, APPLICANTS_COLLECTION, uid); // Using uid as applicantId for 1-to-1 mapping
    const newApplicant: Applicant = {
        id: uid,
        regId,
        name,
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

    await setDoc(applicantRef, newApplicant);
    return newApplicant;
};

/**
 * Fetches an applicant by their ID (which is their User UID)
 */
export const getApplicant = async (uid: string): Promise<Applicant | null> => {
    const applicantRef = doc(db, APPLICANTS_COLLECTION, uid);
    const applicantSnap = await getDoc(applicantRef);


    if (applicantSnap.exists()) {
        return applicantSnap.data() as Applicant;
    }

    // Fallback for mock users
    const mockApplicant = INITIAL_APPLICANTS.find(a => a.id === uid);
    if (mockApplicant) return mockApplicant;

    return null;
};

/**
 * Updates an applicant's profile
 */
export const updateApplicant = async (uid: string, updates: Partial<Applicant>) => {
    const applicantRef = doc(db, APPLICANTS_COLLECTION, uid);
    const applicantSnap = await getDoc(applicantRef);

    if (!applicantSnap.exists()) {
        // Fallback: If it's a mock user not in Firebase, create it on the fly
        const mockApplicant = INITIAL_APPLICANTS.find(a => a.id === uid);
        if (mockApplicant) {
            await setDoc(applicantRef, mockApplicant);
        }
    }

    await updateDoc(applicantRef, {
        ...updates,
        updatedAt: new Date().toISOString()
    });
};
/**
 * Adds an uploaded document to the applicant's record (implements Option A from schema)
 */
export const addApplicantDocument = async (uid: string, document: ApplicantDocument) => {
    const applicantRef = doc(db, APPLICANTS_COLLECTION, uid);
    const applicantSnap = await getDoc(applicantRef);

    let applicant: Applicant;
    if (!applicantSnap.exists()) {
        // Fallback: If it's a mock user not in Firebase, create it on the fly
        const mockApplicant = INITIAL_APPLICANTS.find(a => a.id === uid);
        if (mockApplicant) {
            await setDoc(applicantRef, mockApplicant);
            applicant = mockApplicant;
        } else {
            return;
        }
    } else {
        applicant = applicantSnap.data() as Applicant;
    }

    const existingDocs = applicant.documents || [];

    // Filter out previous version of this slot if it exists to avoid duplicates
    const updatedDocs = existingDocs.filter(d => d.slotId !== document.slotId);
    updatedDocs.push(document);

    await updateDoc(applicantRef, {
        documents: updatedDocs
    });
};

/**
 * Uploads a file directly to Firebase Cloud Storage with streaming progress.
 */
export const uploadApplicantFile = async (
    uid: string,
    documentId: string,
    file: File,
    onProgress?: (progress: number) => void,
    cancelToken?: { cancel?: () => void }
): Promise<string> => {
    try {
        await signInAnonymously(auth);
    } catch (e) {
        console.warn("Anonymous sign-in failed. Proceeding without auth.", e);
    }

    return new Promise((resolve, reject) => {
        const fileExtension = file.name.split('.').pop() || 'pdf';
        const filePath = `applicants/${uid}/${documentId}_${Date.now()}.${fileExtension}`;
        const storageRef = ref(storage, filePath);

        const uploadTask = uploadBytesResumable(storageRef, file);

        let timeoutId = setTimeout(() => {
            uploadTask.cancel();
            reject(new Error("Upload timed out (15s). This is usually caused by missing CORS configuration on the Firebase Storage bucket."));
        }, 15000);

        if (cancelToken) {
            cancelToken.cancel = () => {
                clearTimeout(timeoutId);
                uploadTask.cancel();
                reject(new Error("Upload cancelled by user"));
            };
        }

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(Math.floor(progress));
            },
            (error) => {
                clearTimeout(timeoutId);
                console.error("Firebase Storage upload failed", error);
                reject(error);
            },
            async () => {
                try {
                    clearTimeout(timeoutId);
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadUrl);
                } catch (err) {
                    clearTimeout(timeoutId);
                    reject(err);
                }
            }
        );
    });
};

/**
 * Dynamically resolves File URLs. If the file is a legacy chunked file,
 * it reconstructs it from Firestore. Otherwise, it simply returns the HTTP url.
 */
export const resolveFileUrl = async (url: string | null | undefined): Promise<string> => {
    if (!url) return '';
    if (!url.startsWith('gkk-file://')) return url;

    const fileUid = url.replace('gkk-file://', '');
    const fileRef = doc(db, 'gkk_files', fileUid);
    const fileSnap = await getDoc(fileRef);

    if (!fileSnap.exists()) throw new Error("File not found in database");

    const { totalChunks, type } = fileSnap.data();
    let completeBase64 = '';

    for (let i = 0; i < totalChunks; i++) {
        const chunkRef = doc(db, `gkk_files/${fileUid}/chunks`, i.toString());
        const chunkSnap = await getDoc(chunkRef);
        if (chunkSnap.exists()) {
            completeBase64 += chunkSnap.data().data;
        }
    }

    // Extract raw base64 and create a Blob
    const parts = completeBase64.split(',');
    const b64Data = parts[1] || parts[0];
    const contentType = type || 'application/pdf';

    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return URL.createObjectURL(blob);
};

/**
 * Fetches all applicants (Used by Evaluators/Admins)
 */
export const getAllApplicants = async (): Promise<Applicant[]> => {
    const applicantsRef = collection(db, APPLICANTS_COLLECTION);
    const querySnapshot = await getDocs(applicantsRef);
    const firestoreApplicants = querySnapshot.docs.map(doc => doc.data() as Applicant);

    // Merge with initial applicants (ensuring no duplicates by ID)
    const allApplicants = [...firestoreApplicants];
    INITIAL_APPLICANTS.forEach(mock => {
        if (!allApplicants.some(a => a.id === mock.id)) {
            allApplicants.push(mock);
        }
    });

    return allApplicants;
};

/**
 * Fetches a user's role
 */
export const getUserRole = async (uid: string): Promise<UserRole | null> => {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data().role;
    }
    return null;
};

/**
 * Updates the evaluation verdict for a specific stage
 */
export const updateStageVerdict = async (applicantId: string, stage: 1 | 2 | 3, verdict: 'Pass' | 'Fail') => {
    try {
        const applicantRef = doc(db, APPLICANTS_COLLECTION, applicantId);
        const updateData: Partial<Applicant> = {};

        switch (stage) {
            case 1: updateData.stage1Verdict = verdict; break;
            case 2: updateData.stage2Verdict = verdict; break;
            case 3: updateData.stage3Verdict = verdict; break;
        }

        await updateDoc(applicantRef, updateData);
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
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('email', '==', email));

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
 * Fetches all Hall of Fame records
 */
export const getHallOfFame = async (): Promise<any[]> => {
    const hofRef = collection(db, 'hall_of_fame');
    const querySnapshot = await getDocs(hofRef);
    const firestoreHof = querySnapshot.docs.map(doc => {
        return {
            id: doc.id,
            ...doc.data()
        };
    });

    if (firestoreHof.length > 0) {
        return firestoreHof;
    }

    // Fallback if not seeded yet
    return INITIAL_HALL_OF_FAME;
};
/**
 * Fetches an applicant by their registration/invitation key (Pass Key)
 */
export const getApplicantByPassKey = async (passKey: string): Promise<Applicant | null> => {
    const applicantsRef = collection(db, APPLICANTS_COLLECTION);
    const q = query(applicantsRef, where('regId', '==', passKey));

    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as Applicant;
        }
    } catch (error) {
        console.error("Error querying applicant by pass key", error);
    }

    // Fallback for mock users
    const mockApplicant = INITIAL_APPLICANTS.find(a => a.regId === passKey);
    if (mockApplicant) return mockApplicant;

    return null;
};

/**
 * Validates and activates an unused Access Key for a new Nominee
 */
export const activateAccessKey = async (passKey: string, uid: string): Promise<boolean> => {
    try {
        const keysRef = collection(db, 'access_keys');
        const q = query(keysRef, where('key', '==', passKey), where('status', '==', 'unused'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return false; // Key does not exist or is already used
        }

        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
            status: 'used',
            uid: uid,
            role: 'applicant', // Upgrades the key from nominee_invite to full applicant
            activatedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error("Error activating access key", error);
        return false;
    }
};

/**
 * Verifies an access key (Pass Key) for Evaluators/Admins
 * Returns the evaluator's user record if valid
 */
export const verifyAccessKey = async (passKey: string): Promise<{ uid: string, role: UserRole } | null> => {
    try {
        const keysRef = collection(db, 'access_keys');
        const q = query(keysRef, where('key', '==', passKey));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();
            return {
                uid: data.uid,
                role: data.role
            };
        }
    } catch (error) {
        console.error("Error verifying generic access key", error);
    }
    return null;
};

/**
 * DEVELOPMENT ONLY: Seeds the database with the initial mock applicants and evaluator accounts
 */
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

        await clearCollection(USERS_COLLECTION);
        await clearCollection(APPLICANTS_COLLECTION);
        await clearCollection('access_keys');
        await clearCollection('hall_of_fame');

        console.log("Seeding Firebase database...");
        let count = 0;

        for (const applicant of INITIAL_APPLICANTS) {
            // Create user profile
            const role = applicant.id.includes('mock') ? 'evaluator' : 'applicant';
            await createUserProfile(applicant.id, applicant.details.email.toLowerCase(), role as UserRole);

            // Create applicant record
            const applicantRef = doc(db, APPLICANTS_COLLECTION, applicant.id);
            await setDoc(applicantRef, applicant);

            // Create access key for applicant using their regId
            const keysRef = collection(db, 'access_keys');
            await setDoc(doc(keysRef, `key_${applicant.id}`), { key: applicant.regId, uid: applicant.id, role });

            count++;
        }

        // Seed Specific Role Profiles
        await createUserProfile('user_reu_mock', 'reu@oshe.gov.ph', 'reu');
        await createUserProfile('user_scd_mock', 'scd@oshe.gov.ph', 'scd');
        await createUserProfile('user_admin_mock', 'admin@oshe.gov.ph', 'admin');
        await createUserProfile('user_evaluator_mock', 'evaluator@oshe.gov.ph', 'evaluator');

        // Seed Associated Access Keys
        const keysRef = collection(db, 'access_keys');
        await setDoc(doc(keysRef, 'key_reu'), { key: 'GKK-KEY-REU', uid: 'user_reu_mock', role: 'reu' });
        await setDoc(doc(keysRef, 'key_scd'), { key: 'GKK-KEY-SCD', uid: 'user_scd_mock', role: 'scd' });
        await setDoc(doc(keysRef, 'key_admin'), { key: 'GKK-KEY-ADMIN', uid: 'user_admin_mock', role: 'admin' });
        await setDoc(doc(keysRef, 'key_eval'), { key: 'GKK-KEY-EVAL', uid: 'user_evaluator_mock', role: 'evaluator' });

        // Generate 20 Unused Registration Access Keys in the format GKK-2024-XXXX-XXXX
        for (let i = 1; i <= 20; i++) {
            const randomPart1 = Math.floor(1000 + Math.random() * 9000);
            const randomPart2 = Math.floor(1000 + Math.random() * 9000);
            const mockInviteKey = `GKK-2024-${randomPart1}-${randomPart2}`;

            // These keys have no attached explicit uid yet. When a nominee registers, 
            // the system creates the uid and consumes the key. For now, we seed them as 'unassigned_nominee_key'
            await setDoc(doc(keysRef, `key_invite_${i}`), {
                key: mockInviteKey,
                role: 'nominee_invite',
                status: 'unused',
                generatedFor: `Mock Region ${i % 3 + 1}` // Just to give them some data
            });
        }

        // Seed Hall of Fame
        const hofCollection = collection(db, 'hall_of_fame');
        for (const winner of INITIAL_HALL_OF_FAME) {
            const newDocRef = doc(hofCollection);
            await setDoc(newDocRef, winner);
        }

        console.log(`Successfully seeded ${count} applicants, evaluators, and hall of fame.`);
        return true;
    } catch (err) {
        console.error("Failed to seed database:", err);
        return false;
    }
};
