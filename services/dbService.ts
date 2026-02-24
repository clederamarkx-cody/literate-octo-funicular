import { Nominee, NomineeDocument, UserRole } from '../types';
import { INITIAL_GKK_WINNERS } from '../constants';

// --- MOCK DATABASE ENGINE (localStorage) ---

const DB_PREFIX = 'gkk_app_';

const db = {
    get: (collection: string) => {
        const data = localStorage.getItem(DB_PREFIX + collection);
        return data ? JSON.parse(data) : {};
    },
    save: (collection: string, data: any) => {
        localStorage.setItem(DB_PREFIX + collection, JSON.stringify(data));
    },
    doc: (collection: string, id: string) => {
        const col = db.get(collection);
        return col[id] || null;
    },
    setDoc: (collection: string, id: string, data: any, merge = false) => {
        const col = db.get(collection);
        if (merge) {
            col[id] = { ...(col[id] || {}), ...data };
        } else {
            col[id] = data;
        }
        db.save(collection, col);
    },
    deleteDoc: (collection: string, id: string) => {
        const col = db.get(collection);
        delete col[id];
        db.save(collection, col);
    },
    query: (collection: string, predicate: (item: any) => boolean) => {
        const col = db.get(collection);
        return Object.values(col).filter(predicate);
    }
};

// --- MOCK AUTH ENGINE ---

let currentUser: { uid: string; email: string; isAnonymous: boolean } | null = null;

export const auth = {
    get currentUser() { return currentUser; },
    onAuthStateChanged: (callback: (user: any) => void) => {
        callback(currentUser);
        return () => { }; // Unsubscribe
    }
};

export const ensureLocalAuth = async () => {
    if (currentUser) return currentUser;
    currentUser = { uid: 'local_user_' + Math.random().toString(36).substr(2, 9), email: 'anonymous@local', isAnonymous: true };
    console.log("[MOCK AUTH] Signed in as:", currentUser.uid);
    return currentUser;
};

// --- COLLECTION NAMES ---

export const USERS_COLLECTION = 'users';
export const ACCESS_KEYS_COLLECTION = 'accessKeys';
export const APPLICATIONS_COLLECTION = 'applications';
export const REQUIREMENTS_COLLECTION = 'requirements';
export const WINNERS_COLLECTION = 'gkk_winners';
export const SYSTEM_LOGS_COLLECTION = 'system_logs';

export const TEST_MODE = false;

// --- STANDARDIZED API ---

export const logAction = async (action: string, details: string, appId?: string) => {
    const logId = `log_${Date.now()}`;
    db.setDoc(SYSTEM_LOGS_COLLECTION, logId, {
        logId,
        userId: currentUser?.uid || 'system',
        action,
        details,
        applicationId: appId || 'n/a',
        timestamp: new Date().toISOString()
    });
};

export const getRequirementsByCategory = async (category: string) => {
    const data = db.doc(REQUIREMENTS_COLLECTION, `cat_${category.toLowerCase()}`);
    if (data) return data;
    return db.doc(REQUIREMENTS_COLLECTION, 'cat_industry');
};

export const isValidRole = (role: string): role is UserRole => {
    return ['admin', 'reu', 'scd_team_leader', 'evaluator', 'nominee'].includes(role);
};

export const createUserProfile = async (uid: string, email: string, role: UserRole) => {
    db.setDoc(USERS_COLLECTION, uid, {
        userId: uid,
        email,
        role,
        createdAt: new Date().toISOString(),
        status: role === 'nominee' ? 'pending' : 'active'
    });
};

export const createNominee = async (uid: string, regId: string, name: string, nomineeCategory: Nominee['details']['nomineeCategory'], email: string) => {
    await createUserProfile(uid, email, 'nominee');

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
    db.setDoc(APPLICATIONS_COLLECTION, uid, newApplication);
    return newApplication;
};

export const getNominee = async (uid: string): Promise<Nominee | null> => {
    return db.doc(APPLICATIONS_COLLECTION, uid) as Nominee | null;
};

export const updateNominee = async (uid: string, updates: Partial<Nominee>) => {
    db.setDoc(APPLICATIONS_COLLECTION, uid, updates, true);
    await logAction('UPDATE_NOMINEE', `Fields: ${Object.keys(updates).join(', ')}`, uid);
};

export const updateDocumentEvaluation = async (appId: string, slotId: string, verdict: 'pass' | 'fail') => {
    const data = db.doc(APPLICATIONS_COLLECTION, appId) as Nominee | null;
    if (data) {
        const updatedDocs = data.documents.map(doc =>
            doc.slotId === slotId ? { ...doc, verdict } : doc
        );
        db.setDoc(APPLICATIONS_COLLECTION, appId, { documents: updatedDocs }, true);
        await logAction('VERIFY_DOCUMENT', `Slot ${slotId} -> ${verdict.toUpperCase()}`, appId);
        return true;
    }
    return false;
};

export const addNomineeDocument = async (uid: string, document: NomineeDocument) => {
    const nominee = db.doc(APPLICATIONS_COLLECTION, uid) as Nominee | null;
    if (!nominee) return;

    const existingDocs = nominee.documents || [];
    const updatedDocs = existingDocs.filter(d => d.slotId !== document.slotId);
    updatedDocs.push(document);

    db.setDoc(APPLICATIONS_COLLECTION, uid, { documents: updatedDocs }, true);
};

export const uploadNomineeFile = async (
    uid: string,
    documentId: string,
    file: File,
    onProgress?: (progress: number) => void,
    cancelToken?: { cancel?: () => void }
): Promise<string> => {
    console.log("[MOCK STORAGE] Uploading:", file.name);
    if (onProgress) onProgress(10);

    // Convert to a local blob URL that persists during the session
    const localUrl = URL.createObjectURL(file);

    if (onProgress) onProgress(100);
    console.log("[MOCK STORAGE] Success:", localUrl);
    return localUrl;
};

export const getAllNominees = async (): Promise<Nominee[]> => {
    return db.query(APPLICATIONS_COLLECTION, () => true) as Nominee[];
};

/**
 * Dynamically resolves File URLs. 
 */
export const resolveFileUrl = async (url: string | null | undefined): Promise<string> => {
    return url || '';
};

export const getUserRole = async (uid: string): Promise<UserRole | null> => {
    const user = db.doc(USERS_COLLECTION, uid);
    return user ? user.role : null;
};

export const getUserByEmail = async (email: string) => {
    const results = db.query(USERS_COLLECTION, (u) => u.email === email);
    return results.length > 0 ? { uid: (results[0] as any).userId, role: (results[0] as any).role } : null;
};

export const getGKKWinners = async (): Promise<any[]> => {
    const winners = db.query(WINNERS_COLLECTION, () => true);
    return winners.length > 0 ? winners : INITIAL_GKK_WINNERS;
};

export const getNomineeByPassKey = async (passKey: string): Promise<Nominee | null> => {
    const results = db.query(APPLICATIONS_COLLECTION, (a) => a.regId === passKey);
    return results.length > 0 ? results[0] as Nominee : null;
};

export const activateAccessKey = async (
    passKey: string,
    uid: string,
    details: { email: string; companyName: string; category: string }
): Promise<boolean> => {
    try {
        const results = db.query(ACCESS_KEYS_COLLECTION, (k) => k.keyId === passKey && k.status === 'issued');
        if (results.length === 0) return false;

        const key = results[0] as any;

        await createNominee(uid, passKey, details.companyName, details.category as any, details.email);

        db.setDoc(ACCESS_KEYS_COLLECTION, key.keyId, {
            status: 'activated',
            userId: uid,
            activatedAt: new Date().toISOString()
        }, true);

        return true;
    } catch (error) {
        console.error("Mock activation failed", error);
        return false;
    }
};

export const verifyAccessKey = async (passKey: string) => {
    const results = db.query(ACCESS_KEYS_COLLECTION, (k) => k.keyId === passKey);
    if (results.length > 0) {
        const data = results[0] as any;
        return {
            uid: data.userId || `local_${passKey}`,
            role: data.role as UserRole,
            status: data.status
        };
    }
    return null;
};

export const issueAccessKey = async (data: { companyName: string, email: string, region: string }): Promise<string> => {
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    const keyId = `GKK-LOCAL-${data.companyName.substring(0, 3).toUpperCase()}-${random}`;

    db.setDoc(ACCESS_KEYS_COLLECTION, keyId, {
        keyId,
        role: 'nominee',
        status: 'issued',
        issuedAt: new Date().toISOString(),
        email: data.email,
        name: data.companyName,
        region: data.region
    });

    await logAction('ISSUE_KEY', `Issued key ${keyId}`);
    return keyId;
};

export const getAllAccessKeys = async () => {
    return db.query(ACCESS_KEYS_COLLECTION, (k) => k.role === 'nominee');
};

// --- INITIALIZE LOCAL STORAGE WITH DEFAULTS IF EMPTY ---

export const initializeLocalDB = () => {
    if (localStorage.getItem(DB_PREFIX + REQUIREMENTS_COLLECTION)) return;

    console.log("[LOCAL DB] Initializing with default requirements...");

    // Seed basic requirements for Industry UI
    const mockReqs = [
        { category: 'Management', label: '1. Accomplished GKK Application Form' },
        { category: 'Safety', label: '2. Comprehensive OSH Program' }
        // We'll keep it light for mock defaults, or add more
    ];

    ['industry', 'micro enterprise', 'government', 'individual'].forEach(cat => {
        db.setDoc(REQUIREMENTS_COLLECTION, `cat_${cat}`, {
            categoryId: `cat_${cat}`,
            categoryName: cat,
            stage1: mockReqs,
            stage2: [],
            stage3: []
        });
    });

    // Seed a few demo keys
    db.setDoc(ACCESS_KEYS_COLLECTION, 'LOCAL-DEMO-001', {
        keyId: 'LOCAL-DEMO-001',
        role: 'nominee',
        status: 'issued',
        issuedAt: new Date().toISOString(),
        region: 'NCR'
    });

    db.setDoc(ACCESS_KEYS_COLLECTION, 'ADMIN-LOCAL', {
        keyId: 'ADMIN-LOCAL',
        role: 'admin',
        status: 'reusable',
        issuedAt: new Date().toISOString(),
        userId: 'admin_local_mock'
    });

    db.setDoc(USERS_COLLECTION, 'admin_local_mock', {
        userId: 'admin_local_mock',
        email: 'admin@local',
        role: 'admin',
        status: 'active'
    });
};

// Auto-init on import
if (typeof window !== 'undefined') {
    initializeLocalDB();
}
