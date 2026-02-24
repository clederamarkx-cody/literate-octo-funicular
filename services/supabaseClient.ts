import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ckdzqwlhdfximaktlmxw.supabase.co';
const supabaseKey = 'sb_publishable_0EwVTxssw-1bw2TRcYUNHg_b_3XIXqP';

export const supabase = createClient(supabaseUrl, supabaseKey);
