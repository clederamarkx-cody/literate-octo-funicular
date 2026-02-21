import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Applicant, ApplicantDocument, UserRole } from '../types';
import { INITIAL_APPLICANTS } from '../constants';

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
