import { Heart } from "lucide-react";
import { GoogleSignInButton } from "@/components/family-pulse/google-sign-in-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { he } from "@/lib/i18n/he";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const p = await searchParams;

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-gradient-to-b from-sky-100/90 via-emerald-50/50 to-stone-100/80 p-6">
      <div className="mb-8 text-center max-w-md">
        <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Heart className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          FamilyPulse
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">{he.login.tagline}</p>
      </div>

      <Card className="w-full max-w-md border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{he.login.signInTitle}</CardTitle>
          <CardDescription className="text-base">
            {he.login.signInDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {p.error === "auth" ? (
            <p className="text-destructive text-base" role="alert">
              {he.login.authError}
            </p>
          ) : null}
          <GoogleSignInButton />
          <p className="text-center text-sm text-muted-foreground">
            {he.login.newUserHint}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
