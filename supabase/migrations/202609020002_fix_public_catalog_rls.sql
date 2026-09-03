-- The smartwatch catalog is intentionally public. RLS remains enabled so
-- admin writes are protected, but anonymous visitors must be able to read
-- catalog and vendor-link data used by the public site.

DROP POLICY IF EXISTS "Public can read smartwatches" ON public.smartwatches;
CREATE POLICY "Public can read smartwatches"
  ON public.smartwatches
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can read brands" ON public.brands;
CREATE POLICY "Public can read brands"
  ON public.brands
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can read product links" ON public.product_links;
CREATE POLICY "Public can read product links"
  ON public.product_links
  FOR SELECT
  USING (true);

-- Newsletter subscribers contain private contact information and therefore
-- intentionally have no public SELECT policy.
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
