import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">הדף לא נמצא</h1>
      <p className="max-w-md text-muted-foreground">
        הכתובת שביקשת אינה קיימת או הועברה.
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ size: "lg" }), "min-h-12 inline-flex")}
      >
        חזרה לדף הבית
      </Link>
    </div>
  );
}
