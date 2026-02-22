import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, arrayUnion, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
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
export const createApplicant = async (uid: string, regId: string, name: string) => {
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
    await updateDoc(applicantRef, {
        documents: arrayUnion(document)
    });
};

/**
 * Encodes a file to Base64 and returns the Data URL.
 * We store this directly in Firestore to bypass disabled/unconfigured Firebase Storage buckets.
 */
export const uploadApplicantFile = async (uid: string, documentId: string, file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                if (reader.result.length > 800000) {
                    console.warn("Artifact size is large. Firestore may reject documents over 1MB.");
                }
                resolve(reader.result);
            } else {
                reject(new Error("Failed to encode file array"));
            }
        };
        reader.onerror = () => reject(new Error("File read interrupted"));
        reader.readAsDataURL(file);
    });
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
    return querySnapshot.docs.map(doc => {
        return {
            id: doc.id,
            ...doc.data()
        };
    });
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
