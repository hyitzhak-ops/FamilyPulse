# FamilyPulse — לוח משפחה משותף

אפליקציית **Next.js** לניהול לוח זמנים משפחתי: ביקורים, רופאים, שבת וחגים. הממשק בעברית וב־**RTL**, עם התחברות **Google** דרך **Supabase Auth** (ללא סיסמאות באפליקציה), נתונים ב־**Postgres** עם **Row Level Security (RLS)**, ועדכונים בזמן אמת ב־**Supabase Realtime**.

**מאגר GitHub:** [https://github.com/hyitzhak-ops/FamilyPulse](https://github.com/hyitzhak-ops/FamilyPulse)

---

## מטרת המוצר

| קהל | חוויה |
|-----|--------|
| **בני משפחה (`family`)** | אחרי התחברות: תצוגת **לוח לקריאה בלבד** כברירת מחדל; כפתור מעבר ל־**הוספה ועריכה** (טופס מהיר + לוח חודשי/שבועי). |
| **הורים / סבים (`parent`)** | רק **תצוגת לוח** מוגדלת וקריאה — בלי טופס הוספה; מתאים למשתמשים שצריכים לראות את התכנית בלי לערוך. |

כולם רואים את אותם אירועים; שינויים מסתנכרנים בין מכשירים בזכות Realtime.

---

## ארכיטקטורה (תמצית)

```
[דפדפן]
    │
    ├─► Next.js App Router (RSC + Client Components)
    │       middleware ──► Supabase SSR (עוגיות סשן)
    │
    ├─► Supabase Auth (Google OAuth)
    │
    └─► Supabase Postgres (`profiles`, `events`) + RLS
            Realtime channel על `public.events`
```

- **שרת:** דפי `app/*/page.tsx` טוענים פרופיל ואירועים עם `createClient()` מ־`@/lib/supabase/server`.
- **לקוח:** טפסים, לוח ו־Realtime — `createClient()` מ־`@/lib/supabase/client`.
- **ביניים:** `src/middleware.ts` קורא ל־`updateSession` כדי לרענן עוגיות Supabase בכל בקשה.

**בנייה:** `next build --webpack` — ה־`NEXT_PUBLIC_*` מוזרקים גם ל־middleware דרך `next.config.ts` (DefinePlugin), כדי שלא יופיעו שגיאות מסוג "URL and Key required" כמו ב־Turbopack בלבד.

---

## מבנה קבצים וחיבורים

### שורש הפרויקט

| נתיב | תפקיד |
|------|--------|
| `package.json` | סקריפטים: `dev` / `build` עם `--webpack`, Supabase CLI עזר. |
| `next.config.ts` | טעינת `.env.local` + העברת משתני Supabase לבנדל (כולל middleware). |
| `tsconfig.json` | נתיב `@/*` → `src/*`. |
| `components.json` | הגדרות shadcn/ui. |
| `postcss.config.mjs` | Tailwind v4. |
| `eslint.config.mjs` | ESLint. |
| `.env.local.example` | דוגמה למשתני סביבה (**לא** מכיל מפתחות אמיתיים). |
| `.gitignore` | מתעלם מ־`node_modules`, `.next`, `.env*` (חוץ מ־`.env.local.example`), `supabase/.temp/`. |
| `docs/SUPABASE-HE.md` | מדריך עברי: Google, כתובות הפניה, Vercel, ref פרויקט Supabase. |
| `scripts/check-supabase-env.cjs` | בדיקת נוכחות משתני Supabase. |

### `src/app` — App Router

| נתיב | סוג | תפקיד |
|------|-----|--------|
| `layout.tsx` | Server | `lang="he"`, `dir="rtl"`, פונט Noto Sans Hebrew, `AppProviders`. |
| `page.tsx` | Server | משתמש מחובר → `redirect("/dashboard/view")`. |
| `globals.css` | — | עיצוב גלובלי + Tailwind. |
| `login/page.tsx` | Server | מסך התחברות + `GoogleSignInButton`. |
| `auth/callback/route.ts` | Route Handler | החלפת `code` מ־OAuth לסשן; הפניה ל־`next` (ברירת מחדל `/dashboard/view`). |
| `dashboard/page.tsx` | Server | אימות + פרופיל; אם הכל תקין → `redirect("/dashboard/view")`; אם חסר פרופיל — הודעת "השלמת התקנה". |
| `dashboard/view/page.tsx` | Server | `ViewOnlyShell` + `FamilyCalendar` במצב `calendarLayout="focus"` ו־`readOnly`. |
| `dashboard/edit/page.tsx` | Server | `DashboardShell` (טופס + לוח). משתמש `parent` מופנה חזרה ל־`/dashboard/view`. |
| `not-found.tsx` | — | דף 404. |

### `src/components/family-pulse` — דומיין המוצר

| קובץ | תפקיד |
|------|--------|
| `view-only-shell.tsx` | מעטפת כותרת לתצוגת לוח: לוגו, מייל, יציאה; ל־`family` — קישור ל־`/dashboard/edit`. |
| `dashboard-shell.tsx` | מעטפת עריכה: כותרת FamilyPulse, קישור ל־`/dashboard/view`, טופס בצד + לוח. |
| `add-event-form.tsx` | טופס Client: הוספת אירוע (`events.insert`). |
| `family-calendar.tsx` | לוח חודש/שבוע, מנוי Realtime ל־`events`, `dayCellExtra` לתקציר בתאים. |
| `event-card.tsx` | כרטיס אירוע; עריכה/מחיקה לפי RLS + `readOnly`. |
| `google-sign-in-button.tsx` | `signInWithOAuth`; `redirectTo` מבוסס על `NEXT_PUBLIC_SITE_URL` או `window.location.origin`. |

### `src/components/ui`

רכיבי **shadcn/ui** (כפתורים, כרטיסים, דיאלוג, `calendar.tsx` מעל react-day-picker, וכו') — משמשים את מסכי המשפחה.

### `src/lib`

| נתיב | תפקיד |
|------|--------|
| `supabase/server.ts` | `createServerClient` ל־Server Components / Route Handlers. |
| `supabase/client.ts` | `createBrowserClient` לקומפוננטות `"use client"`. |
| `supabase/middleware.ts` | רענון סשן בעוגיות; הפניות login/dashboard; דף שגיאה אם חסרים מפתחות. |
| `supabase/publishable-env.ts` | קריאת `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY`. |
| `i18n/he.ts` | כל מחרוזות ה־UI בעברית. |
| `events/normalize.ts` | המרת שורות Supabase ל־`EventWithCreator`. |
| `events/map-category.ts` | תוויות ואייקונים לקטגוריות אירוע. |
| `validation/event-form.ts` | סכמת Zod לטפסים. |
| `utils.ts` | `cn()` ועזרים ל־Tailwind. |

### `src/types/family-pulse.ts`

טיפוסי TypeScript: `Profile`, `ProfileRole`, `EventCategory`, `EventWithCreator`.

### `supabase/`

| נתיב | תפקיד |
|------|--------|
| `migrations/001_init_familypulse.sql` | טבלאות `profiles` / `events`, טריגר משתמש חדש, מדיניות RLS, הרשאת Realtime. |
| `config.toml` | תצורת CLI (אם משתמשים ב־`supabase link` / `db push`). |

**לא לדחוף ל־Git:** תיקיית `supabase/.temp/` (מצב מקומי של CLI) — מוזנח ב־`.gitignore`.

---

## מסד נתונים (לוגי)

- **`profiles`:** שורה לכל משתמש מ־`auth.users` — `full_name`, `role` (`parent` | `family`).
- **`events`:** אירוע עם `title`, זמני התחלה/סיום, `category`, `created_by` → `profiles`.

מדיניות RLS (בקובץ המיגרציה): משתמשים מחוברים קוראים אירועים ופרופילים; כתיבה לפי יוצר או תפקיד הורה (לפי ההגדרה ב־SQL).

---

## משתני סביבה

העתק מ־`.env.local.example` ל־**`.env.local`** (מקומי בלבד, לא ב־Git):

| משתנה | חובה | הסבר |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | כן | כתובת הפרויקט ב־Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | כן | מפתח anon מהדשבורד. |
| `NEXT_PUBLIC_SITE_URL` | מומלץ בפרודקשן | כתובת האתר הציבורית (למשל `https://xxx.vercel.app`) בלי `/` בסוף — ל־OAuth; ראה `docs/SUPABASE-HE.md`. |

---

## הרצה מקומית

```bash
npm install
cp .env.local.example .env.local
# ערוך .env.local והדבק URL + anon key מ-Supabase → Settings → API
```

הרץ את ה־SQL ב־Supabase (עורך SQL) מתוך `supabase/migrations/001_init_familypulse.sql`, ואז:

```bash
npm run dev
```

פתחו `http://localhost:3000` — ללא סשן תועברו ל־`/login`.

---

## פריסה ל־Vercel

1. חיבור הריפו [FamilyPulse](https://github.com/hyitzhak-ops/FamilyPulse) לפרויקט ב־Vercel.
2. הגדרת אותם משתני סביבה (לפחות שני ה־`NEXT_PUBLIC_SUPABASE_*`; מומלץ גם `NEXT_PUBLIC_SITE_URL`).
3. ב־Supabase → **Authentication → URL Configuration**: **Site URL** + **Redirect URLs** לכתובת ה־Vercel ו־`/auth/callback`.
4. ב־Google Cloud → **Authorized JavaScript origins** — הוסיפו את דומיין ה־Vercel.

פירוט: [docs/SUPABASE-HE.md](docs/SUPABASE-HE.md).

---

## סקריפטים שימושיים

| פקודה | מטרה |
|--------|------|
| `npm run dev` | פיתוח עם Webpack (מומלץ). |
| `npm run build` / `npm start` | בנייה והרצת production. |
| `npm run lint` | ESLint. |
| `npm run check:env` | בדיקת משתני Supabase. |
| `npm run supabase:link` / `supabase:push` | לינק ומיגרציות (אחרי `supabase login`). |

---

## אבטחה

- **לעולם אל תעלה** קובץ `.env.local` או מפתחות service-role לריפו ציבורי.
- אם מפתח דלף — החליפו אותו ב־Supabase והגדירו מחדש ב־Vercel.

---

## רישיון ותרומות

פרויקט פרטי/משפחתי; ניתן להרחיב לפי הצורך. לשאלות טכניות לפי המבנה לעיל — עקבו אחרי הנתיבים ב־`src/app` ו־`src/components/family-pulse`.
