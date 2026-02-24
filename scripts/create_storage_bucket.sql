-- Setup script for Compliance Documents Storage Bucket
-- 1. Create the storage bucket (if it doesn't already exist)
INSERT INTO storage.buckets (id, name, public)
VALUES (
        'compliance_documents',
        'compliance_documents',
        true
    ) ON CONFLICT (id) DO NOTHING;
-- 2. Enable Row Level Security (RLS) on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- Drop existing policies if they exist to avoid errors when re-running
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Updates" ON storage.objects;
-- 3. Create a policy to allow anyone to read the documents
CREATE POLICY "Public Access" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'compliance_documents');
-- 4. Create a policy to allow uploads (insert) to the bucket
CREATE POLICY "Allow Uploads" ON storage.objects FOR
INSERT TO public WITH CHECK (bucket_id = 'compliance_documents');
-- 5. Create a policy to allow updates (in case a file needs to be overwritten)
CREATE POLICY "Allow Updates" ON storage.objects FOR
UPDATE TO public USING (bucket_id = 'compliance_documents');