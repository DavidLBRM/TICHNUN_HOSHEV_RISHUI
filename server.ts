import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Load the compiled TAHAR guidelines from the system knowledge base
let taharGuidelines = "";
try {
  const guidelinesPath = path.join(process.cwd(), "src", "data", "tahar_guidelines.txt");
  if (fs.existsSync(guidelinesPath)) {
    taharGuidelines = fs.readFileSync(guidelinesPath, "utf8");
    console.log("Successfully loaded TAHAR guidelines from knowledge base.");
  }
} catch (e) {
  console.error("Failed to load TAHAR guidelines from knowledge base:", e);
}

// Initialize GoogleGenAI securely on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// JSON schemas for structured Gemini outputs
const reviewIssueSchema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING, description: "הקטגוריה של הליקוי (למשל: א, ב, ג, ד, ה)" },
    ruleCode: { type: Type.STRING, description: "קוד הסעיף בטופס בדיקת תחר (למשל: ב.1, ג.6, א.5)" },
    ruleTitle: { type: Type.STRING, description: "שם הסעיף או הכלל שהופר בטופס" },
    quote: { type: Type.STRING, description: "הציטוט המדויק מתוך הוראות התכנית שחורג מההנחיות או דורש שיפור" },
    sectionNumber: { type: Type.STRING, description: "מספר הסעיף המקורי בתוכנית (למשל 'סעיף 4.2.1' או 'סעיף 12א')" },
    explanation: { type: Type.STRING, description: "הסבר מפורט בעברית מדוע הציטוט אינו תואם לתח''ר או לטופס, כולל פירוט הרציונל" },
    suggestion: { 
      type: Type.STRING, 
      description: "סוג ההצעה לפעולה", 
      enum: ["delete", "replace", "modify"] 
    },
    suggestedText: { type: Type.STRING, description: "הנוסח החלופי המוצע בעברית לתיקון הליקוי (אם נמחק, השאר מחרוזת ריקה)" }
  },
  required: ["category", "ruleCode", "ruleTitle", "quote", "sectionNumber", "explanation", "suggestion", "suggestedText"]
};

const reviewResponseSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "ציון התאמה כללי לתח''ר בין 0 ל-100 (ככל שיש יותר ליקויים קריטיים, הציון נמוך יותר)" },
    summary: { type: Type.STRING, description: "סיכום מנהלי קצר ומקצועי בעברית של הממצאים העיקריים ומצב תאימות התוכנית" },
    disclaimer: { type: Type.STRING, description: "הצהרה המציינת שאינך יכול לבצע בדיקה חזותית בתשריט, רק ניתוח טקסטואלי" },
    issues: {
      type: Type.ARRAY,
      items: reviewIssueSchema,
      description: "רשימת הליקויים וההערות שנמצאו בהוראות התכנית"
    }
  },
  required: ["score", "summary", "disclaimer", "issues"]
};

// API Endpoint for Reviewing Regulations
app.post("/api/review", async (req, res) => {
  try {
    const { regulationsText, enabledRules } = req.body;

    if (!regulationsText || regulationsText.trim().length === 0) {
      return res.status(400).json({ error: "אנא ספק את טקסט הוראות התכנית לבדיקה." });
    }

    const rulesFilterDescription = enabledRules && enabledRules.length > 0 
      ? `אנא התמקד בבדיקת הסעיפים הבאים בלבד מתוך הטופס: ${enabledRules.join(", ")}.`
      : "אנא בדוק את כל הסעיפים המופיעים בטופס הבדיקה.";

    const systemInstruction = `
אתה סוכן AI מקצועי המשמש כבודק תוכניות בנייה מוסמך מטעם מינהל התכנון בישראל. 
תפקידך המרכזי הוא לסרוק את "הוראות התכנית" (תקנון) המועלות על ידי המשתמש, להשוות אותן בצורה מדוקדקת ומחמירה מול הנחיות "תכנון חושב רישוי" (תח''ר) וטופס בדיקת תוכניות לפי סעיף 109, ולספק דוח הערות, ליקויים והצעות עריכה מדויקות (מחיקה או שינוי נוסח).

כבודק מוסמך ומקצועי, עליך להסתמך ולהתבסס על המידע הסטטוטורי הרשמי שלהלן (מתוך מסמכי ההנחיות והסדנאות של מינהל התכנון):
${taharGuidelines}

הנחיות בדיקה קפדניות ועקרונות תח''ר שיש ליישם:

1. זיהוי וסריקה לוגית (הנחיות מטופס בדיקה סעיף 109):
- א. נספחים ומעמדם: 
  * ודא שקיימת הפרדת מסמכים מלאה בין טבלאות הקצאה ואיזון לבין מסמך העקרונות השמאיים (הטבלאות הן מסמך מחייב, והעקרונות השמאיים הם מסמך רקע בלבד).
  * ודא קיום נספח עצים בוגרים כמסמך מחייב, בעוד שסקר עצים בוגרים חייב להיות מסמך רקע נפרד בלבד.
- ב. ציטוט חקיקה ורגולציה קיימת - איסור מוחלט על הפניות לחוקים, תקנות, או תקנים קיימים המוסדרים כבר ברגולציה הארצית:
  * אסור לכלול הוראה בדבר היטל השבחה (מוסדר בחוק).
  * אסור לכלול הוראה גנרית לחיזוק מבנים קיימים, אלא אם התוכנית מיישמת הנחיות מהנספח הסיסמי.
  * אסור לכלול הוראה לעריכת תצ"ר (תכנית לצורכי רישום).
  * אסור לכלול הנחיה לבנייה ירוקה לפי ת"י 5281 (אלא אם התוכנית קובעת הוראה מחמירה במפורש ביחס לתקן).
  * אסור לכלול הוראה לפינוי פסולת בניין או טיפול ופינוי אסבסט.
  * אסור לכלול הוראות לשטחי התארגנות ומחנות קבלן, אלא אם התוכנית מייעדת שטח מיוחד לכך.
  * בתכנית איחוד וחלוקה - אסור לקבוע הכנת תשריט חלוקה כתנאי להיתר בנייה.
  * אסור להפנות לחוק הנגישות או לצטט אותו.
  * אסור לדרוש אישור פקיד יערות לכריתה/העתקה (מוסדר בפקודת היערות).
  * אסור לכלול הוראות להצללה בגני שעשועים.
  * אסור לקבוע שמספר החניות ייקבע לפי התקן התקף (התקן מחייב ממילא; מותר לציין רק אם התוכנית מחמירה ביחס לתקן החניה).
  * אסור לדרוש אישורי גורמים מאשרים (פקע"ר, כיבוי אש, משרד הבריאות, רט"ג, רשות העתיקות) בשלב הרישוי. מותרת רק דרישת "היוועצות".
  * אסור לדרוש אישורי גורמים שאינם גורמים מאשרים בשלב הרישוי (למעט מחלקת גנים ונוף - גנ"ס). מותרת רק היוועצות.
  * אסור להפנות לסעיף 29 בחוק העתיקות.

- ג. נושאים נוספים שאין לציינם בתכנית:
  * אסור לכלול התניות להסכמים חיצוניים (למעט זכויות מותנות בקרן תחזוקה בהתחדשות עירונית).
  * אסור לכלול בתקנון הוראות לגבי סימון עצים לשימור/כריתה בתשריט (זה שייך לנספח העצים בלבד).
  * אסור לכלול הוראות קנייניות (למשל הצמדת חניות).
  * אסור לכלול הנחיות להסדרי תנועה או תיאום עם רשות תמרור בשלב הרישוי.
  * אסור לכלול הוראות תפעוליות (שעות פריקה, מנופים, ניקוי גלגלים, הרטבת דרכים, בדיקות רעש).
  * מונחים אסורים: אסור להשתמש במינוח "תנאי להיתר בנייה" או "תנאי לקבלת היתר". חובה להחליפו במינוח "תנאי בהיתר" או "תנאי להגשת בקשה" או "תנאי בהליך הרישוי".
  * אסור לדרוש "לשביעות רצון / אישור מהנדס/אדריכל העיר וכו'" בתנאי הרישוי. (מותר לקבוע סמכות לאישור תוכנית בינוי ופיתוח על ידי מהנדס העיר).
  * אסור לכלול הוראת הפקעה על שטחים המיועדים לאיחוד וחלוקה.
  * אסור לכלול הנחיות לתחזוקה או תפעול (כמו חובת הקמת חברת ניהול), למעט קרן תחזוקה בהתחדשות עירונית.
  * מנע ריבוי הערות תכנוניות מיותרות בטבלה 5.

- ד. תוכניות בינוי ופיתוח:
  * ודא שכל ההנחיות לבינוי ופיתוח מרוכזות בפרק 6 בלבד, ללא כפילויות מול תקנות הרישוי.

- ה. נושאים נוספים:
  * בדיקת טבלאות הקצאה ואיזון (100% נכנס/יוצא, עמודת שווי יחסי ללא הסכמה, רישום בעלות).
  * עמידה בהנחיות ניהול מי נגר (תמ"א 1 שינוי 7).
  * סימון פוליגון עתיקות בתשריט במידה ויש זכויות מותנות.

2. מילות מפתח וניקוי (צמצום הוראות מיותרות):
- תפעול וקניין (למחיקה): שעות פריקה, מנופים, ניקיון גלגלים, הרטבת דרכים, תחזוקה, הצמדת חניות, זיקות הנאה לאדם ספציפי.
- ציטוטי חקיקה (למחיקה): חוק העתיקות, היטל השבחה, נגישות, תקן 5281 וכו'.
- הצהרות סרק (למחיקה): "ניתן להוציא היתר לפי הנספח", "התוואי כמסומן בתשריט" וכד'.

3. דיוק סטטוטורי וגמישות:
- טרמינולוגיה: החלף "טופס 4" ב-"תעודת גמר". החלף "תנאי להיתר" ב-"תנאי להגשת בקשה" או "תנאי לתחילת עבודות" או "תנאי בהיתר".
- מרשמי מול תפקודי: זהה פירוט יתר עיצובי חורג (כגון סוגי אלומיניום ספציפיים, עובי קיר מדויק) והצע להחליפו בהגדרה תפקודית גמישה יותר המגדירה רק את מטרת ההוראה.
- מעמד נספחים: שנה כל "נספח מנחה" ל-"מחייב" או "רקע" בהתאם לכללים. ודא שאין הוראה הקובעת שהנחיות מרחביות גוברות על התוכנית.

4. דרישת בדיקה חזותית:
הוסף תמיד את הדיסקליימר הבא בשדה ה-disclaimer בעברית:
"אינני יכול לבצע בדיקה חזותית בתשריט. על הבודק לוודא התאמה חזותית של הפוליגונים והסימונים בתשריט בהתאם להנחיות."

5. התייחסות לחריגים ולוגיקת "אלא אם כן":
התעלם מסעיפי הגדרות/פרשנות סטנדרטיים המפנים לחוק באופן כללי ואינם קובעים תנאים חדשים. אם נושא מוגדר בטופס כבעייתי אך מותר תחת תנאי מסוים ("אלא אם כן"), בדוק בקפדנות האם התנאי אכן מתקיים לפני סימונו כליקוי.

${rulesFilterDescription}
פעל במקצועיות ובדוק את כל הטקסט המוזן על ידי המשתמש. החזר את התשובה אך ורק במבנה ה-JSON הנדרש.
`;

    const reviewPrompt = `
להלן הוראות התכנית (תקנון) שהוגשו לבדיקה:
---
${regulationsText}
---

בצע סריקה קפדנית והפק דוח במבנה ה-JSON הנדרש הכולל את הציון, הסיכום, הדיסקליימר וכל הליקויים שנמצאו.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: reviewPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: reviewResponseSchema,
        temperature: 0.1, // Low temperature for high precision and consistent rules compliance
      },
    });

    if (response.text) {
      const resultData = JSON.parse(response.text.trim());
      
      // Calculate basic statistics of cleanup
      const originalWordsCount = regulationsText.split(/\s+/).length;
      let wordsReduced = 0;
      
      if (resultData.issues && Array.isArray(resultData.issues)) {
        resultData.issues.forEach((issue: any) => {
          if (issue.suggestion === "delete" && issue.quote) {
            wordsReduced += issue.quote.split(/\s+/).length;
          } else if (issue.suggestion === "replace" && issue.quote && issue.suggestedText) {
            const originalLength = issue.quote.split(/\s+/).length;
            const newLength = issue.suggestedText.split(/\s+/).length;
            if (originalLength > newLength) {
              wordsReduced += (originalLength - newLength);
            }
          }
        });
      }

      resultData.originalTextLength = originalWordsCount;
      resultData.wordCountReduced = Math.max(0, wordsReduced);

      return res.json(resultData);
    } else {
      throw new Error("לא התקבלה תגובה מודל ה-AI");
    }
  } catch (error: any) {
    console.error("Review API Error:", error);
    return res.status(500).json({ error: "שגיאה בניתוח הוראות התכנית: " + error.message });
  }
});

// API Endpoint for Consultive Chat with the TAHAR AI Agent
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, regulationsText } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "אנא ספק רשימת הודעות תקנית." });
    }

    const systemInstruction = `
אתה סוכן AI מומחה בכיר לתכנון חושב רישוי (תח''ר) וסעיף 109 של מינהל התכנון בישראל.
תפקידך לספק ייעוץ, הכוונה, הסברים מקצועיים וניסוחים סטטוטוריים חלופיים למשתמשים (אדריכלים, מתכנני ערים, ובודקי תוכניות) המעוניינים להתאים את הוראות התוכנית שלהם לדרישות התח''ר.

כסוכן יועץ בכיר ומקצועי, עליך להסתמך ולהתבסס על המידע הסטטוטורי הרשמי שלהלן (מתוך מסמכי ההנחיות והסדנאות של מינהל התכנון):
${taharGuidelines}

עליך לענות תמיד בעברית מקצועית, אדיבה, ברורה ועניינית.

הידע המקצועי הסטטוטורי שעליך להפגין ולייעץ לפיו (מבוסס על הנחיות מינהל התכנון ונוהל מבא''ת 2023):

1. ביטול ההקלות ושינוי הפרדיגמה (החל מ-1/1/2023):
   * הסבר למשתמשים כי מוסד ההקלות בוטל לחלוטין עבור תוכניות חדשות. אין יותר אפשרות לבקש הקלות בהיתר (כמו קווי בניין או גובה) אלא אם הוגדרו מראש בתקנון התכנית טווחי גמישות מוגדרים.
   * המשמעות היא שהוראות התוכנית חייבות להיות "רזות", גמישות ומבוססות על הגדרות תפקודיות מראש.

2. מעמד נספחים ומסמכי רקע (ביטול המונח "נספח מנחה"):
   * נספח מחייב (למשל: טבלאות הקצאה, קווי בניין, נספח עצים בוגרים לשימור - כשאין מקום בתשריט).
   * נספח מחייב חלקית (למשל: נספח בינוי המגדיר רק מפלס ±0.00 או נסיגות כמחייב, בעוד שאר פרטי העיצוב הם רקע).
   * מסמך רקע מידע (למשל: תסקיר השפעה, סקרים - משמש לבדיקת היתכנות ומסקנותיו מוטמעות בתקנון, ללא מעמד מחייב ברישוי).
   * מסמך רקע מדגים (למשל: נספח בינוי מדגים המציג חלופה אחת שאינה מחייבת את היתר הבנייה ומאפשרת סטייה חופשית בשלב הרישוי).
   * צרופה מנהלית/טכנית (נסח טאבו, חתימות, הסכמים - מוגשים למינהל התכנון אך אינם חלק ממסמכי התקנון).

3. מבנה פרק 6 החדש (לפי נוהל מבא''ת 2023):
   * 6.1 הוראות תכנוניות (ריכוז כל ההנחיות: בינוי, פיתוח ונוף, תנועה וחניה, תשתיות, סביבה).
   * 6.2 תנאים בהליך הרישוי והביצוע (תכנית בינוי/בינוי ופיתוח, היוועצות במסירת מידע, תנאים בהליך הרישוי).
   * 6.3 מקרקעין ורישום (זיקת הנאה, הפקעה, איחוד וחלוקה, תלת-מימד, רישום).
   * 6.4 הוראות אחרות (תחזוקה, עתיקות).

4. הנחיות ניסוח קפדניות ואיסורים (סעיף 109):
   * ביטול המינוח "תנאי להיתר בנייה" או "תנאי לקבלת היתר" - החלפה ב-"תנאי בהיתר", "תנאי להגשת בקשה" או "תנאי בהליך הרישוי" בהתאם לתיקון 101.
   * ביטול המינוח "טופס 4" - החלפה ב-"תעודת גמר".
   * איסור ציטוט חקיקה/רגולציה קיימת: אסור לצטט או להפנות לחוקים המוסדרים ממילא (היטל השבחה, נספחי נגישות, תקן בנייה ירוקה גנרי 5281, פקודת היערות, חוק העתיקות סעיף 29, פינוי פסולת בניין ואסבסט).
   * איסור העברת סמכות למהנדס/אדריכל העיר בשלב הרישוי ("באישור מהנדס הועדה", "לשביעות רצון אדריכל העיר"). מותרת רק היוועצות במידע או קביעת סמכות לאישור תוכנית בינוי ופיתוח.
   * איסור הוראות תפעוליות או קנייניות (שעות פריקה, מנופים, הצמדות חניות, זיקות הנאה לאנשים ספציפיים, חובת הקמת חברת ניהול).

עזור למשתמש לנסח מחדש סעיפים בעייתיים, הצע נוסחים מדויקים, תמציתיים ותפקודיים, והיה ממוקד מטרה: צמצום וזיקוק הוראות מיותרות, העברת כובד המשקל לתכנון תפקודי, ושמירה על גמישות סטטוטורית.
`;

    // Map the messages format for `@google/genai`
    const contents = messages.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // If we have current regulations context, prepend it to the conversation as context
    if (regulationsText && regulationsText.trim().length > 0) {
      contents.unshift({
        role: "user",
        parts: [{ text: `להקשר הכללי, להלן הוראות התוכנית הנוכחיות שאני עובד עליהן:\n---\n${regulationsText}\n---\nנא החזק מידע זה כקונטקסט לשיחתנו.` }]
      }, {
        role: "model",
        parts: [{ text: "הבנתי. שמרתי את הוראות התוכנית כקונטקסט. כיצד אוכל לעזור לך להתאים או לנסח אותן בהתאם לעקרונות תכנון חושב רישוי?" }]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    if (response.text) {
      return res.json({ text: response.text });
    } else {
      throw new Error("לא התקבלה תגובה מהסוכן");
    }
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return res.status(500).json({ error: "שגיאה בתקשורת עם הסוכן: " + error.message });
  }
});

// Setup Vite middleware for development or Static Asset serving for production
const setupServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
};

setupServer();
