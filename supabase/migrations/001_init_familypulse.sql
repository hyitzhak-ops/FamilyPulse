-- FamilyPulse: schema + RLS + realtime
-- Run in Supabase SQL Editor or via `supabase db push` if using CLI

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null check (role in ('parent', 'family')) default 'family',
  avatar_url text
);

-- Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz,
  category text not null check (category in ('visit', 'doctor', 'holiday', 'shabbat')),
  created_by uuid not null references public.profiles (id) on delete cascade
);

create index if not exists events_start_time_idx on public.events (start_time);
create index if not exists events_created_by_idx on public.events (created_by);

-- New user: profile row (no passwords stored here; auth is OAuth-only in app config)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'Family member'),
    'family'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.events enable row level security;

-- Idempotent policies (safe for SQL Editor re-run and `supabase db push` after partial apply)
drop policy if exists "profiles_select_auth" on public.profiles;
drop policy if exists "profiles_insert_self" on public.profiles;
drop policy if exists "profiles_update_self" on public.profiles;
drop policy if exists "events_select_auth" on public.events;
drop policy if exists "events_insert_auth" on public.events;
drop policy if exists "events_update_creator_or_parent" on public.events;
drop policy if exists "events_delete_creator_or_parent" on public.events;

-- Profiles: any signed-in user can read profiles; users manage only their row
create policy "profiles_select_auth"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_insert_self"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Events: all authenticated family can read; insert only as self; update/delete: creator or parent
create policy "events_select_auth"
  on public.events for select
  to authenticated
  using (true);

create policy "events_insert_auth"
  on public.events for insert
  to authenticated
  with check (created_by = (select auth.uid()));

create policy "events_update_creator_or_parent"
  on public.events for update
  to authenticated
  using (
    created_by = (select auth.uid())
    or (select role from public.profiles p where p.id = (select auth.uid()) limit 1) = 'parent'
  )
  with check (
    created_by = (select auth.uid())
    or (select role from public.profiles p where p.id = (select auth.uid()) limit 1) = 'parent'
  );

create policy "events_delete_creator_or_parent"
  on public.events for delete
  to authenticated
  using (
    created_by = (select auth.uid())
    or (select role from public.profiles p where p.id = (select auth.uid()) limit 1) = 'parent'
  );

-- Realtime: add events only if not already in publication (re-runs safe)
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'events'
  ) then
    alter publication supabase_realtime add table public.events;
  end if;
end $$;

-- Storage (optional avatars) — skip for zero-cost minimal scope
