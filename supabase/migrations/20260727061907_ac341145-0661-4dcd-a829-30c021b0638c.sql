DROP POLICY IF EXISTS "Admin read addresses" ON public.addresses;
CREATE POLICY "Admin read addresses" ON public.addresses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin manage roles" ON public.user_roles;
CREATE POLICY "Admin manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));