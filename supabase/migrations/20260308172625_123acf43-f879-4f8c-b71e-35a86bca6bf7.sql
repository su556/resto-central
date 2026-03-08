
-- Create public bucket for dish images
INSERT INTO storage.buckets (id, name, public) VALUES ('dish-images', 'dish-images', true);

-- Allow authenticated users to upload dish images
CREATE POLICY "Authenticated users can upload dish images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'dish-images');

-- Allow anyone to view dish images (public bucket)
CREATE POLICY "Anyone can view dish images"
ON storage.objects FOR SELECT
USING (bucket_id = 'dish-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update dish images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'dish-images');

-- Allow authenticated users to delete dish images
CREATE POLICY "Authenticated users can delete dish images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'dish-images');
