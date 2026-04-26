/** מחרוזות ממשק בעברית — FamilyPulse */
export const he = {
  meta: {
    title: "FamilyPulse — לוח משפחה",
    description:
      "לוח משפחה משותף, נעים לעין וקל לקריאה — ביקורים, רופאים וחגים, עם עדכונים בזמן אמת.",
  },
  login: {
    tagline:
      "לוח משפחה שקט וברור. התחברות עם Google — בלי סיסמה נפרדת לזכור.",
    signInTitle: "התחברות",
    signInDesc:
      "אנחנו משתמשים בכניסה עם Google כדי לשמור על החשבון מאובטח (OAuth / OIDC).",
    authError: "לא הצלחנו להשלים את ההתחברות. נסה שוב.",
    newUserHint:
      "פעם ראשונה? הפרופיל נוצר אוטומטית בפעם הראשונה שאתה נכנס.",
    googleContinue: "המשך עם Google",
    googleRedirect: "מעביר ל-Google…",
  },
  dashboard: {
    finishSetup: "השלמת התקנה",
    finishSetupBodyBefore: "פרופיל החשבון עדיין נוצר, או שמסד הנתונים לא מוכן. הרץ את ה-SQL בקובץ",
    finishSetupBodyAfter:
      "בעורך ה-SQL של Supabase, ואז צא מהחשבון והתחבר שוב.",
    invalidRole:
      "תפקיד לא תקין במסד הנתונים. השתמש ב־parent או ב־family (או תקן ב-SQL).",
    eventsLoadError: "לא ניתן לטעון אירועים:",
    parentView: "תצוגת הורה",
    familyView: "תצוגת משפחה",
    signOut: "יציאה מהחשבון",
    sidebarAria: "טופס הוספת אירוע מהירה למשפחה",
    mainAria: "לוח משפחה משותף",
    openLargeCalendar: "תצוגת לוח גדולה (קריאה בלבד)",
    backToEditor: "חזרה להוספה ולעריכה",
    viewOnlyTitle: "לוח המשפחה",
    viewOnlySubtitleParent:
      "תצוגה נוחה לקריאה בלבד — כל התכנון שבני המשפחה הוסיפו. אין כאן הוספה או מחיקה.",
    viewOnlySubtitleFamily:
      "תצוגת לוח לקריאה בלבד. להוספה או עריכה — הכפתור «חזרה להוספה ולעריכה» למעלה.",
  },
  addEvent: {
    cardTitle: "הוספה מהירה",
    cardDesc:
      "הוספת ביקור, תור או מפגש משפחתי. כולם רואים את השינוי מיד.",
    whoVisiting: "מי מבקר / מה האירוע",
    whoPlaceholder: "למשל: שרה, ד״ר לוין, בני הדודים",
    date: "תאריך",
    pickDay: "בחרו יום",
    startTime: "שעת התחלה",
    endTime: "שעת סיום",
    activityType: "סוג פעילות",
    notes: "הערות",
    notesPlaceholder: "רשות: חדר, הסעות, תזכורות",
    submit: "הוספה ללוח",
    saving: "שומר…",
    toastAdded: "האירוע נוסף",
    toastGenericError: "משהו השתבש, נסה שוב.",
  },
  calendar: {
    title: "לוח המשפחה",
    parentDesc:
      "תצוגה גדולה וברורה של כל התכנונים — מתעדכנת בזמן אמת.",
    familyDesc:
      "בחרו יום כדי לראות פרטים. רישומים חדשים מופיעים לכולם מיד.",
    month: "חודש",
    week: "שבוע",
    pickDay: "בחרו יום",
    noEventsDay: "אין אירועים ביום הזה.",
    weekHintSuffix:
      "לעריכה מלאה עברו לתצוגת חודש ובחרו יום, או השתמשו בטופס בצד.",
    monthGlancePrefix: "כל האירועים ב־",
    monthGlanceAria: "סיכום החודש",
    ariaDayEventsPrefix: "אירועים ל־",
  },
  eventCard: {
    timeAria: "שעת האירוע",
    editAria: "עריכת אירוע",
    deleteAria: "מחיקת אירוע",
    editTitle: "עריכת אירוע",
    editDesc: "ניתן לערוך אם יצרת את האירוע, או אם אתם בהגדרת הורה.",
    whoVisiting: "מי מבקר / כותרת",
    date: "תאריך",
    start: "התחלה",
    end: "סיום",
    type: "סוג",
    notes: "הערות",
    cancel: "ביטול",
    save: "שמירה",
    saving: "שומר…",
    deleteTitle: "להסיר את האירוע?",
    deleteDesc:
      "לא ניתן לבטל. רק מי שיצר את הרשומה, או הורה, יכולים למחוק.",
    delete: "מחיקה",
    deleteWorking: "…",
    toastUpdated: "האירוע עודכן",
    toastRemoved: "האירוע הוסר",
    updateFailed: "העדכון נכשל",
  },
  middleware: {
    htmlTitle: "FamilyPulse — הגדרה",
    heading: "חסרה הגדרת Supabase",
    p1: "הוסיפו קובץ",
    p1code: ".env.local",
    p1b: "בשורש הפרויקט (באותה תיקייה כמו",
    p1pkg: "package.json",
    p1c: ") עם:",
    p2: "ואז בטרמינל:",
    p3: "לאימות טעינת משתני סביבה:",
    cmdCheck: "npm run check:env",
  },
  categories: {
    visit: "ביקור",
    doctor: "רופא",
    shabbat: "שבת",
    holiday: "חג",
  },
  zod: {
    titleMin: "כתבו מי מבקר או כותרת לאירוע",
    titleMax: "הכותרת ארוכה מדי",
    timeInvalid: "שעה לא תקינה",
    endTimeInvalid: "שעת סיום לא תקינה",
    descriptionMax: "ההערות ארוכות מדי",
  },
} as const;

export type He = typeof he;
