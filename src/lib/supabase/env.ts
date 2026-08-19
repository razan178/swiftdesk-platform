/**
 * Supabase environment access. The site is designed to build and run even
 * before the client has pasted their Supabase keys — the public store simply
 * shows an empty ("fresh drops coming soon") state, and the admin login shows
 * a clear setup notice instead of crashing.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
