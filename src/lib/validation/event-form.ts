import { z } from "zod";
import { he } from "@/lib/i18n/he";
import type { EventCategory } from "@/types/family-pulse";

const categories: [EventCategory, ...EventCategory[]] = [
  "visit",
  "doctor",
  "holiday",
  "shabbat",
];

export const eventFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, he.zod.titleMin)
    .max(200, he.zod.titleMax),
  date: z.date(),
  time: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      he.zod.timeInvalid,
    ),
  endTime: z
    .string()
    .refine(
      (v) => v.length === 0 || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
      { message: he.zod.endTimeInvalid },
    ),
  description: z.string().max(2000, he.zod.descriptionMax),
  category: z.enum(categories),
});

export type EventFormInput = z.infer<typeof eventFormSchema>;
