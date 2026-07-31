
-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  image text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  description text,
  material text,
  price int NOT NULL DEFAULT 0,
  compare_at int,
  category text,
  collection text,
  image text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  badge text,
  stock int NOT NULL DEFAULT 0,
  rating numeric(3,2) NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PRODUCT VARIANTS
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  sku text,
  price int,
  stock int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admin manage variants" ON public.product_variants FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- BANNERS
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image text,
  link text,
  position text NOT NULL DEFAULT 'hero',
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read banners" ON public.banners FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage banners" ON public.banners FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- REVIEWS
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  rating int NOT NULL,
  title text,
  body text,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT USING (approved = true OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admin manage reviews" ON public.reviews FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- STORE SETTINGS (single row)
CREATE TABLE public.store_settings (
  id int PRIMARY KEY DEFAULT 1,
  store_name text NOT NULL DEFAULT 'Suii Kala',
  contact_email text,
  contact_phone text,
  whatsapp_number text,
  gst_number text,
  gst_rate numeric(5,2) NOT NULL DEFAULT 3.00,
  shipping_standard int NOT NULL DEFAULT 79,
  shipping_express int NOT NULL DEFAULT 199,
  free_shipping_min int NOT NULL DEFAULT 999,
  currency text NOT NULL DEFAULT 'INR',
  instagram_url text,
  facebook_url text,
  twitter_url text,
  payment_razorpay_enabled boolean NOT NULL DEFAULT true,
  payment_cod_enabled boolean NOT NULL DEFAULT true,
  seo_title text,
  seo_description text,
  return_policy text,
  shipping_policy text,
  notif_order_email boolean NOT NULL DEFAULT true,
  notif_ship_email boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_settings_singleton CHECK (id = 1)
);
GRANT SELECT ON public.store_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Admin update settings" ON public.store_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin insert settings" ON public.store_settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.store_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Allow admins to manage user_roles (grant/revoke)
CREATE POLICY "Admin manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all profiles is already covered. Add admin read all addresses.
CREATE POLICY "Admin read addresses" ON public.addresses FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_categories_upd BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_products_upd BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_banners_upd BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_reviews_upd BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_settings_upd BEFORE UPDATE ON public.store_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Bootstrap: promote the first user to admin so they can access the dashboard.
-- If no admin exists yet, grant admin to the earliest signed-up user.
DO $$
DECLARE first_user uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    SELECT id INTO first_user FROM auth.users ORDER BY created_at ASC LIMIT 1;
    IF first_user IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (first_user, 'admin') ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;
