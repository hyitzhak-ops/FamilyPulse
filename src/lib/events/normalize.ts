import type { EventWithCreator } from "@/types/family-pulse";

type RawEvent = {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  category: EventWithCreator["category"];
  created_by: string;
  profiles: { full_name: string; id: string } | { full_name: string; id: string }[] | null;
};

function asProfile(
  p: RawEvent["profiles"],
): { full_name: string; id: string } | null {
  if (!p) return null;
  if (Array.isArray(p)) return p[0] ?? null;
  return p;
}

export function normalizeEventRow(row: unknown): EventWithCreator | null {
  const e = row as RawEvent;
  const p = asProfile(e.profiles);
  if (!e?.id || !p) return null;
  return {
    id: e.id,
    created_at: e.created_at,
    title: e.title,
    description: e.description,
    start_time: e.start_time,
    end_time: e.end_time,
    category: e.category,
    created_by: e.created_by,
    creator: { id: p.id, full_name: p.full_name },
  };
}

export function normalizeEventRows(data: unknown[] | null | undefined) {
  return (data ?? [])
    .map((row) => normalizeEventRow(row))
    .filter((x): x is EventWithCreator => x !== null);
}
