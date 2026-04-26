"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { he } from "@/lib/i18n/he";
import { Button } from "@/components/ui/button";

function oauthRedirectBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  return (
    <Button
      type="button"
      size="lg"
      className="min-h-12 w-full text-lg"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const base = oauthRedirectBase();
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${base}/auth/callback?next=/dashboard/view`,
            queryParams: { prompt: "select_account" },
          },
        });
        if (error) {
          setLoading(false);
        }
      }}
    >
      {loading ? he.login.googleRedirect : he.login.googleContinue}
    </Button>
  );
}
