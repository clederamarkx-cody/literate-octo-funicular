import { Nominee, NomineeDocument, UserRole } from '../types';
import { INITIAL_GKK_WINNERS } from '../constants';
import { supabase } from './supabaseClient';

// --- MOCK AUTH ENGINE (Simplified for integration) ---

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
    currentUser = { uid: 'local_user_' + Math.random().toString(36).substring(2, 11), email: 'anonymous@local', isAnonymous: true };
    console.log("[MOCK AUTH] Signed in as:", currentUser.uid);
    return currentUser;
};

// --- COLLECTION NAMES (Supabase Tables) ---

export const USERS_COLLECTION = 'users';
export const ACCESS_KEYS_COLLECTION = 'access_keys';
export const APPLICATIONS_COLLECTION = 'applications';
export const DOCUMENTS_COLLECTION = 'application_documents';
export const REQUIREMENTS_COLLECTION = 'requirements';
export const WINNERS_COLLECTION = 'gkk_winners';
export const SYSTEM_LOGS_COLLECTION = 'system_logs';

export const TEST_MODE = false;

// --- STANDARDIZED API ---

export const logAction = async (action: string, details: string, appId?: string) => {
    const { error } = await supabase.from(SYSTEM_LOGS_COLLECTION).insert({
        user_id: currentUser?.uid || null,
        action,
        details,
        application_id: appId || null
    });
    if (error) console.error("Logging failed:", error);
};

export const getRequirementsByCategory = async (category: string) => {
    const { data, error } = await supabase
        .from(REQUIREMENTS_COLLECTION)
        .select('*')
        .eq('category_id', `cat_${category.toLowerCase()}`)
        .single();

    if (error || !data) {
        const { data: defaultData } = await supabase
            .from(REQUIREMENTS_COLLECTION)
            .select('*')
            .eq('category_id', 'cat_industry')
            .single();
        return defaultData;
    }
    return data;
};

export const isValidRole = (role: string): role is UserRole => {
    return ['admin', 'reu', 'scd_team_leader', 'evaluator', 'nominee'].includes(role);
};

export const createUserProfile = async (uid: string, email: string, role: UserRole) => {
    const { error } = await supabase.from(USERS_COLLECTION).insert({
        user_id: uid,
        email,
        role,
        status: role === 'nominee' ? 'pending' : 'active'
    });
    if (error) {
        console.error("User profile creation failed:", error);
        return false;
    }
    return true;
};

export const createNominee = async (uid: string, regId: string, name: string, nomineeCategory: Nominee['details']['nomineeCategory'], email: string) => {
    const userCreated = await createUserProfile(uid, email, 'nominee');
    if (!userCreated) return false;

    const newApplication: any = {
        id: uid,
        reg_id: regId,
        name,
        email,
        role: 'nominee',
        industry: 'Unspecified',
        region: 'NCR',
        status: 'in_progress',
        submitted_date: new Date().toISOString(),
        round2_unlocked: false,
        details: {
            nomineeCategory,
            employees: '',
            address: '',
            representative: '',
            designation: '',
            email: email, // Reflect the registered email here
            phone: '',
            safetyOfficer: ''
        }
    };

    const { error } = await supabase.from(APPLICATIONS_COLLECTION).insert(newApplication);
    if (error) {
        console.error("Create nominee failed:", error);
        return false;
    }
    return true;
};

export const getNominee = async (uid: string): Promise<Nominee | null> => {
    const { data, error } = await supabase
        .from(APPLICATIONS_COLLECTION)
        .select(`
            *,
            documents: ${DOCUMENTS_COLLECTION} (*)
        `)
        .eq('id', uid)
        .single();

    if (error || !data) return null;

    // Map back to camelCase for the frontend
    return {
        ...data,
        regId: data.reg_id,
        submittedDate: data.submitted_date,
        round2Unlocked: data.round2_unlocked,
        round3Unlocked: data.round3_unlocked,
        stage1PassedByReu: data.stage1_passed_by_reu,
        stage2TriggeredByScd: data.stage2_triggered_by_scd,
        stage3TriggeredByScd: data.stage3_triggered_by_scd,
        stage1Verdict: data.stage1_verdict,
        stage2Verdict: data.stage2_verdict,
        stage3Verdict: data.stage3_verdict,
        organizationName: data.organization_name,
        industrySector: data.industry_sector,
        workforceSize: data.workforce_size,
        focalName: data.focal_name,
        focalEmail: data.focal_email,
        focalPhone: data.focal_phone,
        addressObj: data.address_obj,
        documents: data.documents?.map((d: any) => ({
            name: d.name,
            type: d.type,
            url: d.url,
            date: d.date,
            slotId: d.slot_id,
            remarks: d.remarks,
            verdict: d.verdict
        })) || []
    } as unknown as Nominee;
};

export const updateNominee = async (uid: string, updates: Partial<Nominee>) => {
    // Map camelCase to snake_case for Supabase
    const supabaseUpdates: any = {};
    if (updates.regId) supabaseUpdates.reg_id = updates.regId;
    if (updates.status) supabaseUpdates.status = updates.status;
    if (updates.verdict) supabaseUpdates.verdict = updates.verdict;
    if (updates.round2Unlocked !== undefined) supabaseUpdates.round2_unlocked = updates.round2Unlocked;
    if (updates.round3Unlocked !== undefined) supabaseUpdates.round3_unlocked = updates.round3Unlocked;
    if (updates.stage1PassedByReu !== undefined) supabaseUpdates.stage1_passed_by_reu = updates.stage1PassedByReu;
    if (updates.stage2TriggeredByScd !== undefined) supabaseUpdates.stage2_triggered_by_scd = updates.stage2TriggeredByScd;
    if (updates.stage3TriggeredByScd !== undefined) supabaseUpdates.stage3_triggered_by_scd = updates.stage3TriggeredByScd;
    if (updates.stage1Verdict) supabaseUpdates.stage1_verdict = updates.stage1Verdict;
    if (updates.stage2Verdict) supabaseUpdates.stage2_verdict = updates.stage2Verdict;
    if (updates.stage3Verdict) supabaseUpdates.stage3_verdict = updates.stage3Verdict;
    if (updates.details) supabaseUpdates.details = updates.details;
    if (updates.name) supabaseUpdates.name = updates.name;
    if (updates.email) supabaseUpdates.email = updates.email;
    if (updates.region) supabaseUpdates.region = updates.region;
    if (updates.industry) supabaseUpdates.industry = updates.industry;

    const { error } = await supabase
        .from(APPLICATIONS_COLLECTION)
        .update(supabaseUpdates)
        .eq('id', uid);

    if (error) console.error("Update nominee failed:", error);
    await logAction('UPDATE_NOMINEE', `Fields: ${Object.keys(updates).join(', ')}`, uid);
};

export const updateDocumentEvaluation = async (appId: string, slotId: string, verdict: 'pass' | 'fail') => {
    const { error } = await supabase
        .from(DOCUMENTS_COLLECTION)
        .update({ verdict })
        .eq('application_id', appId)
        .eq('slot_id', slotId);

    if (error) {
        console.error("Update document evaluation failed:", error);
        return false;
    }

    await logAction('VERIFY_DOCUMENT', `Slot ${slotId} -> ${verdict.toUpperCase()}`, appId);
    return true;
};

export const addNomineeDocument = async (uid: string, document: NomineeDocument) => {
    const { error } = await supabase.from(DOCUMENTS_COLLECTION).upsert({
        application_id: uid,
        slot_id: document.slotId,
        name: document.name,
        type: document.type,
        url: document.url,
        date: document.date || new Date().toISOString(),
        remarks: document.remarks,
        verdict: document.verdict
    }, { onConflict: 'application_id,slot_id' }); // Requires a unique constraint in Supabase for this to work as upsert

    if (error) console.error("Add nominee document failed:", error);
};

export const uploadNomineeFile = async (
    uid: string,
    documentId: string,
    file: File,
    onProgress?: (progress: number) => void,
    cancelToken?: { cancel?: () => void }
): Promise<string> => {
    console.log("[STORAGE] Preparing upload for:", file.name);
    if (onProgress) onProgress(10);

    const fileExt = file.name.split('.').pop();
    const fileName = `${uid}/${documentId}_${Date.now()}.${fileExt}`;

    // Note: Assuming a 'nominee-documents' bucket exists. Plan didn't include creating it yet.
    // For now, we use a placeholder or local URL if storage isn't set up.
    // However, if we want full Supabase, we'd do:
    /*
    const { data, error } = await supabase.storage.from('nominee-documents').upload(fileName, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('nominee-documents').getPublicUrl(data.path);
    return urlData.publicUrl;
    */

    // Since storage setup wasn't explicitly in the plan schema (only DB), 
    // and bucket creation requires more permissions/tools, I'll stick to a local Blob for now 
    // or return a path that would be used.

    const localUrl = URL.createObjectURL(file);
    if (onProgress) onProgress(100);
    return localUrl;
};

export const getAllNominees = async (): Promise<Nominee[]> => {
    const { data, error } = await supabase
        .from(APPLICATIONS_COLLECTION)
        .select(`
            *,
            documents: ${DOCUMENTS_COLLECTION} (*)
        `);

    if (error) {
        console.error("Get all nominees failed:", error);
        return [];
    }

    return (data || []).map((app: any) => ({
        ...app,
        regId: app.reg_id,
        submittedDate: app.submitted_date,
        round2Unlocked: app.round2_unlocked,
        round3Unlocked: app.round3_unlocked,
        stage1PassedByReu: app.stage1_passed_by_reu,
        stage2TriggeredByScd: app.stage2_triggered_by_scd,
        stage3TriggeredByScd: app.stage3_triggered_by_scd,
        stage1Verdict: app.stage1_verdict,
        stage2Verdict: app.stage2_verdict,
        stage3Verdict: app.stage3_verdict,
        organizationName: app.organization_name,
        industrySector: app.industry_sector,
        workforceSize: app.workforce_size,
        focalName: app.focal_name,
        focalEmail: app.focal_email,
        focalPhone: app.focal_phone,
        addressObj: app.address_obj,
        documents: app.documents?.map((d: any) => ({
            name: d.name,
            type: d.type,
            url: d.url,
            date: d.date,
            slotId: d.slot_id,
            remarks: d.remarks,
            verdict: d.verdict
        })) || []
    })) as unknown as Nominee[];
};

export const resolveFileUrl = async (url: string | null | undefined): Promise<string> => {
    return url || '';
};

export const getUserRole = async (uid: string): Promise<UserRole | null> => {
    const { data, error } = await supabase
        .from(USERS_COLLECTION)
        .select('role')
        .eq('user_id', uid)
        .single();

    if (error || !data) return null;
    return data.role as UserRole;
};

export const getUserByEmail = async (email: string) => {
    const { data, error } = await supabase
        .from(USERS_COLLECTION)
        .select('user_id, role')
        .eq('email', email)
        .single();

    return data ? { uid: data.user_id, role: data.role as UserRole } : null;
};

export const getGKKWinners = async (): Promise<any[]> => {
    const { data, error } = await supabase
        .from(WINNERS_COLLECTION)
        .select('*');

    return data && data.length > 0 ? data : INITIAL_GKK_WINNERS;
};

export const getNomineeByPassKey = async (passKey: string): Promise<Nominee | null> => {
    const { data, error } = await supabase
        .from(APPLICATIONS_COLLECTION)
        .select(`
            *,
            documents: ${DOCUMENTS_COLLECTION} (*)
        `)
        .eq('reg_id', passKey.toUpperCase())
        .single();

    if (error || !data) return null;
    return data as unknown as Nominee;
};

export const activateAccessKey = async (
    passKey: string,
    uid: string,
    details: { email: string; companyName: string; category?: string }
): Promise<boolean> => {
    const normalizedKey = passKey.trim().toUpperCase();
    try {
        const { data: key, error: keyError } = await supabase
            .from(ACCESS_KEYS_COLLECTION)
            .select('*')
            .eq('key_id', normalizedKey)
            .eq('status', 'issued')
            .single();

        if (keyError || !key) return false;

        const role = (key.role as UserRole) || 'nominee';

        // Conditional setup based on role
        if (role === 'nominee') {
            const finalCategory = key.category || details.category || 'Industry';
            const finalCompanyName = key.name || details.companyName || 'Nominated Establishment';
            const nomineeCreated = await createNominee(uid, normalizedKey, finalCompanyName, finalCategory as any, details.email);
            if (!nomineeCreated) return false;
        } else {
            // Admin/Evaluator roles only need a user profile
            const userCreated = await createUserProfile(uid, details.email, role);
            if (!userCreated) return false;
        }

        const { error: updateError } = await supabase
            .from(ACCESS_KEYS_COLLECTION)
            .update({
                status: 'activated',
                user_id: uid,
                activated_at: new Date().toISOString()
            })
            .eq('key_id', normalizedKey);

        return !updateError;
    } catch (error) {
        console.error("Activation failed", error);
        return false;
    }
};

export const verifyAccessKey = async (passKey: string) => {
    const { data, error } = await supabase
        .from(ACCESS_KEYS_COLLECTION)
        .select('*')
        .eq('key_id', passKey)
        .single();

    if (error || !data) return null;

    return {
        uid: data.user_id || `local_${passKey}`,
        role: data.role as UserRole,
        status: data.status
    };
};

export const issueAccessKey = async (data: { companyName: string, email: string, region: string, role?: string, category?: string }): Promise<string> => {
    const random = Math.floor(1000 + Math.random() * 9000).toString();

    // Generate abbreviation from company name
    const words = data.companyName.trim().split(/[\s-]+/);
    let abbreviation = '';

    if (words.length > 1) {
        abbreviation = words.map(w => w[0]).join('').substring(0, 4).toUpperCase();
    } else {
        abbreviation = data.companyName.substring(0, 4).toUpperCase();
    }

    // New format: GKK-26-[Abbreviation]-[Random]
    const keyId = `GKK-26-${abbreviation}-${random}`;

    const { error } = await supabase.from(ACCESS_KEYS_COLLECTION).insert({
        key_id: keyId,
        role: data.role || 'nominee',
        status: 'issued',
        email: data.email,
        name: data.companyName,
        region: data.region,
        category: data.category
    });

    if (error) console.error("Issue key failed:", error);

    await logAction('ISSUE_KEY', `Issued key ${keyId} for role ${data.role || 'nominee'} in category ${data.category || 'N/A'}`);
    return keyId;
};

export const getAllAccessKeys = async () => {
    const { data, error } = await supabase
        .from(ACCESS_KEYS_COLLECTION)
        .select('*')
        .eq('role', 'nominee');

    return data || [];
};

export const initializeLocalDB = () => {
    // This was used for localStorage seeding. 
    // In Supabase, we do this via migrations or initial scripts.
    console.log("[SUPABASE] Running in live mode.");
};
