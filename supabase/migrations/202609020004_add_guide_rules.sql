ALTER TABLE public.guides
  ADD COLUMN IF NOT EXISTS brand_compare text[];

CREATE INDEX IF NOT EXISTS guides_brand_compare_idx
  ON public.guides USING gin (brand_compare);
