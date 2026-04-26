"use client";

import Link from "next/link";
import { LogOut, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { he } from "@/lib/i18n/he";
import type { Profile } from "@/types/family-pulse";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  profile: Profile;
  userEmail: string;
  children: React.ReactNode;
};

export function ViewOnlyShell({ profile, userEmail, children }: Props) {
  const canEdit = profile.role === "family";

  return (
    <div className="min-h-svh bg-gradient-to-b from-sky-50/80 via-emerald-50/20 to-stone-50/90">
      <header
        className="sticky top-0 z-30 border-b border-sky-200/60 bg-background/90 backdrop-blur"
        role="banner"
      >
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600/10 text-sky-800">
              <Heart className="h-7 w-7" aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {he.dashboard.viewOnlyTitle}
              </p>
              <p className="text-base text-muted-foreground sm:text-lg">
                {userEmail} · {profile.full_name}
              </p>
              <p className="mt-1 max-w-2xl text-base text-muted-foreground sm:text-lg">
                {canEdit
                  ? he.dashboard.viewOnlySubtitleFamily
                  : he.dashboard.viewOnlySubtitleParent}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canEdit ? (
              <Link
                href="/dashboard/edit"
                className={cn(buttonVariants({ variant: "default", size: "lg" }), "min-h-12 text-lg")}
              >
                {he.dashboard.backToEditor}
              </Link>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="min-h-12 text-lg"
              onClick={async () => {
                const s = createClient();
                await s.auth.signOut();
                window.location.href = "/login";
              }}
            >
              <LogOut className="me-2 h-5 w-5" aria-hidden />
              {he.dashboard.signOut}
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}
