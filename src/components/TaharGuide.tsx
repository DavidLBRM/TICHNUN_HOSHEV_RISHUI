import React, { useState } from "react";
import { BookOpen, HelpCircle, FileText, Settings, Award, ArrowLeft, Layers, ShieldAlert, Sparkles, Check, ChevronDown, ChevronUp } from "lucide-react";

export default function TaharGuide() {
  const [expandedSection, setExpandedSection] = useState<string | null>("intro");

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div id="tahar-guide-container" className="flex flex-col space-y-4" dir="rtl">
      {/* Intro Banner */}
      <div className="bg-[#0D2C4C] p-4 rounded-xl border border-[#0D2C4C] text-white shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <Award className="text-[#009FA1]" size={18} />
          <h3 className="font-syne font-bold text-sm text-white">מדריך מקיף: עקרונות תכנון חושב רישוי (תח''ר)</h3>
        </div>
        <p className="text-[11px] text-white/80 leading-relaxed font-sans">
          מדריך מקצועי המבוסס על הנחיות מינהל התכנון של מדינת ישראל. תכנון חושב רישוי נועד לפשט את הליכי הרישוי, למנוע כפילויות רגולטוריות ולייצר תכניות בנייה גמישות וברות-מימוש בשטח.
        </p>
      </div>

      {/* Accordion sections */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        
        {/* Section 1: ביטול ההקלות ושינוי הפרדיגמה */}
        <div className="bg-white border border-[#D2DFE5] rounded-xl overflow-hidden shadow-xs">
          <button
            id="guide-sec-intro-btn"
            onClick={() => toggleSection("intro")}
            className="w-full px-4 py-3 bg-[#F8FAFC] flex items-center justify-between font-bold text-[#0D2C4C] text-xs text-right cursor-pointer border-b border-[#D2DFE5]/50"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#0C5A82] text-white text-[10px] font-mono">1</span>
              <span className="font-syne">ביטול ההקלות ושינוי הפרדיגמה (החל מ-1/1/2023)</span>
            </div>
            {expandedSection === "intro" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {expandedSection === "intro" && (
            <div className="p-4 text-xs text-[#0D2C4C]/80 space-y-2 leading-relaxed font-sans">
              <p className="font-bold text-[#0D2C4C]">
                החל מינואר 2023, חוק ההסדרים ביטל בהדרגה את מוסד "ההקלות" בתכניות מפורטות חדשות.
              </p>
              <ul className="list-disc list-inside mr-2 space-y-1.5 text-[#0D2C4C]/80">
                <li>
                  <strong className="text-[#0D2C4C]">הדין הישן:</strong> אפשר הגשת בקשה לכל הקלה (קו בניין, גובה, אחוזים) כל עוד היא לא "סטייה ניכרת", דבר שיצר עיכובים של חודשים ושנים בשלב הרישוי.
                </li>
                <li>
                  <strong className="text-[#0D2C4C]">הדין החדש:</strong> חל איסור גורף לבקש הקלות בהיתר, למעט רשימה מצומצמת המוגדרת בתקנות.
                </li>
                <li>
                  <strong className="text-[#0D2C4C]">המשמעות הסטטוטורית:</strong> על התכנית המפורטת (תקנון ותשריט) להיות מנוסחת במדויק מראש, תוך קביעת טווחי גמישות מובנים וכלים תפקודיים המאפשרים התאמה לתנאי השטח ללא צורך בהקלות.
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 2: הוראות תפקודיות לעומת מרשמיות */}
        <div className="bg-white border border-[#D2DFE5] rounded-xl overflow-hidden shadow-xs">
          <button
            id="guide-sec-functional-btn"
            onClick={() => toggleSection("functional")}
            className="w-full px-4 py-3 bg-[#F8FAFC] flex items-center justify-between font-bold text-[#0D2C4C] text-xs text-right cursor-pointer border-b border-[#D2DFE5]/50"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#0C5A82] text-white text-[10px] font-mono">2</span>
              <span className="font-syne">העדפת הוראות תפקודיות (מה) על מרשמיות (איך)</span>
            </div>
            {expandedSection === "functional" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {expandedSection === "functional" && (
            <div className="p-4 text-xs text-[#0D2C4C]/80 space-y-3 font-sans">
              <p className="leading-relaxed">
                תכנית מפורטת צריכה לקבוע את המטרות והיעדים התכנוניים שיש להשיג ולשמר בשלב הביצוע, מבלי להיכנס לפרטי ביצוע, שיטות בינוי, או מותגים ספציפיים שעלולים להפוך לבלתי ישימים עם השנים.
              </p>
              
              <div className="overflow-hidden border border-[#D2DFE5] rounded-xl">
                <table className="w-full text-right text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[#0D2C4C] font-bold border-b border-[#D2DFE5]">
                      <th className="p-2 w-1/2">נוסח מרשמי אסור (איך)</th>
                      <th className="p-2 w-1/2 text-[#0C5A82] bg-[#EBF5F6]">נוסח תפקודי מומלץ (מה)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D2DFE5]/50">
                    <tr>
                      <td className="p-2 text-rose-600 italic">"גובה החזית המסחרית יהיה בדיוק 5 מטרים."</td>
                      <td className="p-2 text-[#0D2C4C] font-bold bg-[#EBF5F6]/40">"החזית המסחרית תתוכנן באמצעות שקיפות וריבוי פתחים כלפי הרחוב."</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-rose-600 italic">"גובה הגדרות כלפי הרחוב לא יעלה על 1.5 מטר."</td>
                      <td className="p-2 text-[#0D2C4C] font-bold bg-[#EBF5F6]/40">"הגדרות יאפשרו מבט חופשי והמשכיות ויזואלית בין המגרש לרחוב."</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-rose-600 italic">"ייעשה שימוש באבני חיפוי נסורות מסוג חלילה בעובי 4 ס''מ."</td>
                      <td className="p-2 text-[#0D2C4C] font-bold bg-[#EBF5F6]/40">"חומרי הגמר של המבנים יהיו עמידים ואיכותיים." (עדיף להשאיר להנחיות מרחביות).</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-rose-600 italic">"נטיעת עצי זית במרווחים של 4 מטרים."</td>
                      <td className="p-2 text-[#0D2C4C] font-bold bg-[#EBF5F6]/40">"Tובטח הצללה מרבית של המרחב הציבורי באמצעות עצים בוגרים."</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: סיווג הנספחים ומעמדם הסטטוטורי */}
        <div className="bg-white border border-[#D2DFE5] rounded-xl overflow-hidden shadow-xs">
          <button
            id="guide-sec-annex-btn"
            onClick={() => toggleSection("annex")}
            className="w-full px-4 py-3 bg-[#F8FAFC] flex items-center justify-between font-bold text-[#0D2C4C] text-xs text-right cursor-pointer border-b border-[#D2DFE5]/50"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#0C5A82] text-white text-[10px] font-mono">3</span>
              <span className="font-syne">סיווג הנספחים ומעמדם (סעיף 1.7)</span>
            </div>
            {expandedSection === "annex" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {expandedSection === "annex" && (
            <div className="p-4 text-xs text-[#0D2C4C]/80 space-y-3 leading-relaxed font-sans">
              <p>
                אחד החסמים הקשים ברישוי הוא עומס נספחים המוגדרים כ-<strong>"מנחים"</strong>, מונח שעורר ויכוחים משפטיים וסתירות מול התקנון. נוהל מבא''ת 2023 מבטל את הסטטוס "מנחה" ומגדיר 4 סוגי מסמכים ברורים:
              </p>
              
              <div className="grid grid-cols-1 gap-2.5 mt-2">
                <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#D2DFE5]">
                  <h4 className="font-bold text-[#0D2C4C] mb-1 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-rose-500 rounded-full"></span>
                    נספח מחייב (Binding)
                  </h4>
                  <p className="text-[11px] text-[#0D2C4C]/70">
                    נספח שהוראותיו מחייבות ברמה זהה לתקנון. יצורף רק במקרים של עומס גרפי או דרישה סטטוטורית ספציפית (כגון: טבלאות הקצאה ואיזון, נספח תלת-ממד, נספח עצים בוגרים לשימור בריבוי עצים).
                  </p>
                </div>

                <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#D2DFE5]">
                  <h4 className="font-bold text-[#0D2C4C] mb-1 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-[#E28743] rounded-full"></span>
                    נספח מחייב חלקית (Partially Binding)
                  </h4>
                  <p className="text-[11px] text-[#0D2C4C]/70">
                    נספח שרק חלק מרכיביו מחייבים (למשל: נספח בינוי המגדיר מפלס ±0.00 מחייב או מיקומי נסיגות מחייבים, בעוד שאר פרטי הארכיטקטורה המופיעים בו מהווים רקע בלבד).
                  </p>
                </div>

                <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#D2DFE5]">
                  <h4 className="font-bold text-[#0D2C4C] mb-1 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-[#009FA1] rounded-full"></span>
                    מסמך רקע מידע (Informative Background)
                  </h4>
                  <p className="text-[11px] text-[#0D2C4C]/70">
                    מסמך המציג בדיקות היתכנות מקצועיות, סקרים או תסקירים סביבתיים. מסייע באישור התכנית, אך אינו מהווה מסמך מחייב לשלב הרישוי (המסקנות האופרטיביות מתוכו חייבות להיות מוטמעות בתקנון).
                  </p>
                </div>

                <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#D2DFE5]">
                  <h4 className="font-bold text-[#0D2C4C] mb-1 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-[#0C5A82] rounded-full"></span>
                    מסמך רקע מדגים (Illustrative Background)
                  </h4>
                  <p className="text-[11px] text-[#0D2C4C]/70">
                    מציג חלופת תכנון אפשרית אחת למימוש זכויות הבנייה. מבהיר לציבור ולוועדה היתכנות נפחית, אך אינו מחייב את ההיתר כלל וניתן לסטות ממנו בשלב הרישוי.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: מבנה פרק 6 החדש לפי מבא''ת 2023 */}
        <div className="bg-white border border-[#D2DFE5] rounded-xl overflow-hidden shadow-xs">
          <button
            id="guide-sec-chapter6-btn"
            onClick={() => toggleSection("chapter6")}
            className="w-full px-4 py-3 bg-[#F8FAFC] flex items-center justify-between font-bold text-[#0D2C4C] text-xs text-right cursor-pointer border-b border-[#D2DFE5]/50"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#0C5A82] text-white text-[10px] font-mono">4</span>
              <span className="font-syne">מבנה פרק 6 החדש (נוהל מבא''ת 2023)</span>
            </div>
            {expandedSection === "chapter6" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {expandedSection === "chapter6" && (
            <div className="p-4 text-xs text-[#0D2C4C]/80 space-y-3 leading-relaxed font-sans">
              <p>
                נוהל מבא''ת 2023 הגדיר מחדש את מבנה <strong>פרק 6 (הוראות כלליות ותנאים להליך הרישוי)</strong> כדי למנוע פיזור הוראות וסתירות:
              </p>
              
              <div className="space-y-2">
                <div className="border-r-2 border-[#009FA1] pr-2">
                  <strong className="text-[#0D2C4C]">6.1 הוראות תכנוניות:</strong>
                  <div className="text-[11px] text-[#0D2C4C]/50 mt-0.5">
                    ריכוז כל ההוראות התלת-ממדיות והעיצוביות: בינוי, פיתוח ונוף, תנועה וחניה (למשל מיקומי כניסות/חניונים), תשתיות, איכות הסביבה.
                  </div>
                </div>

                <div className="border-r-2 border-[#E28743] pr-2">
                  <strong className="text-[#0D2C4C]">6.2 תנאים בהליך הרישוי והביצוע:</strong>
                  <div className="text-[11px] text-[#0D2C4C]/50 mt-0.5">
                    הנחיות לתכנית בינוי ופיתוח (כתנאי למסגרות מיוחדות), הגדרת היוועצויות במסגרת תיק המידע להיתר, ותנאים קונקרטיים בהליך הרישוי (כמו הצגת פתרונות ניהול נגר או אקוסטיקה).
                  </div>
                </div>

                <div className="border-r-2 border-emerald-500 pr-2">
                  <strong className="text-[#0D2C4C]">6.3 מקרקעין ורישום:</strong>
                  <div className="text-[11px] text-[#0D2C4C]/50 mt-0.5">
                    הסדרת זיקות הנאה (מעברים להולכי רגל או תשתיות), הוראות הפקעה מפורשות, איחוד וחלוקה, תלת-ממד, והוראות לרישום הערות אזהרה או רישום בעלויות.
                  </div>
                </div>

                <div className="border-r-2 border-[#0D2C4C]/50 pr-2">
                  <strong className="text-[#0D2C4C]">6.4 הוראות אחרות:</strong>
                  <div className="text-[11px] text-[#0D2C4C]/50 mt-0.5">
                    עניינים ייחודיים שאינם מוסדרים בסעיפים הקודמים, כגון הוראות זכויות מותנות בקרן תחזוקה (התחדשות עירונית) או הוראות גמישות בגין מציאת עתיקות.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: כללי זהב למניעת כפילות וצווארי בקבוק ברישוי */}
        <div className="bg-white border border-[#D2DFE5] rounded-xl overflow-hidden shadow-xs">
          <button
            id="guide-sec-rules-btn"
            onClick={() => toggleSection("rules")}
            className="w-full px-4 py-3 bg-[#F8FAFC] flex items-center justify-between font-bold text-[#0D2C4C] text-xs text-right cursor-pointer border-b border-[#D2DFE5]/50"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#0C5A82] text-white text-[10px] font-mono">5</span>
              <span className="font-syne">כללי זהב למניעת כפילות וצווארי בקבוק ברישוי</span>
            </div>
            {expandedSection === "rules" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {expandedSection === "rules" && (
            <div className="p-4 text-xs text-[#0D2C4C]/80 space-y-4 leading-relaxed font-sans">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <ShieldAlert className="text-rose-600 shrink-0" size={16} />
                  <div>
                    <strong className="text-[#0D2C4C]">איסור העתקת חוקים ותקנים:</strong>
                    <p className="text-[11px] text-[#0D2C4C]/70 mt-0.5">
                      אין לכלול הוראות המוסדרות כבר בחקיקה ארצית. למשל: היטל השבחה (מוסדר בחוק התו"ב), פינוי פסולת, טיפול באסבסט, חוק הנגישות, או הפניות כלליות לתקן בנייה ירוקה 5281 (מכיוון שהם מחייבים ממילא).
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <ShieldAlert className="text-[#E28743] shrink-0" size={16} />
                  <div>
                    <strong className="text-[#0D2C4C]">מחיקת מינוח "תנאי להיתר בנייה":</strong>
                    <p className="text-[11px] text-[#0D2C4C]/70 mt-0.5">
                      תיקון 101 אוסר על קביעת תנאים להיתר שאינם מעוגנים במידע להיתר. יש לנסח תמיד: <span className="font-semibold text-[#0D2C4C]">"תנאי בהיתר"</span>, <span className="font-semibold text-[#0D2C4C]">"תנאי להגשת בקשה"</span> או <span className="font-semibold text-[#0D2C4C]">"תנאי לאישור תחילת עבודות"</span>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <ShieldAlert className="text-[#009FA1] shrink-0" size={16} />
                  <div>
                    <strong className="text-[#0D2C4C]">איסור העברת סמכות למהנדס/אדריכל העיר:</strong>
                    <p className="text-[11px] text-[#0D2C4C]/70 mt-0.5">
                      ניסוחים כמו "בתיאום ואישור אדריכל העיר בשלב הרישוי" או "לשביעות רצונו של מהנדס הועדה" הופכים גורמים פנימיים לגורמים מאשרים באופן בלתי-חוקי. יש להחליפם בהגדרת גמישות מוגדרת מראש או היוועצות במידע.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <ShieldAlert className="text-[#0C5A82] shrink-0" size={16} />
                  <div>
                    <strong className="text-[#0D2C4C]">איסור הוראות תפעוליות וקנייניות:</strong>
                    <p className="text-[11px] text-[#0D2C4C]/70 mt-0.5">
                      תקנון תכנית אינו מקור נורמטיבי להסדרת חוזים קנייניים או פתרונות תפעוליים. אסור לקבוע: שעות פריקה וטעינה, חובת הקמת חברות ניהול (למעט התחדשות עירונית), הצמדות חניות ספציפיות בטאבו וכד'.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
