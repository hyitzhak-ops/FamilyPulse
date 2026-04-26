# חיבור FamilyPulse ל-Supabase (פרויקט `reoggbwudljcgyxguoes`)

אי אפשר למלא בשבילך את **מפתח ה-API** מהדשבורד — הוא סודי ומוצג רק אחרי התחברות שלך. כבר הוגדר אצלך בקוד:

- כתובת הפרויקט: `https://reoggbwudljcgyxguoes.supabase.co`
- קובץ `.env.local` (במחשב שלך) — יש להדביק שם את ה-**anon public** key

## 1) מפתחות ב-Next.js (חובה)

1. פתח: [Project Settings → API](https://supabase.com/dashboard/project/reoggbwudljcgyxguoes/settings/api)
2. העתק **Project URL** (אמור להתאים לכתובת למעלה) ו-**anon public** key
3. פתח את הקובץ `.env.local` בשורש הפרויקט והדבק:

```env
NEXT_PUBLIC_SUPABASE_URL=https://reoggbwudljcgyxguoes.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<הדבק כאן את ה-anon key מהדשבורד>
```

4. הרץ `npm run dev` (הפרויקט מוגדר עם **Webpack** כדי ש־`.env.local` ייטען נכון ב־**middleware** של Supabase; אם תקבל שגיאת "URL and Key are required", ודא שאתה לא מריץ `next dev --turbopack` בלי `--webpack`).

## 2) טבלאות, RLS ו-Realtime (חובה, פעם אחת)

1. פתח: [SQL Editor](https://supabase.com/dashboard/project/reoggbwudljcgyxguoes/sql/new)
2. העתק את **כל** התוכן מקובץ  
   `supabase/migrations/001_init_familypulse.sql`
3. הדבק בעורך והרץ **Run**

אם יש שגיאה על `execute function`, החלף את השורה של הטריגר ל:

```sql
for each row execute procedure public.handle_new_user();
```

## 3) Google Sign-In (חובה — אחרת תקבל `provider is not enabled`)

השגיאה **`Unsupported provider: provider is not enabled`** אומרת שב-Supabase **לא הופעל** ספק Google. בלי זה לא יהיה OAuth.

### א) Google Cloud Console

1. פתח [Google Cloud Console](https://console.cloud.google.com/) → בחר/צור פרויקט.
2. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
3. סוג אפליקציה: **Web application**.
4. תחת **Authorized redirect URIs** הוסף **בדיוק** (העתק מהדשבורד של Supabase — **אסור טעות באות אחת**):

   `https://reoggbwudljcgyxguoes.supabase.co/auth/v1/callback`

   - בסוף ה-ref חייב להיות **`guoes`** (כמו ב־`...xguoes.supabase.co`), לא `guoee` ולא שום וריאנט אחר.
   - זו כתובת ה-callback של **Supabase**, לא של localhost.

5. תחת **Authorized JavaScript origins** הוסף (לפיתוח):

   `http://localhost:3000`

6. לחץ **Save** ב-Google — העתק **Client ID** ו-**Client Secret**.

### ב) Supabase — להפעיל את Google

1. פתח [Authentication → Providers → Google](https://supabase.com/dashboard/project/reoggbwudljcgyxguoes/auth/providers).
2. הפעל את **Google** (Enable).
3. הדבק את **Client ID** ו-**Client Secret** מהמסך הקודם ושמור.

### ג) Supabase — כתובות חזרה לאפליקציה שלך

1. [Authentication → URL Configuration](https://supabase.com/dashboard/project/reoggbwudljcgyxguoes/auth/url-configuration).
2. תחת **Redirect URLs** (רשימת כתובות מותרות ל־`redirect_to` אחרי OAuth) הוסף **את כל** הכתובות שבהן האפליקציה רצה, בדיוק כפי שמופיעות בדפדפן (כולל `https`, בלי סלאש מיותר בסוף):

   - `http://localhost:3000/auth/callback` (פיתוח)
   - `https://<שם-הפרויקט>.vercel.app/auth/callback` (פרודקשן — החלף בכתובת האמיתית שלך, למשל מהדומיין ב־Vercel)

3. **Site URL** — זו כתובת ברירת המחדל שאליה Supabase מפנה אם משהו לא תואם לרשימת ה־Redirect URLs או אם חסר `redirect_to` תקין.

   - **לפיתוח בלבד:** אפשר `http://localhost:3000`.
   - **אם האפליקציה בפרודקשן ב-Vercel:** חובה להגדיר **Site URL** לכתובת הפרודקשן, למשל `https://<שם>.vercel.app` (או דומיין מותאם אישית). אם משאירים כאן `localhost`, אחרי התחברות מ-Google לעיתים תופנה ל־`http://localhost:3000/...` גם כשגלשת מהאתר החי — וזה בדיוק התסמין שתיארת.

4. (מומלץ ב-Vercel) בהגדרות הפרויקט ב-Vercel → **Environment Variables**, הוסף:

   `NEXT_PUBLIC_SITE_URL=https://<שם>.vercel.app`  

   (בלי סלאש בסוף.) כך גם אם יש proxy או מצב נדיר של מקור בקשה, כתובת ה־OAuth תישאר נכונה.

5. ב־**Google Cloud Console** → ה־OAuth client → **Authorized JavaScript origins** — הוסף גם את כתובת ה־Vercel:

   `https://<שם>.vercel.app`

אחרי שמירה — חזור לאפליקציה, רענן, ונסה שוב **Continue with Google**.

### אם עדיין מופיע `provider is not enabled`

1. ב-Supabase: [Providers → Google](https://supabase.com/dashboard/project/reoggbwudljcgyxguoes/auth/providers) — ודא שהמתג **Enabled** דולק, שיש **Client ID** ו-**Secret**, ולחצת **Save** (לפעמים צריך לשמור פעמיים).
2. בדוק שב־`.env.local` ה־URL זהה **בדיוק** ל־**Project URL** ב־[Settings → API](https://supabase.com/dashboard/project/reoggbwudljcgyxguoes/settings/api) (אותו `...guoes...`).
3. ב-Google Cloud: ה־**Redirect URI** חייב להיות **זהה** לכתובת בפרק א׳ למעלה (כולל `guoes`).
4. נסה חלון גלישה בסתר או דפדפן אחר אחרי שינוי הגדרות.

## 4) (אופציונלי) CLI — לינק ומיגרציות מהטרמינל

דורש התחברות ל-Supabase CLI:

```bash
npm run supabase:login
npm run supabase:link
npm run supabase:push
```

## 5) תפקיד "הורה" (סבא/סבתא — תצוגה גדולה + עריכה לכל האירועים)

ב-SQL Editor:

```sql
update public.profiles set role = 'parent' where id = 'UUID-של-המשתמש-מ-auth.users';
```

UUID אפשר לראות ב-[Authentication → Users](https://supabase.com/dashboard/project/reoggbwudljcgyxguoes/auth/users).
