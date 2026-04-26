import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublishableEnv } from "@/lib/supabase/publishable-env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublishableEnv();

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // set from Server Component — ignore
          }
        },
      },
    },
  );
}
