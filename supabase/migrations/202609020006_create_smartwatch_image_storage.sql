-- Public image bucket. Uploads are performed server-side with the service role,
-- so the service-role key never reaches the browser.
INSERT INTO storage.buckets (id, name, public)
VALUES ('smartwatch-images', 'smartwatch-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;
