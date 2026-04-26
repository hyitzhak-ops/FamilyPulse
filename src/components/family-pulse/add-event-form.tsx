"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { he as heLocale } from "date-fns/locale/he";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { EVENT_CATEGORY_OPTIONS, getCategoryLabel } from "@/lib/events/map-category";
import { eventFormSchema, type EventFormInput } from "@/lib/validation/event-form";
import { he } from "@/lib/i18n/he";
import type { Profile } from "@/types/family-pulse";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function toIsoStart(date: Date, time: string): string {
  const t = time.trim();
  const match = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) throw new Error("Invalid time");
  const h = Number.parseInt(match[1], 10);
  const m = Number.parseInt(match[2], 10);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function toIsoEnd(date: Date, time: string, endTime: string | undefined): string {
  if (endTime && endTime.length >= 4) {
    return toIsoStart(date, endTime);
  }
  const t = toIsoStart(date, time);
  const d = new Date(t);
  d.setHours(d.getHours() + 1);
  return d.toISOString();
}

type Props = { profile: Profile; onEventAdded?: () => void };

export function AddEventForm({ profile, onEventAdded }: Props) {
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const form = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      time: "10:00",
      endTime: "",
      description: "",
      category: "visit",
    },
  });

  return (
    <Card className="border-sky-200/70 bg-card/80 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">{he.addEvent.cardTitle}</CardTitle>
        <CardDescription className="text-base">
          {he.addEvent.cardDesc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            setSaving(true);
            try {
              const start = toIsoStart(values.date, values.time);
              const end = toIsoEnd(
                values.date,
                values.time,
                values.endTime?.length ? values.endTime : undefined,
              );
              const { error } = await supabase.from("events").insert({
                title: values.title,
                description: values.description.trim() || null,
                start_time: start,
                end_time: end,
                category: values.category,
                created_by: profile.id,
              });
              if (error) {
                toast.error(error.message);
                return;
              }
              form.reset({ ...form.getValues(), title: "", description: "" });
              toast.success(he.addEvent.toastAdded);
              onEventAdded?.();
            } catch (e) {
              toast.error(
                e instanceof Error ? e.message : he.addEvent.toastGenericError,
              );
            } finally {
              setSaving(false);
            }
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base">
              {he.addEvent.whoVisiting}
            </Label>
            <Input
              id="title"
              autoComplete="name"
              className="min-h-12 text-lg"
              placeholder={he.addEvent.whoPlaceholder}
              {...form.register("title")}
            />
            {form.formState.errors.title ? (
              <p className="text-sm text-destructive" role="alert">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label className="text-base">{he.addEvent.date}</Label>
            <Controller
              control={form.control}
              name="date"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "inline-flex h-auto min-h-12 w-full items-center gap-2 px-3 py-2 text-start text-lg font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                    type="button"
                  >
                    <CalendarIcon className="h-5 w-5 shrink-0" aria-hidden />
                    {field.value
                      ? format(field.value, "PPP", { locale: heLocale })
                      : he.addEvent.pickDay}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      defaultMonth={field.value}
                      locale={heLocale}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="time" className="text-base">
                {he.addEvent.startTime}
              </Label>
              <Input
                id="time"
                type="time"
                className="min-h-12 text-lg"
                {...form.register("time")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-base">
                {he.addEvent.endTime}
              </Label>
              <Input
                id="endTime"
                type="time"
                className="min-h-12 text-lg"
                {...form.register("endTime")}
              />
            </div>
          </div>
          {form.formState.errors.time ? (
            <p className="text-sm text-destructive" role="alert">
              {form.formState.errors.time.message}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="category" className="text-base">
              {he.addEvent.activityType}
            </Label>
            <Controller
              name="category"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="category"
                    className="w-full min-h-12 text-lg"
                  >
                    <span className="truncate">
                      {getCategoryLabel(field.value)}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORY_OPTIONS.map((c) => (
                      <SelectItem
                        key={c.value}
                        value={c.value}
                        className="text-base py-2"
                      >
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">
              {he.addEvent.notes}
            </Label>
            <Textarea
              id="description"
              className="min-h-[4.5rem] text-base"
              placeholder={he.addEvent.notesPlaceholder}
              {...form.register("description")}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="min-h-12 w-full text-lg"
            disabled={saving}
          >
            {saving ? he.addEvent.saving : he.addEvent.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
