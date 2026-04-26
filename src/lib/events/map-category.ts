import type { EventCategory } from "@/types/family-pulse";
import { he } from "@/lib/i18n/he";
import { Heart, Home, Sparkles, Stethoscope } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const EVENT_CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: "visit", label: he.categories.visit },
  { value: "doctor", label: he.categories.doctor },
  { value: "shabbat", label: he.categories.shabbat },
  { value: "holiday", label: he.categories.holiday },
];

export function getCategoryIcon(category: EventCategory): LucideIcon {
  switch (category) {
    case "visit":
      return Heart;
    case "doctor":
      return Stethoscope;
    case "holiday":
      return Home;
    case "shabbat":
      return Sparkles;
    default: {
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
}

export function getCategoryLabel(category: EventCategory): string {
  switch (category) {
    case "visit":
      return he.categories.visit;
    case "doctor":
      return he.categories.doctor;
    case "holiday":
      return he.categories.holiday;
    case "shabbat":
      return he.categories.shabbat;
    default: {
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
}
