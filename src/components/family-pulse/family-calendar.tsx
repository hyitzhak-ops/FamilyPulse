"use client";

import {
  addDays,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { he as heLocale } from "date-fns/locale/he";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCategoryLabel } from "@/lib/events/map-category";
import { normalizeEventRows } from "@/lib/events/normalize";
import { he } from "@/lib/i18n/he";
import type { EventWithCreator, Profile } from "@/types/family-pulse";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCard } from "./event-card";
import { cn } from "@/lib/utils";

type Props = {
  profile: Profile;
  initialEvents: EventWithCreator[];
  /** `focus`: לוח חודשי רחב ונוח לקריאה (דף תצוגה בלבד). */
  calendarLayout?: "default" | "focus";
  /** מסתיר עריכה/מחיקה בכרטיסי אירועים. */
  readOnly?: boolean;
};

async function fetchEvents(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("events")
    .select(
      `
        id, created_at, title, description, start_time, end_time, category, created_by,
        profiles!events_created_by_fkey ( id, full_name )
      `,
    )
    .order("start_time", { ascending: true });

  if (error) throw new Error(error.message);
  return normalizeEventRows(data);
}

export function FamilyCalendar({
  profile,
  initialEvents,
  calendarLayout = "default",
  readOnly = false,
}: Props) {
  const [events, setEvents] = useState<EventWithCreator[]>(initialEvents);
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const isParent = profile.role === "parent";
  const isFocusLayout = calendarLayout === "focus";
  const largeUI = isParent || isFocusLayout;
  const supabase = useMemo(() => createClient(), []);

  const refresh = useCallback(() => {
    void fetchEvents(supabase)
      .then((rows) => setEvents(rows))
      .catch((err: Error) => console.error(err));
  }, [supabase]);

  useEffect(() => {
    const channel = supabase
      .channel("public:events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          void fetchEvents(supabase).then(setEvents).catch(console.error);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const weekStart = useMemo(
    () => startOfWeek(selected ?? new Date(), { weekStartsOn: 0 }),
    [selected],
  );
  const weekDays = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) }),
    [weekStart],
  );

  const eventsByDay = useCallback(
    (d: Date) => events.filter((ev) => isSameDay(parseISO(ev.start_time), d)),
    [events],
  );

  const modifiers = useMemo(() => {
    return {
      hasEvent: (d: Date) => eventsByDay(d).length > 0,
    };
  }, [eventsByDay]);

  const dayModifiersClassNames = {
    hasEvent: "font-semibold ring-1 ring-sky-500/50",
  };

  const listForSelected = useMemo(
    () =>
      selected
        ? eventsByDay(selected).sort((a, b) => a.start_time.localeCompare(b.start_time))
        : [],
    [eventsByDay, selected],
  );

  const monthIndexEvents = useMemo(
    () =>
      events
        .filter((e) => isSameMonth(parseISO(e.start_time), month))
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [events, month],
  );

  const monthDayCellExtra = useCallback(
    (d: Date) => {
      const evs = eventsByDay(d).sort((a, b) => a.start_time.localeCompare(b.start_time));
      if (evs.length === 0) return null;
      const line = (e: EventWithCreator) => {
        const t = e.title?.trim();
        return t && t.length > 0 ? t : getCategoryLabel(e.category);
      };
      if (evs.length === 1) {
        return (
          <span className="block w-full truncate font-normal normal-case">
            {line(evs[0])}
          </span>
        );
      }
      if (evs.length === 2) {
        return (
          <>
            <span className="block w-full truncate font-normal normal-case">{line(evs[0])}</span>
            <span className="block w-full truncate font-normal normal-case">{line(evs[1])}</span>
          </>
        );
      }
      return (
        <>
          <span className="block w-full truncate font-normal normal-case">{line(evs[0])}</span>
          <span className="block w-full truncate font-normal normal-case">
            {line(evs[1])}
            {` +${evs.length - 2}`}
          </span>
        </>
      );
    },
    [eventsByDay],
  );

  return (
    <Card
      className={cn(
        "border-sky-200/60 bg-gradient-to-b from-sky-50/40 to-card",
        largeUI && "min-h-[70vh]",
        isFocusLayout && "shadow-md",
      )}
    >
      <CardHeader className="space-y-3 sm:flex sm:flex-row sm:items-end sm:justify-between sm:space-y-0">
        <div>
          <CardTitle
            className={cn("text-2xl", largeUI && "text-3xl sm:text-4xl font-semibold")}
          >
            {he.calendar.title}
          </CardTitle>
          <CardDescription className={cn("text-base", largeUI && "text-lg")}>
            {isFocusLayout
              ? he.calendar.familyDesc
              : isParent
                ? he.calendar.parentDesc
                : he.calendar.familyDesc}
          </CardDescription>
        </div>
        <div className="w-full sm:w-[240px]">
          <Tabs
            value={view}
            onValueChange={(v) => v === "month" || v === "week" ? setView(v) : undefined}
          >
            <TabsList className="grid w-full grid-cols-2 min-h-12 text-base">
              <TabsTrigger value="month" className="text-base sm:text-lg">
                {he.calendar.month}
              </TabsTrigger>
              <TabsTrigger value="week" className="text-base sm:text-lg">
                {he.calendar.week}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {view === "month" ? (
          <div
            className={cn(
              "grid gap-6",
              isFocusLayout
                ? "xl:grid-cols-[minmax(0,1fr),minmax(280px,420px)]"
                : "lg:grid-cols-[1fr,320px] xl:grid-cols-[1.2fr,380px]",
            )}
          >
            <div
              className={cn(
                "flex w-full justify-center",
                !isFocusLayout && "mx-auto max-w-4xl",
              )}
            >
              <div
                className={cn(
                  "w-full rounded-2xl border border-border/60 p-2 shadow-sm",
                  largeUI && !isFocusLayout && "p-3 sm:p-4",
                  isFocusLayout && "p-2 sm:p-3",
                )}
              >
                <Calendar
                  month={month}
                  onMonthChange={setMonth}
                  mode="single"
                  selected={selected}
                  onSelect={setSelected}
                  locale={heLocale}
                  className={cn(
                    "w-full max-w-none",
                    isFocusLayout
                      ? "[--cell-size:2.05rem] sm:[--cell-size:2.25rem] md:[--cell-size:2.45rem] lg:[--cell-size:2.65rem]"
                      : "[--cell-size:2.5rem] sm:[--cell-size:2.85rem] md:[--cell-size:3rem]",
                    largeUI && "text-base sm:text-lg",
                    largeUI &&
                      "[&_.rdp-weekday]:text-sm sm:[&_.rdp-weekday]:text-base",
                  )}
                  classNames={{
                    root: "w-full max-w-full min-w-0",
                    caption_label: isFocusLayout
                      ? "text-base sm:text-lg font-semibold"
                      : undefined,
                  }}
                  dayCellExtra={view === "month" ? monthDayCellExtra : undefined}
                  modifiers={modifiers}
                  modifiersClassNames={dayModifiersClassNames as Record<string, string>}
                />
              </div>
            </div>
            <div className="min-h-[12rem] space-y-3">
              <p
                className={cn("font-medium text-foreground", largeUI ? "text-xl" : "text-lg")}
              >
                {selected
                  ? format(selected, "PPPP", { locale: heLocale })
                  : he.calendar.pickDay}
              </p>
              {selected && listForSelected.length === 0 ? (
                <p className="text-muted-foreground text-lg">
                  {he.calendar.noEventsDay}
                </p>
              ) : null}
              <ScrollArea className={cn("h-[50vh] pe-3", largeUI && "h-[55vh] xl:h-[60vh]")}>
                <ul className="space-y-3" aria-live="polite" aria-atomic="false">
                  {listForSelected.map((e) => (
                    <li key={e.id}>
                      <EventCard
                        event={e}
                        profile={profile}
                        onChanged={refresh}
                        emphasis={isParent || isFocusLayout}
                        readOnly={readOnly}
                      />
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className={cn(
                "grid grid-cols-1 overflow-hidden rounded-lg border-2 border-border bg-card shadow-sm sm:grid-cols-7 sm:gap-0",
                largeUI && "text-lg",
              )}
            >
              {weekDays.map((d) => {
                const dayItems = eventsByDay(d);
                const dayLabel = `${he.calendar.ariaDayEventsPrefix}${format(d, "PPP", { locale: heLocale })}`;
                return (
                  <div
                    key={d.toISOString()}
                    className={cn(
                      "min-h-36 border-b border-border/90 bg-background p-2 sm:min-h-64 sm:border-s sm:border-b-0 sm:first:border-s-0",
                      isFocusLayout && "sm:min-h-[18rem] lg:min-h-[22rem]",
                      isSameDay(d, new Date()) && "border-sky-600/50 bg-sky-50/70 ring-1 ring-sky-500/40 z-[1]",
                    )}
                  >
                    <div className="text-center text-sm text-muted-foreground sm:text-start">
                      {format(d, "EEE", { locale: heLocale })}
                    </div>
                    <div
                      className={cn(
                        "text-center font-semibold sm:text-start",
                        largeUI ? "text-2xl sm:text-3xl" : "text-lg",
                      )}
                    >
                      {format(d, "d")}
                    </div>
                    <ul className="mt-2 space-y-2" aria-label={dayLabel}>
                      {dayItems.map((e) => (
                        <li key={e.id} className="min-w-0">
                          <p
                            className="font-semibold leading-tight"
                            title={e.creator.full_name}
                          >
                            {e.creator.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 sm:text-base">
                            {e.title}
                          </p>
                          <p className="text-xs text-muted-foreground sm:text-sm">
                            {format(parseISO(e.start_time), "p", { locale: heLocale })}{" "}
                            — {getCategoryLabel(e.category)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <p className="text-muted-foreground text-base sm:text-lg">
              שבוע של {format(weekStart, "PPP", { locale: heLocale })}.{" "}
              {he.calendar.weekHintSuffix}
            </p>
          </div>
        )}

        {view === "month" && monthIndexEvents.length > 0 ? (
          <div className="space-y-2">
            <p
              className={cn("font-medium text-foreground", largeUI ? "text-2xl" : "text-xl")}
            >
              {he.calendar.monthGlancePrefix}
              {format(startOfMonth(month), "MMMM yyyy", { locale: heLocale })}
            </p>
            <ScrollArea
              className={cn(
                "rounded-lg border border-dashed p-2",
                isFocusLayout ? "h-52 sm:h-56" : "h-40 sm:h-48",
              )}
            >
              <ul className="space-y-2" aria-label={he.calendar.monthGlanceAria}>
                {monthIndexEvents.map((e) => (
                  <li key={e.id}>
                    <div
                      className={cn(
                        "flex flex-wrap items-baseline justify-between gap-2",
                        largeUI ? "text-lg" : "text-base",
                      )}
                    >
                      <span className="font-semibold">{e.creator.full_name}</span>
                      <time
                        dateTime={e.start_time}
                        className="text-muted-foreground text-sm sm:text-base"
                      >
                        {format(parseISO(e.start_time), "Pp", { locale: heLocale })} —{" "}
                        {e.title}
                      </time>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
