import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { he } from "@/lib/i18n/he";
import { getSupabasePublishableEnv } from "@/lib/supabase/publishable-env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { url, anonKey } = getSupabasePublishableEnv();
  if (!url || !anonKey) {
    console.error(
      "[FamilyPulse] חסרים NEXT_PUBLIC_SUPABASE_URL או NEXT_PUBLIC_SUPABASE_ANON_KEY. שימו .env.local ליד package.json, ואז: rm -rf .next && npm run dev",
    );
    const m = he.middleware;
    const html = `<!DOCTYPE html><html lang="he" dir="rtl"><meta charset="utf-8"/><title>${m.htmlTitle}</title>
<body style="font-family:system-ui;max-width:40rem;margin:2rem auto;padding:0 1rem">
<h1>${m.heading}</h1>
<p>${m.p1} <code>.env.local</code> ${m.p1b} <code>${m.p1pkg}</code> ${m.p1c}</p>
<pre style="background:#f4f4f5;padding:1rem;overflow:auto;direction:ltr;text-align:left">NEXT_PUBLIC_SUPABASE_URL=…
NEXT_PUBLIC_SUPABASE_ANON_KEY=…</pre>
<p>${m.p2}</p>
<pre style="background:#f4f4f5;padding:1rem;direction:ltr;text-align:left">rm -rf .next
npm run dev</pre>
<p>${m.p3} <code>${m.cmdCheck}</code></p>
</body></html>`;
    return new NextResponse(html, {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options });
            supabaseResponse = NextResponse.next({ request });
            supabaseResponse.cookies.set({ name, value, ...options });
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPath =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname.startsWith("/auth/");

  if (!user && !isAuthPath) {
    const u = new URL("/login", request.url);
    u.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(u);
  }

  if (user && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard/view", request.url));
  }

  return supabaseResponse;
}
