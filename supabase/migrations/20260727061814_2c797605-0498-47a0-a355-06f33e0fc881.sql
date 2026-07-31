ALTER TABLE public.products ADD COLUMN IF NOT EXISTS new_launch boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS products_new_launch_idx ON public.products (new_launch) WHERE new_launch;

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'products' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'products' AND public.has_role(auth.uid(), 'admin'));