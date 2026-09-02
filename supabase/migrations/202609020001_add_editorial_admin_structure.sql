-- SmartwatchTimeline — Editorial + Admin V1
-- English-only by design. No i18n/translation columns.
-- Safe to run on an existing V1 catalog.

CREATE TABLE IF NOT EXISTS public.articles (
  id text PRIMARY KEY,
  title text NOT NULL,
  excerpt text NOT NULL,
  content_html text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('published', 'draft')),
  cover_image_url text,
  table_of_contents jsonb NOT NULL DEFAULT '[]'::jsonb,
  word_count integer NOT NULL DEFAULT 0 CHECK (word_count >= 0),
  reading_minutes integer NOT NULL DEFAULT 1 CHECK (reading_minutes >= 1),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS articles_status_published_idx
  ON public.articles (status, published_at DESC);

CREATE TABLE IF NOT EXISTS public.guides (
  slug text PRIMARY KEY,
  priority numeric NOT NULL DEFAULT 0.75,
  category text,
  icon text,
  title text NOT NULL,
  description text NOT NULL,
  intro text NOT NULL DEFAULT '',
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  faq jsonb,
  filter jsonb,
  sort jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('published', 'draft')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guides_status_priority_idx
  ON public.guides (status, priority DESC);

-- Admin identity is tied to Supabase Auth users. No custom passwords are stored.
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  role text NOT NULL DEFAULT 'editor'
    CHECK (role IN ('admin', 'editor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Quality tracking for catalog data. These are calculated/maintained by admin tooling,
-- not exposed as public write fields.
ALTER TABLE public.smartwatches
  ADD COLUMN IF NOT EXISTS quality_score integer NOT NULL DEFAULT 0
    CHECK (quality_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS qa_status text NOT NULL DEFAULT 'NEEDS_RESEARCH'
    CHECK (qa_status IN ('VERIFIED', 'GOOD', 'INCOMPLETE', 'NEEDS_RESEARCH'));

CREATE INDEX IF NOT EXISTS smartwatches_quality_idx
  ON public.smartwatches (qa_status, quality_score DESC);

-- updated_at helper. Application code can also explicitly maintain the timestamp.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS articles_set_updated_at ON public.articles;
CREATE TRIGGER articles_set_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS guides_set_updated_at ON public.guides;
CREATE TRIGGER guides_set_updated_at
BEFORE UPDATE ON public.guides
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS admin_profiles_set_updated_at ON public.admin_profiles;
CREATE TRIGGER admin_profiles_set_updated_at
BEFORE UPDATE ON public.admin_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Public catalog/editorial reads; writes stay server/admin-only.
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smartwatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published articles" ON public.articles;
CREATE POLICY "Public read published articles"
  ON public.articles FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Public read published guides" ON public.guides;
CREATE POLICY "Public read published guides"
  ON public.guides FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Admin read articles" ON public.articles;
CREATE POLICY "Admin read articles"
  ON public.articles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admin write articles" ON public.articles;
CREATE POLICY "Admin write articles"
  ON public.articles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admin read guides" ON public.guides;
CREATE POLICY "Admin read guides"
  ON public.guides FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admin write guides" ON public.guides;
CREATE POLICY "Admin write guides"
  ON public.guides FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admin read profiles" ON public.admin_profiles;
CREATE POLICY "Admin read profiles"
  ON public.admin_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin read smartwatches" ON public.smartwatches;
CREATE POLICY "Admin read smartwatches"
  ON public.smartwatches FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admin write smartwatches" ON public.smartwatches;
CREATE POLICY "Admin write smartwatches"
  ON public.smartwatches FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admin read brands" ON public.brands;
CREATE POLICY "Admin read brands"
  ON public.brands FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admin write brands" ON public.brands;
CREATE POLICY "Admin write brands"
  ON public.brands FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admin read product links" ON public.product_links;
CREATE POLICY "Admin read product links"
  ON public.product_links FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admin write product links" ON public.product_links;
CREATE POLICY "Admin write product links"
  ON public.product_links FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.user_id = auth.uid()));
