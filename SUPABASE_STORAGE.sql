-- Storage bucket policy setup
-- Run this after creating a bucket named "posts" in the Supabase Storage dashboard

-- Make the bucket public
-- Note: This needs to be done in the Supabase Dashboard:
-- Go to Storage → posts bucket → Settings → Enable "Public bucket"

-- If you want to set up RLS policies instead of making the bucket public, use these policies:

CREATE POLICY "Anyone can view posts" ON storage.objects FOR SELECT USING (bucket_id = 'posts');
CREATE POLICY "Authenticated users can upload posts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own posts" ON storage.objects FOR UPDATE USING (bucket_id = 'posts' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own posts" ON storage.objects FOR DELETE USING (bucket_id = 'posts' AND auth.uid() = owner);