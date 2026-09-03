-- Editorial metadata for the public blog and future admin CMS.
-- Keep `id` stable as the legacy identifier while introducing a proper URL slug.

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS category text;

UPDATE public.articles
SET slug = id
WHERE slug IS NULL OR btrim(slug) = '';

UPDATE public.articles
SET category = CASE id
  WHEN 'how-smartwatches-evolved' THEN 'History'
  WHEN 'smartwatch-battery-life-explained' THEN 'Technology'
  WHEN 'gps-vs-cellular-smartwatch' THEN 'Connectivity'
  WHEN 'what-ecg-smartwatch-really-does' THEN 'Health'
  ELSE 'Editorial'
END
WHERE category IS NULL OR btrim(category) = '';

ALTER TABLE public.articles
  ALTER COLUMN slug SET NOT NULL,
  ALTER COLUMN category SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS articles_slug_unique_idx
  ON public.articles (slug);

CREATE INDEX IF NOT EXISTS articles_category_idx
  ON public.articles (category);
