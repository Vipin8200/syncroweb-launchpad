-- Make resumes bucket public for viewing CVs
UPDATE storage.buckets 
SET public = true 
WHERE id = 'resumes';