# FamilyPulse

Shared family calendar: large, high-contrast UI for parents and a quick “add event” **sidebar** for the rest of the family. **Google sign-in** via **Supabase Auth** (no app-managed passwords), **Row Level Security** in Postgres, and **Supabase Realtime** so the calendar updates without a refresh.

**Hebrew Supabase checklist (this project ref):** see [docs/SUPABASE-HE.md](docs/SUPABASE-HE.md).

## Setup

1. Create a [Supabase](https://supabase.com) project (or use existing `reoggbwudljcgyxguoes`). In the SQL editor, run `supabase/migrations/001_init_familypulse.sql` (tables, RLS, new-user profile trigger, realtime for `events`).
2. In Supabase **Authentication → Providers**, enable **Google** and set redirect URL `http://localhost:3000/auth/callback` (and your Vercel URL in production).
3. Copy `.env.local.example` to `.env.local` and add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Project settings → API**.
4. Run `npm install` and `npm run dev`, then open [http://localhost:3000](http://localhost:3000) (unauthenticated users are sent to sign-in).

`npm run dev` uses **Webpack** on purpose: Turbopack can omit `NEXT_PUBLIC_*` from **middleware**, which breaks the Supabase client (`URL and Key are required`). Use `npm run dev:turbo` only if you know you do not need that fix.

**Grandparent (parent) view:** in Supabase, set a profile to `parent` to allow editing or deleting any event and a larger layout:

`update public.profiles set role = 'parent' where id = '…user uuid…';`

## Tech

[Next.js](https://nextjs.org) (App Router), [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com), [Supabase](https://supabase.com), [Vercel](https://vercel.com).
