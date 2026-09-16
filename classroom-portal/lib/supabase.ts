import { createClient } from '@supabase/supabase-js';

function url() {
  const value = process.env.SUPABASE_URL;
  if (!value) throw new Error('SUPABASE_URL is not configured.');
  return value;
}

export function portalDb() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!key) throw new Error('SUPABASE_PUBLISHABLE_KEY is not configured.');
  return createClient(url(), key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function adminDb() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
  return createClient(url(), key, { auth: { persistSession: false, autoRefreshToken: false } });
}
