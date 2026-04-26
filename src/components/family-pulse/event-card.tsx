"use client";

import { createElement, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { he as heLocale } from "date-fns/locale/he";
import { Calendar as CalendarIcon, Pencil, Trash2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { EVENT_CATEGORY_OPTIONS, getCategoryIcon, getCategoryLabel } from "@/lib/events/map-category";
import { he } from "@/lib/i18n/he";
import type { EventWithCreator, Profile } from "@/types/family-pulse";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { eventFormSchema } from "@/lib/validation/event-form";
import { cn } from "@/lib/utils";

const editSchema = eventFormSchema;
type EditForm = z.infer<typeof editSchema>;

function toIsoStart(date: Date, time: string): string {
  const match = time.trim().match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);
  if (!match) throw new Error("Invalid time");
  const [h, m] = time.split(":").map((n) => Number.parseInt(n, 10)) as [number, number];
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function toIsoEnd(
  date: Date,
  time: string,
  endTime: string,
): string {
  if (endTime.length >= 4) {
    return toIsoStart(date, endTime);
  }
  const t = toIsoStart(date, time);
  const d = new Date(t);
  d.setHours(d.getHours() + 1);
  return d.toISOString();
}

function fromEvent(e: EventWithCreator): EditForm {
  const start = parseISO(e.start_time);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const st = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  const endD = e.end_time ? parseISO(e.end_time) : null;
  const et = endD ? `${pad(endD.getHours())}:${pad(endD.getMinutes())}` : "";
  return {
    title: e.title,
    date: start,
    time: st,
    endTime: et,
    description: e.description ?? "",
    category: e.category,
  };
}

type Props = {
  event: EventWithCreator;
  profile: Profile;
  onChanged: () => void;
  emphasis?: boolean;
  readOnly?: boolean;
};

function canEdit(event: EventWithCreator, profile: Profile) {
  return event.created_by === profile.id || profile.role === "parent";
}

export function EventCard({ event, profile, onChanged, emphasis, readOnly }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const allow = !readOnly && canEdit(event, profile);
  const form = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: fromEvent(event),
  });

  return (
    <>
      <Card className="border-sky-100 bg-card/90">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className={cn(
                  "font-bold tracking-tight text-foreground",
                  emphasis ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
                )}
              >
                {event.creator.full_name}
              </p>
              <p
                className={cn(
                  "mt-1 text-muted-foreground",
                  emphasis ? "text-lg sm:text-xl" : "text-base sm:text-lg",
                )}
              >
                {event.title}
              </p>
              <div
                className={cn("mt-2 flex flex-wrap items-center gap-2", emphasis && "text-lg")}
              >
                {createElement(getCategoryIcon(event.category), {
                  className: "h-5 w-5 text-sky-700",
                  "aria-hidden": true,
                })}
                <span className="text-base font-medium sm:text-lg">
                  {getCategoryLabel(event.category)}
                </span>
                <span className="text-muted-foreground" aria-label={he.eventCard.timeAria}>
                  {format(parseISO(event.start_time), "p", { locale: heLocale })}
                  {event.end_time
                    ? ` – ${format(parseISO(event.end_time), "p", { locale: heLocale })}`
                    : ""}
                </span>
              </div>
            </div>
            {allow ? (
              <div className="flex shrink-0 gap-1 sm:gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="min-h-11 min-w-11"
                  onClick={() => {
                    form.reset(fromEvent(event));
                    setOpen(true);
                  }}
                  aria-label={he.eventCard.editAria}
                >
                  <Pencil className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="min-h-11 min-w-11"
                  onClick={() => setConfirmDelete(true)}
                  aria-label={he.eventCard.deleteAria}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) form.reset(fromEvent(event));
        }}
      >
        <DialogContent className="max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-2xl">{he.eventCard.editTitle}</DialogTitle>
            <DialogDescription className="text-base">
              {he.eventCard.editDesc}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              setSaving(true);
              try {
                const start = toIsoStart(values.date, values.time);
                const end = toIsoEnd(
                  values.date,
                  values.time,
                  values.endTime ?? "",
                );
                const { error } = await supabase
                  .from("events")
                  .update({
                    title: values.title,
                    description: values.description.trim() || null,
                    start_time: start,
                    end_time: end,
                    category: values.category,
                  })
                  .eq("id", event.id);
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success(he.eventCard.toastUpdated);
                setOpen(false);
                onChanged();
              } catch (e) {
                toast.error(
                  e instanceof Error ? e.message : he.eventCard.updateFailed,
                );
              } finally {
                setSaving(false);
              }
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor={`e-title-${event.id}`} className="text-base">
                {he.eventCard.whoVisiting}
              </Label>
              <Input
                id={`e-title-${event.id}`}
                className="min-h-12 text-lg"
                {...form.register("title")}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">{he.eventCard.date}</Label>
              <Controller
                name="date"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger
                      type="button"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "inline-flex h-auto min-h-12 w-full items-center gap-2 px-3 py-2 text-start text-lg font-normal",
                      )}
                    >
                      <CalendarIcon className="h-5 w-5 shrink-0" aria-hidden />
                      {format(field.value, "PPP", { locale: heLocale })}
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
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-base">{he.eventCard.start}</Label>
                <Input type="time" className="min-h-12" {...form.register("time")} />
              </div>
              <div className="space-y-2">
                <Label className="text-base">{he.eventCard.end}</Label>
                <Input type="time" className="min-h-12" {...form.register("endTime")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base">{he.eventCard.type}</Label>
              <Controller
                name="category"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="min-h-12 text-lg">
                      <span className="truncate">{getCategoryLabel(field.value)}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_CATEGORY_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>{he.eventCard.notes}</Label>
              <Textarea rows={3} className="text-base" {...form.register("description")} />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                className="min-h-11"
              >
                {he.eventCard.cancel}
              </Button>
              <Button type="submit" disabled={saving} className="min-h-11">
                {saving ? he.eventCard.saving : he.eventCard.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-2xl">{he.eventCard.deleteTitle}</DialogTitle>
            <DialogDescription className="text-base">
              {he.eventCard.deleteDesc}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmDelete(false)}
              className="min-h-11"
            >
              {he.eventCard.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11"
              onClick={async () => {
                setSaving(true);
                const { error } = await supabase.from("events").delete().eq("id", event.id);
                setSaving(false);
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success(he.eventCard.toastRemoved);
                setConfirmDelete(false);
                onChanged();
              }}
              disabled={saving}
            >
              {saving ? he.eventCard.deleteWorking : he.eventCard.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
