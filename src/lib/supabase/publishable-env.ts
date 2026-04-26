/**
 * Publishable Supabase client settings (anon key + URL).
 * Values come from process.env; next.config inlines them for middleware via webpack.
 */
export function getSupabasePublishableEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return { url, anonKey };
}
