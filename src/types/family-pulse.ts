export type ProfileRole = "parent" | "family";

export type EventCategory = "visit" | "doctor" | "holiday" | "shabbat";

export type Profile = {
  id: string;
  full_name: string;
  role: ProfileRole;
  avatar_url: string | null;
};

export type EventRow = {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  category: EventCategory;
  created_by: string;
};

export type EventWithCreator = EventRow & {
  creator: Pick<Profile, "full_name" | "id">;
};
