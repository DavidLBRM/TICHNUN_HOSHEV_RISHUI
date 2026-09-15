import React, { useState } from "react";
import { OFFICIAL_CHECKLIST, ChecklistItem } from "../types";
import { ShieldAlert, CheckCircle, Info, ChevronDown, ChevronUp } from "lucide-react";

interface ChecklistTabProps {
  enabledRules: string[];
  toggleRule: (code: string) => void;
  toggleAll: (enable: boolean) => void;
}

export default function ChecklistTab({ enabledRules, toggleRule, toggleAll }: ChecklistTabProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const categories = [
    { id: "all", name: "כל הנושאים" },
    { id: "א", name: "א. נספחים ומעמדם" },
    { id: "ב", name: "ב. ציטוט חקיקה ורגולציה" },
    { id: "ג", name: "ג. נושאים אסורים נוספים" },
    { id: "ד", name: "ד. תכניות בינוי ופיתוח" },
    { id: "ה", name: "ה. נושאים נוספים לבדיקה" }
  ];

  const filteredItems = activeCategory === "all"
    ? OFFICIAL_CHECKLIST
    : OFFICIAL_CHECKLIST.filter(item => item.category === activeCategory);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "א": return "bg-indigo-50 border-indigo-200 text-indigo-700";
      case "ב": return "bg-rose-50 border-rose-200 text-rose-700";
      case "ג": return "bg-amber-50 border-amber-200 text-amber-700";
      case "ד": return "bg-sky-50 border-sky-200 text-sky-700";
      case "ה": return "bg-emerald-50 border-emerald-200 text-emerald-700";
      default: return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "א": return "נספחים ומעמד";
      case "ב": return "חקיקה ורגולציה";
      case "ג": return "איסורים נוספים";
      case "ד": return "בינוי ופיתוח";
      case "ה": return "בדיקות נוספות";
      default: return "";
    }
  };

  return (
    <div id="checklist-tab-container" className="flex flex-col space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#EBF5F6] p-4 rounded-xl border border-[#B2D8D8] shadow-xs">
        <div>
          <h3 className="font-syne font-bold text-[#0D2C4C] text-sm sm:text-base">טופס בדיקת תח"ר</h3>
          <p className="text-[11px] text-[#0D2C4C]/70 mt-1 font-sans">בחר אילו סעיפים והנחיות לכלול בבדיקה האוטומטית של הסוכן</p>
        </div>
        <div className="flex gap-2">
          <button
            id="enable-all-rules-btn"
            onClick={() => toggleAll(true)}
            className="px-3 py-1.5 text-xs font-bold text-white bg-[#0C5A82] border border-[#0C5A82] rounded-lg hover:bg-[#009FA1] hover:border-[#009FA1] transition-all cursor-pointer shadow-sm"
          >
            סמן הכל
          </button>
          <button
            id="disable-all-rules-btn"
            onClick={() => toggleAll(false)}
            className="px-3 py-1.5 text-xs font-bold text-[#0C5A82] bg-white border border-[#D2DFE5] rounded-lg hover:bg-[#F1F5F9] transition-all cursor-pointer shadow-sm"
          >
            נקה הכל
          </button>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#D2DFE5] pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            id={`cat-filter-btn-${cat.id}`}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeCategory === cat.id
                ? "border-[#0C5A82] text-[#0C5A82] font-extrabold"
                : "border-transparent text-[#0D2C4C]/65 hover:text-[#0D2C4C] hover:bg-[#0D2C4C]/5 rounded-t-lg"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Rules list */}
      <div className="grid grid-cols-1 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
        {filteredItems.map((item) => {
          const isEnabled = enabledRules.includes(item.code);
          const isExpanded = expandedItem === item.id;

          return (
            <div
              key={item.id}
              id={`checklist-item-card-${item.id}`}
              className={`p-3 rounded-xl border transition-all ${
                isEnabled
                  ? "bg-white border-[#0C5A82] shadow-sm"
                  : "bg-[#F8FAFC] border-[#D2DFE5]/40 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`checkbox-rule-${item.code}`}
                    checked={isEnabled}
                    onChange={() => toggleRule(item.code)}
                    className="mt-1 h-4 w-4 text-[#0C5A82] border-[#D2DFE5] rounded focus:ring-[#0C5A82] cursor-pointer"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-white bg-[#0C5A82] px-1.5 py-0.5 rounded">
                        {item.code}
                      </span>
                      <h4 className="font-bold text-[#0D2C4C] text-xs sm:text-sm leading-tight">
                        {item.title}
                      </h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#D2DFE5] text-[#0D2C4C]/75 bg-[#F1F5F9]">
                        {getCategoryLabel(item.category)}
                      </span>
                      {item.isCritical && (
                        <span className="flex items-center gap-1 text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 font-bold">
                          <ShieldAlert size={10} />
                          קריטי לתנאי סף
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#0D2C4C]/70 mt-1.5 leading-relaxed font-sans">
                      {item.description}
                    </p>
                  </div>
                </div>

                <button
                  id={`btn-expand-rule-${item.id}`}
                  onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-[#D2DFE5]/50 text-xs text-slate-500 flex items-start gap-1.5 bg-[#F8FAFC] p-2.5 rounded-lg">
                  <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-[#0D2C4C]">רציונל תכנון חושב רישוי:</span>
                    <span className="mr-1 text-[#0D2C4C]/85">
                      {item.type === "forbidden" && "הנחיה זו מוסדרת כבר בחקיקה ארצית, בתקנות התכנון והבנייה או בתקנים מחייבים. הכללתה בתקנון מייצרת כפל רגולטורי, סתירות סטטוטוריות עתידיות ומעמיסה על הליך הרישוי."}
                      {item.type === "terminology" && "שימוש במינוח מדויק מונע פרשנויות מוטעות של רשויות הרישוי, ומפריד בין שלב התוכנית (התקנון) לשלב מימוש ההיתר."}
                      {item.type === "structure" && "על מסמכי התוכנית לשמור על הפרדה מוחלטת בין הוראות מחייבות לבין מסמכי רקע, כדי למנוע ספק משפטי לגבי תוקפן."}
                      {item.type === "appendix" && "הגדרת מעמד הנספחים בצורה בהירה (מחייב מול רקע) מונעת סתירות ותביעות עתידיות בשלב מתן ההיתר."}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
