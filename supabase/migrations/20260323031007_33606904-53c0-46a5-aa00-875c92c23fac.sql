
CREATE TABLE public.restaurant_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE UNIQUE,
  primary_color TEXT NOT NULL DEFAULT '16 80% 50%',
  accent_color TEXT NOT NULL DEFAULT '345 60% 38%',
  background_color TEXT NOT NULL DEFAULT '30 50% 98%',
  foreground_color TEXT NOT NULL DEFAULT '20 30% 12%',
  font_display TEXT NOT NULL DEFAULT 'Playfair Display',
  font_body TEXT NOT NULL DEFAULT 'DM Sans',
  logo_url TEXT,
  banner_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  sections_config JSONB NOT NULL DEFAULT '{"hero": {"visible": true, "order": 0}, "popular_dishes": {"visible": true, "order": 1}, "about_us": {"visible": true, "order": 2}, "hours": {"visible": true, "order": 3}}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurant_themes ENABLE ROW LEVEL SECURITY;

-- Public can read themes (needed to render the site)
CREATE POLICY "Public can view themes" ON public.restaurant_themes
  FOR SELECT TO public USING (true);

-- Restaurant admins can update their theme
CREATE POLICY "Restaurant admins can update their theme" ON public.restaurant_themes
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM restaurant_admins ra WHERE ra.restaurant_id = restaurant_themes.restaurant_id AND ra.user_id = auth.uid()));

-- Super admins full access
CREATE POLICY "Super admins manage themes" ON public.restaurant_themes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Restaurant admins can insert their theme
CREATE POLICY "Restaurant admins can insert their theme" ON public.restaurant_themes
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM restaurant_admins ra WHERE ra.restaurant_id = restaurant_themes.restaurant_id AND ra.user_id = auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_restaurant_themes_updated_at
  BEFORE UPDATE ON public.restaurant_themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
