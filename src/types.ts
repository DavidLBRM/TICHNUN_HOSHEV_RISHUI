export interface ChecklistItem {
  id: string;
  category: 'א' | 'ב' | 'ג' | 'ד' | 'ה';
  code: string;
  title: string;
  description: string;
  isCritical: boolean;
  type: 'forbidden' | 'terminology' | 'structure' | 'appendix';
}

export interface ReviewIssue {
  category: string;
  ruleCode: string;
  ruleTitle: string;
  quote: string;
  sectionNumber: string;
  explanation: string;
  suggestion: 'delete' | 'replace' | 'modify';
  suggestedText: string;
}

export interface ReviewResult {
  score: number; // 0 to 100 compliance score
  summary: string;
  issues: ReviewIssue[];
  disclaimer: string; // E.g., "אינני יכול לבצע בדיקה חזותית בתשריט..."
  originalTextLength: number;
  wordCountReduced: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export const OFFICIAL_CHECKLIST: ChecklistItem[] = [
  // א. נספחים ומעמדם
  {
    id: 'a1',
    category: 'א',
    code: 'א.1',
    title: 'הפרדת טבלאות הקצאה ואיזון ממסמך שמאי',
    description: 'האם קיימת הפרדת מסמכים בין טבלאות הקצאה ואיזון ומסמך העקרונות השמאיים.',
    isCritical: true,
    type: 'structure'
  },
  {
    id: 'a2',
    category: 'א',
    code: 'א.2',
    title: 'הפרדת סטטוס טבלאות (מחייבות) מול עקרונות (רקע)',
    description: 'האם קיימת הפרדת סטטוס בין טבלאות הקצאה ואיזון (מחייבות) ומסמך העקרונות השמאיים (רקע).',
    isCritical: true,
    type: 'structure'
  },
  {
    id: 'a3',
    category: 'א',
    code: 'א.3',
    title: 'התאמת סוג תוכנית לנספחים המצורפים',
    description: 'בתכנית הכוללת איחוד וחלוקה ללא הסכמת בעלים - יש לצרף טבלאות הקצאה ואיזון. בהסכמת בעלים - צירוף טבלת הקצאה.',
    isCritical: true,
    type: 'structure'
  },
  {
    id: 'a4',
    category: 'א',
    code: 'א.4',
    title: 'פירוט נושאים מחייבים חלקית בטבלה 1.7.1',
    description: 'האם קיים פירוט הנושאים המחייבים במסמכים שהוגדרו כמחייבים חלקית, בתיאור המסמך.',
    isCritical: false,
    type: 'appendix'
  },
  {
    id: 'a5',
    category: 'א',
    code: 'א.5',
    title: 'נספח עצים בוגרים ומעמדו',
    description: 'קיום נספח עצים בוגרים - בהתאם לקנ"מ צריך לסמן בתשריט. אם לא ניתן, יש לייצר נספח עצים בוגרים במעמד מחייב.',
    isCritical: true,
    type: 'appendix'
  },
  {
    id: 'a6',
    category: 'א',
    code: 'א.6',
    title: 'סקר עצים בוגרים כנספח רקע בלבד',
    description: 'סקר עצים בוגרים הינו מסמך נפרד מנספח העצים הבוגרים, ומעמדו מוגדר כ-רקע.',
    isCritical: false,
    type: 'appendix'
  },

  // ב. ציטוט חקיקה ורגולציה קיימת
  {
    id: 'b1',
    category: 'ב',
    code: 'ב.1',
    title: 'הוראה בדבר היטל השבחה',
    description: 'לא תופיע הוראה בדבר היטל השבחה (הדבר מוסדר בחוק ואין צורך לחזור עליו).',
    isCritical: true,
    type: 'forbidden'
  },
  {
    id: 'b2',
    category: 'ב',
    code: 'ב.2',
    title: 'הוראה גנרית לחיזוק מבנים',
    description: 'לא תופיע הוראה גנרית לגבי חיזוק מבנים קיימים, אלא אם התכנית מיישמת הנחיות מהנספח הסיסמי שהינו חלק ממנה.',
    isCritical: false,
    type: 'forbidden'
  },
  {
    id: 'b3',
    category: 'ב',
    code: 'ב.3',
    title: 'הוראה לעריכת תצ"ר',
    description: 'לא תופיע הוראה לעריכת תכנית לצורכי רישום (תצ"ר).',
    isCritical: true,
    type: 'forbidden'
  },
  {
    id: 'b4',
    category: 'ב',
    code: 'ב.4',
    title: 'הנחיה לבנייה ירוקה לפי ת"י 5281',
    description: 'לא תופיע הנחיה לבניה ע"פ תקן בניה ירוקה (ת"י 5281). ניתן לכתוב בתכנית רק הוראה המחמירה ביחס לתקן.',
    isCritical: true,
    type: 'forbidden'
  },
  {
    id: 'b5',
    category: 'ב',
    code: 'ב.5',
    title: 'פינוי פסולת בניין',
    description: 'לא תופיע הנחיה לגבי פינוי פסולת בניין בזמן הבניה.',
    isCritical: false,
    type: 'forbidden'
  },
  {
    id: 'b6',
    category: 'ב',
    code: 'ב.6',
    title: 'סימון, טיפול ופינוי אסבסט',
    description: 'לא תופיע הנחיה לגבי סימון, טיפול ופינוי אסבסט במהלך הבניה.',
    isCritical: false,
    type: 'forbidden'
  },
  {
    id: 'b7',
    category: 'ב',
    code: 'ב.7',
    title: 'שטחי התארגנות ומחנות קבלן',
    description: 'לא מופיעות הוראות לגבי שטחי התארגנות ומחנות קבלן, אלא בשטחים שהתכנית מייעדת במיוחד לצורך זה.',
    isCritical: false,
    type: 'forbidden'
  },
  {
    id: 'b8',
    category: 'ב',
    code: 'ב.8',
    title: 'דרישת תשריט חלוקה כתנאי להיתר בנייה',
    description: 'בתכנית שכללה איחוד וחלוקה - לא יופיעו הוראות המחייבות הכנת תשריט חלוקה כתנאי להיתר בנייה.',
    isCritical: true,
    type: 'forbidden'
  },
  {
    id: 'b9',
    category: 'ב',
    code: 'ב.9',
    title: 'הפניות לחוק הנגישות או ציטוטו',
    description: 'לא מופיעות הוראות המפנות לחוק הנגישות, או הוראות שמצטטות אותו (נגישות לאנשים עם מוגבלות ע"פ חוק התו"ב או התקנות).',
    isCritical: true,
    type: 'forbidden'
  },
  {
    id: 'b10',
    category: 'ב',
    code: 'ב.10',
    title: 'דרישת אישור פקיד יערות לכריתה/העתקה',
    description: 'לא מופיעה דרישה לאישור פקיד יערות לכריתה או העתקה (הדבר מוסדר בפקודת היערות).',
    isCritical: true,
    type: 'forbidden'
  },
  {
    id: 'b11',
    category: 'ב',
    code: 'ב.11',
    title: 'הצללה בגני שעשועים',
    description: 'לא מופיעות הוראות לנושא הצללה בגני שעשועים.',
    isCritical: false,
    type: 'forbidden'
  },
  {
    id: 'b12',
    category: 'ב',
    code: 'ב.12',
    title: 'קביעת חניות לפי תקן תקף',
    description: 'לא מופיעה הוראה בתכנית שמספר החניות ייקבע על פי התקן התקף. מותר רק אם מבקשים להחמיר ביחס לתקן החניה.',
    isCritical: true,
    type: 'forbidden'
  },
  {
    id: 'b13',
    category: 'ב',
    code: 'ב.13',
    title: 'דרישת אישור פקע"ר/כבאות/בריאות בשלב הרישוי',
    description: 'לא מופיעה הוראה הדורשת אישור פקע"ר, כיבוי אש, משרד הבריאות, רט"ג או רשות העתיקות בשלב הרישוי. מותרת רק הוראה הדורשת "היוועצות".',
    isCritical: true,
    type: 'forbidden'
  },
  {
    id: 'b14',
    category: 'ב',
    code: 'ב.14',
    title: 'דרישת אישור גורמים שאינם מאשרים',
    description: 'לא קיימת הוראה הדורשת אישור גורמים שאינם גורמים מאשרים בשלב הרישוי (מלבד מחלקת גנים ונוף - גנ"ס). מותרת רק היוועצות.',
    isCritical: true,
    type: 'forbidden'
  },
  {
    id: 'b15',
    category: 'ב',
    code: 'ב.15',
    title: 'הפניה לסעיף 29 בחוק העתיקות',
    description: 'לא מופיעה הפניה בתכנית לסעיף 29 בחוק העתיקות.',
    isCritical: true,
    type: 'forbidden'
  },

  // ג. נושאים נוספים שאין לציינם
  {
    id: 'g1',
    category: 'ג',
    code: 'ג.1',
    title: 'התניות להסכמים',
    description: 'לא יופיעו בתכנית התניות להסכמים (מלבד הוראה לזכויות מותנות בקרן תחזוקה בהתחדשות עירונית).',
    isCritical: true,
    type: 'forbidden'
  },
  {
    id: 'g2',
    category: 'ג',
    code: 'ג.2',
    title: 'הוראות בתקנון לגבי סימון עצים בתשריט',
    description: 'לא מופיעה הוראה בתקנון לגבי הסימונים בתשריט של עצים לשימור, לכריתה והעתקה (הדבר שייך לנספח עצים).',
    isCritical: false,
    type: 'forbidden'
  },
  {
    id: 'g3',
    category: 'ג',
    code: 'ג.3',
    title: 'הוראות קנייניות והצמדת חניות',
    description: 'לא מופיעות הוראות קנייניות, דוגמת הוראה לגבי הצמדת חניות.',
    isCritical: true,
    type: 'forbidden'
  },
  {
    id: 'g4',
    category: 'ג',
    code: 'ג.4',
    title: 'הסדרי תנועה או תיאום רשות תמרור',
    description: 'לא מופיעות הנחיות בנושא הסדרי תנועה, ולא מופיעה הוראה לתיאום עם רשות התמרור המקומית בשלב הרישוי.',
    isCritical: true,
    type: 'forbidden'
  },
  {
    id: 'g5',
    category: 'ג',
    code: 'ג.5',
    title: 'הוראות תפעוליות (מנופים/שעות עבודה)',
    description: 'לא מופיעות הוראות תפעוליות (שעות פריקה, שימוש במנופים, ניקוי גלגלים, הרטבת דרכים, בדיקות רעש).',
    isCritical: true,
    type: 'forbidden'
  },
  {
    id: 'g6',
    category: 'ג',
    code: 'ג.6',
    title: 'מינוח אסור "תנאי להיתר בנייה"',
    description: 'לא מופיע המינוח "תנאי להיתר בנייה". במקומו יופיע: "תנאי בהיתר", "תנאי להגשת בקשה להיתר" או "תנאי בהליך הרישוי".',
    isCritical: true,
    type: 'terminology'
  },
  {
    id: 'g7',
    category: 'ג',
    code: 'ג.7',
    title: 'מינוח אסור "לשביעות רצון / אישור מהנדס"',
    description: 'לא מופיע המינוח "לשביעות רצון / אישור מהנדס / אדריכל העיר וכו\'" בתנאים להליך הרישוי. מותר לקבוע סמכות אישור תכנית בינוי ופיתוח ע"י מהנדס העיר.',
    isCritical: true,
    type: 'terminology'
  },
  {
    id: 'g8',
    category: 'ג',
    code: 'ג.8',
    title: 'הוראת הפקעה בשטח המיועד לאיחוד וחלוקה',
    description: 'לא מופיעה הוראת הפקעה לגבי שטחים המיועדים לאיחוד וחלוקה.',
    isCritical: true,
    type: 'forbidden'
  },
  {
    id: 'g9',
    category: 'ג',
    code: 'ג.9',
    title: 'הנחיות תחזוקה או תפעול',
    description: 'לא מופיעות הנחיות בנושא תחזוקה או תפעול (לרבות חובה להקמת חברת ניהול כתנאי בתכנית), למעט בתכניות התחדשות עירונית בהן ניתן לכלול הוראה לקרן תחזוקה.',
    isCritical: true,
    type: 'forbidden'
  },
  {
    id: 'g10',
    category: 'ג',
    code: 'ג.10',
    title: 'ריבוי הערות תכנוניות בטבלה 5',
    description: 'הימנעות מריבוי הערות תכנוניות בטבלה 5 (זכויות והוראות בנייה).',
    isCritical: false,
    type: 'structure'
  },

  // ד. תכנית בינוי ופיתוח
  {
    id: 'd1',
    category: 'ד',
    code: 'ד.1',
    title: 'הקפדה על טרמינולוגיה וחוסר כפילויות',
    description: 'הקפדה על טרמינולוגיה וחוסר כפילות לגבי שם התכנית וענייני טרמינולוגיה.',
    isCritical: false,
    type: 'structure'
  },
  {
    id: 'd2',
    category: 'ד',
    code: 'ד.2',
    title: 'ריכוז הנחיות בינוי ופיתוח בפרק 6',
    description: 'האם ההנחיות לגבי תכנית הבינוי והפיתוח מופיעות במקום אחד, בפרק 6?',
    isCritical: false,
    type: 'structure'
  },
  {
    id: 'd3',
    category: 'ד',
    code: 'ד.3',
    title: 'התאמת תכולת בינוי ופיתוח למדריך',
    description: 'התכולה המקסימלית המוגדרת לתכנית הבינוי והפיתוח תואמת למדריך, בדגש על מניעת כפילויות מול תקנות הרישוי.',
    isCritical: true,
    type: 'structure'
  },
  {
    id: 'd4',
    category: 'ד',
    code: 'ד.4',
    title: 'שיקול דעת בגודל ומורכבות התוכנית',
    description: 'הפעלת שיקול דעת ביחס לגודל התוכנית ומורכבותה בקשר להחלטה האם נדרשת בכלל תכנית בינוי ופיתוח.',
    isCritical: false,
    type: 'structure'
  },

  // ה. נושאים נוספים לבדיקה
  {
    id: 'e1',
    category: 'ה',
    code: 'ה.1',
    title: 'בדיקת טבלאות הקצאה ואיזון',
    description: 'התאמת מבנה הטבלה לדרישת התקינה (100% נכנס-יוצא, קיום עמודות שווי יחסי בתכניות ללא הסכמה, קיום עמודת רישום בעלות מצב נכנס ויוצא).',
    isCritical: true,
    type: 'structure'
  },
  {
    id: 'e2',
    category: 'ה',
    code: 'ה.2',
    title: 'עמידה בהוראות ניהול מי נגר',
    description: 'עמידה בהוראות ניהול מי נגר בהתאם להוראות תמ"א 1 שינוי 7 בהתאם לגודל התכנית.',
    isCritical: true,
    type: 'structure'
  },
  {
    id: 'e3',
    category: 'ה',
    code: 'ה.3',
    title: 'סימון פוליגון עתיקות בתשריט',
    description: 'במידה ויש הערה ביחס לזכויות מותנות בגין קיום עתיקות - האם קיים סימון פוליגון עתיקות בתשריט.',
    isCritical: false,
    type: 'appendix'
  }
];
