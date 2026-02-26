import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ckdzqwlhdfximaktlmxw.supabase.co';
const supabaseKey = 'sb_publishable_0EwVTxssw-1bw2TRcYUNHg_b_3XIXqP';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to log Supabase errors silently in the browser console
export const handleSupabaseError = (error: any, context: string) => {
    if (error) {
        console.error(`[Supabase Error] ${context}:`, {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
    }
    return error;
};
