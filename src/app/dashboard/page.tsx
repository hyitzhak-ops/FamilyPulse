import { redirect } from "next/navigation";
import { he } from "@/lib/i18n/he";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/family-pulse";

export const dynamic = "force-dynamic";

function isProfileRow(x: { role: string; id: string; full_name: string; avatar_url: string | null } | null): x is Profile {
  if (!x) return false;
  return x.role === "parent" || x.role === "family";
}

/** כניסה ל־/dashboard: מפנה לתצוגת לוח לקריאה בלבד (ברירת מחדל אחרי התחברות). */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    redirect("/login");
  }

  const { data: prof, error: profError } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  if (profError || !prof) {
    return (
      <div className="p-8 text-center text-lg">
        <h1 className="text-2xl font-semibold">{he.dashboard.finishSetup}</h1>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          {he.dashboard.finishSetupBodyBefore}{" "}
          <code className="rounded bg-muted px-1">supabase/migrations/001_init_familypulse.sql</code>{" "}
          {he.dashboard.finishSetupBodyAfter}
        </p>
      </div>
    );
  }

  if (!isProfileRow(prof)) {
    return (
      <p className="p-6 text-destructive">{he.dashboard.invalidRole}</p>
    );
  }

  redirect("/dashboard/view");
}
