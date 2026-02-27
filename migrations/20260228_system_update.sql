-- 1. Performance: Add covering indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_access_keys_user_id ON public.access_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_reg_id ON public.applications(reg_id);
CREATE INDEX IF NOT EXISTS idx_gkk_winners_application_id ON public.gkk_winners(application_id);
CREATE INDEX IF NOT EXISTS idx_gkk_winners_nominee_id ON public.gkk_winners(nominee_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs(user_id);

-- 2. API Stability: Add unique constraint for application_documents to support safe upsert
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_app_doc_slot') THEN
        ALTER TABLE public.application_documents ADD CONSTRAINT uq_app_doc_slot UNIQUE (application_id, slot_id);
    END IF;
END $$;

-- 3. Security: Refine RLS Policies
-- access_keys
DROP POLICY IF EXISTS "Allow all insertions" ON public.access_keys;
DROP POLICY IF EXISTS "Allow all updates" ON public.access_keys;

-- applications
DROP POLICY IF EXISTS "Allow all insertions" ON public.applications;
DROP POLICY IF EXISTS "Allow all updates" ON public.applications;
CREATE POLICY "Users can manage own application" ON public.applications 
    FOR ALL USING (auth.uid() = id);

-- application_documents
DROP POLICY IF EXISTS "Allow all users to delete documents" ON public.application_documents;
DROP POLICY IF EXISTS "Allow all users to insert documents" ON public.application_documents;
DROP POLICY IF EXISTS "Allow all users to update documents" ON public.application_documents;
DROP POLICY IF EXISTS "Allow all users to read documents" ON public.application_documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.application_documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.application_documents;
DROP POLICY IF EXISTS "Users can view own documents" ON public.application_documents;

CREATE POLICY "Users can manage own documents" ON public.application_documents
    FOR ALL USING (auth.uid() = application_id);

-- system_logs
DROP POLICY IF EXISTS "Allow all insertions" ON public.system_logs;
CREATE POLICY "Users can insert own logs" ON public.system_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- users
DROP POLICY IF EXISTS "Allow all insertions" ON public.users;
DROP POLICY IF EXISTS "Allow all updates" ON public.users;
CREATE POLICY "Users can manage own profile" ON public.users
    FOR ALL USING (auth.uid() = user_id);
