import { createClient } from '@supabase/supabase-js';

// Server-only. Never import this module from a Client Component.
export function getSupabaseAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false },
      global: { fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }) },
    }
  );
}
