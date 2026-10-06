import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client using the service role key (or anon fallback in dev).
 * Bypasses Row Level Security (RLS) for server-side verification like draft previews.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
