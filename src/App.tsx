import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Settings, 
  MessageSquare, 
  Sparkles, 
  UploadCloud, 
  X, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  BookOpen
} from "lucide-react";
import { OFFICIAL_CHECKLIST, ReviewResult, ChecklistItem } from "./types";
import { PLAN_SAMPLES, PlanSample } from "./samples";
import ChecklistTab from "./components/ChecklistTab";
import ReviewResultView from "./components/ReviewResult";
import ChatAgent from "./components/ChatAgent";
import TaharGuide from "./components/TaharGuide";

// Storage key and history interface
const STORAGE_KEY_PLAN_HISTORY = "tahar_plan_history_v1";

interface HistoryPlan {
  id: string;
  title: string;
  description: string;
  text: string;
  date: string;
}

const DEFAULT_PLAN_HISTORY: HistoryPlan[] = [
  {
    id: "sample-1",
    title: PLAN_SAMPLES[0].title,
    description: PLAN_SAMPLES[0].description,
    text: PLAN_SAMPLES[0].text,
    date: "דוגמה"
  },
  {
    id: "sample-2",
    title: PLAN_SAMPLES[1].title,
    description: PLAN_SAMPLES[1].description,
    text: PLAN_SAMPLES[1].text,
    date: "דוגמה"
  },
  {
    id: "sample-3",
    title: PLAN_SAMPLES[2].title,
    description: PLAN_SAMPLES[2].description,
    text: PLAN_SAMPLES[2].text,
    date: "דוגמה"
  }
];

export default function App() {
  // Regulations state
  const [regulationsText, setRegulationsText] = useState("");
  const [enabledRules, setEnabledRules] = useState<string[]>(
    OFFICIAL_CHECKLIST.map((r) => r.code)
  );

  // Layout tabs
  const [leftTab, setLeftTab] = useState<"editor" | "checklist" | "guide">("editor");
  const [rightTab, setRightTab] = useState<"results" | "chat">("results");

  // Interaction states
  const [isLoading, setIsLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Persistent history state for last 3 uploaded or audited plans
  const [planHistory, setPlanHistory] = useState<HistoryPlan[]>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_PLAN_HISTORY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.slice(0, 3);
          }
        }
      } catch (e) {
        console.error("Failed to load plan history from localStorage", e);
      }
    }
    return DEFAULT_PLAN_HISTORY;
  });

  // Sync plan history changes to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_PLAN_HISTORY, JSON.stringify(planHistory));
      } catch (e) {
        console.error("Failed to save plan history to localStorage", e);
      }
    }
  }, [planHistory]);

  const addPlanToHistory = (title: string, text: string) => {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    const cleanTitle = title || `תכנית ${new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}`;
    const description = cleanText.slice(0, 55).replace(/\r?\n|\r/g, " ") + "...";
    const timeStr = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

    setPlanHistory((prev) => {
      if (prev.length > 0 && prev[0].text.trim() === cleanText) {
        return prev;
      }
      const filtered = prev.filter((p) => p.text.trim() !== cleanText);
      return [
        {
          id: `plan-${Date.now()}`,
          title: cleanTitle,
          description: description,
          text: cleanText,
          date: timeStr
        },
        ...filtered
      ].slice(0, 3);
    });
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readAndSetFile(file);
  };

  const readAndSetFile = (file: File) => {
    if (file.type !== "text/plain" && !file.name.endsWith(".txt") && !file.name.endsWith(".json")) {
      setErrorMessage("סוג קובץ לא נתמך. אנא העלה קובץ טקסט (.txt) בלבד.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRegulationsText(text);
        setErrorMessage(null);
        setReviewResult(null);
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        addPlanToHistory(`קובץ: ${fileNameWithoutExt}`, text);
      }
    };
    reader.onerror = () => {
      setErrorMessage("שגיאה בקריאת הקובץ. אנא נסה שנית.");
    };
    reader.readAsText(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readAndSetFile(file);
    }
  };

  // Load a sample plan
  const loadSample = (sample: PlanSample) => {
    setRegulationsText(sample.text);
    setReviewResult(null);
    setErrorMessage(null);
    setLeftTab("editor");
  };

  // Toggle checklist rules
  const toggleRule = (code: string) => {
    setEnabledRules((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleAllRules = (enable: boolean) => {
    if (enable) {
      setEnabledRules(OFFICIAL_CHECKLIST.map((r) => r.code));
    } else {
      setEnabledRules([]);
    }
  };

  // Run the AI Review Audit
  const handleRunAudit = async () => {
    if (!regulationsText.trim()) {
      setErrorMessage("אנא הזן או העלה את הוראות התכנית תחילה.");
      return;
    }

    addPlanToHistory("תכנית שנבדקה", regulationsText);

    setIsLoading(true);
    setErrorMessage(null);
    setReviewResult(null);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regulationsText: regulationsText,
          enabledRules: enabledRules,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "התקבלה תגובה לא תקינה מהשרת.");
      }

      const data = await response.json();
      setReviewResult(data);
      setRightTab("results");
    } catch (err: any) {
      console.error("Audit failure:", err);
      setErrorMessage(err.message || "שגיאה בתקשורת עם סוכן ה-AI. אנא נסה שנית.");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply all suggestions in-place on regulations text
  const applyAllSuggestions = () => {
    if (!reviewResult) return;

    let updatedText = regulationsText;
    
    // Sort issues by length of the original quote in descending order to avoid overlapping replacement issues
    const sortedIssues = [...reviewResult.issues].sort((a, b) => b.quote.length - a.quote.length);
    
    sortedIssues.forEach((issue) => {
      if (issue.quote) {
        if (issue.suggestion === "delete") {
          // Comment out or remove the deleted section
          updatedText = updatedText.replace(issue.quote, `/* הוסר בהתאם לתח"ר: ${issue.ruleTitle} */`);
        } else {
          // Replace with the suggested text
          updatedText = updatedText.replace(issue.quote, issue.suggestedText);
        }
      }
    });

    setRegulationsText(updatedText);
    setReviewResult(null); // Clear result since we updated the text
    setErrorMessage(null);
    setLeftTab("editor");
  };

  return (
    <div id="app-root" className="h-screen flex flex-col overflow-hidden bg-[#F3F6F9] text-[#0D2C4C] font-sans" dir="rtl">
      {/* Top Banner Header with Professional Polish Style */}
      <header className="px-4 md:px-8 py-3 bg-[#0C5A82] border-b border-[#0C5A82]/20 flex justify-between items-center shrink-0 z-10 text-white shadow-md shadow-[#0C5A82]/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/95 p-1 flex items-center justify-center shrink-0 shadow-sm border border-white/30 overflow-hidden select-none">
            <svg viewBox="0 0 512 512" className="w-full h-full" fill="none">
              {/* Blueprint Sheet Background */}
              <rect x="75" y="80" width="365" height="365" rx="16" fill="#FFFFFF" stroke="#0D2C4C" strokeWidth="26" />
              {/* Rolled Edge on Left */}
              <path d="M 85 80 C 20 80 20 445 85 445 L 55 445 C 20 445 20 80 55 80 Z" fill="#6B9080" stroke="#0D2C4C" strokeWidth="24" strokeLinejoin="round" />
              <path d="M 85 80 C 35 80 35 445 85 445" fill="#A8DADC" stroke="#0D2C4C" strokeWidth="22" />
              {/* Green block top-left */}
              <path d="M 120 120 H 240 V 230 H 185 V 175 H 120 Z" fill="#2EC4B6" stroke="#0D2C4C" strokeWidth="20" strokeLinejoin="round" />
              {/* Cyan block top-right */}
              <rect x="270" y="120" width="85" height="75" rx="6" fill="#00B4D8" stroke="#0D2C4C" strokeWidth="20" />
              {/* Orange block mid-left */}
              <rect x="120" y="265" width="90" height="45" rx="6" fill="#FF9F1C" stroke="#0D2C4C" strokeWidth="20" />
              {/* Red/Coral L block center */}
              <path d="M 235 235 H 305 V 320 H 265 V 275 H 235 Z" fill="#E71D36" stroke="#0D2C4C" strokeWidth="20" strokeLinejoin="round" />
              {/* Yellow L block bottom-right */}
              <path d="M 315 360 H 380 V 415 H 345 V 385 H 315 Z" fill="#FFBF00" stroke="#0D2C4C" strokeWidth="20" strokeLinejoin="round" />
              {/* Drawn Line */}
              <path d="M 130 385 C 130 350 250 350 290 350" stroke="#0D2C4C" strokeWidth="26" strokeLinecap="round" fill="none" />
              {/* Pencil */}
              <g>
                <path d="M 470 145 L 300 315 C 290 325 275 350 275 360 C 285 360 310 345 320 335 L 490 165 Z" fill="#457B9D" stroke="#0D2C4C" strokeWidth="22" strokeLinejoin="round" />
                <path d="M 450 125 L 470 145 L 490 165 L 470 185 Z" fill="#E0E1DD" stroke="#0D2C4C" strokeWidth="18" />
                <path d="M 275 360 L 305 348 L 292 335 Z" fill="#0D2C4C" />
              </g>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-syne font-extrabold text-sm sm:text-base tracking-tight leading-none text-white">
                בודק תכניות
              </h1>
            </div>
            <p className="text-[10px] text-white/85 font-mono tracking-wider font-semibold uppercase mt-1">
              תכנון חושב רישוי • לשכת תכנון דרום
            </p>
          </div>
        </div>
      </header>

      {/* Main Workspace Workspace */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr] md:overflow-hidden min-h-0">
        
        {/* RIGHT COLUMN: Sidebar (380px) */}
        <aside className="border-l border-[#D2DFE5] bg-white flex flex-col md:overflow-y-auto shrink-0 min-h-0 order-first md:order-none">
          <nav className="flex border-b border-[#D2DFE5] px-4 shrink-0 bg-[#F8FAFC]">
            <button
              id="left-tab-editor-btn"
              onClick={() => setLeftTab("editor")}
              className={`flex-1 py-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
                leftTab === "editor"
                  ? "border-[#0C5A82] text-[#0C5A82]"
                  : "border-transparent text-[#0D2C4C]/60 hover:text-[#0D2C4C]"
              }`}
            >
              <FileText size={14} />
              הוראות התכנית
            </button>
            <button
              id="left-tab-checklist-btn"
              onClick={() => setLeftTab("checklist")}
              className={`flex-1 py-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
                leftTab === "checklist"
                  ? "border-[#0C5A82] text-[#0C5A82]"
                  : "border-transparent text-[#0D2C4C]/60 hover:text-[#0D2C4C]"
              }`}
            >
              <Settings size={14} />
              צ'קליסט תח''ר ({enabledRules.length})
            </button>
            <button
              id="left-tab-guide-btn"
              onClick={() => setLeftTab("guide")}
              className={`flex-1 py-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
                leftTab === "guide"
                  ? "border-[#0C5A82] text-[#0C5A82]"
                  : "border-transparent text-[#0D2C4C]/60 hover:text-[#0D2C4C]"
              }`}
            >
              <BookOpen size={14} />
              מדריך תח''ר
            </button>
          </nav>

          {/* Tab Content Panels */}
          {leftTab === "editor" ? (
            <div className="p-5 flex flex-col space-y-4 min-h-0">
              
              {/* 1. Header & Text Area Drag Zone */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="regulations-textarea" className="text-[10px] font-mono font-bold text-[#18181B]/60 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={13} className="text-[#0C5A82]" />
                    הוראות התכנית לבדיקה
                  </label>
                  {regulationsText && (
                    <button
                      id="clear-regulations-btn"
                      onClick={() => {
                        setRegulationsText("");
                        setReviewResult(null);
                      }}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer flex items-center gap-0.5"
                    >
                      <X size={12} />
                      נקה הכל
                    </button>
                  )}
                </div>

                <div
                  id="drag-and-drop-zone"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl transition-all ${
                    dragOver
                      ? "border-[#2563EB] bg-[#2563EB]/5"
                      : "border-[#18181B]/15 bg-[#F8F7F4]"
                  }`}
                >
                  <textarea
                    id="regulations-textarea"
                    value={regulationsText}
                    onChange={(e) => setRegulationsText(e.target.value)}
                    placeholder="הדבק כאן את פרק הוראות התכנית (תקנון) או גרור לכאן קובץ טקסט (.txt)..."
                    className="w-full h-[200px] p-3.5 text-xs font-mono border-0 rounded-xl focus:ring-0 focus:outline-hidden bg-transparent resize-none leading-relaxed text-[#18181B]"
                  />

                  {/* Empty State Overlay */}
                  {!regulationsText && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                      <UploadCloud size={24} className="text-[#0C5A82]/40 mb-2" />
                      <span className="text-xs font-bold text-[#0D2C4C]">
                        הדבק טקסט או העלה קובץ הוראות תכנית
                      </span>
                      <span className="text-[10px] text-[#0D2C4C]/50 mt-0.5 font-sans">
                        גרור קובץ .txt לכאן או לחץ לבחירה
                      </span>
                    </div>
                  )}
                </div>

                {/* File input fallback */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-[#0D2C4C]/40 text-[9px] font-mono font-bold uppercase">
                    פורמט נתמך: .TXT
                  </span>
                  <label className="text-xs font-bold text-[#0C5A82] hover:text-[#009FA1] cursor-pointer inline-flex items-center gap-1 transition-colors">
                    <span>העלאת קובץ</span>
                    <input
                      type="file"
                      id="file-upload-input"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* 2. Run Audit Button */}
              <button
                id="run-audit-btn"
                onClick={handleRunAudit}
                disabled={isLoading || !regulationsText.trim()}
                className="w-full py-3.5 px-4 bg-[#0C5A82] hover:bg-[#009FA1] text-white disabled:opacity-30 disabled:hover:bg-[#0C5A82] disabled:cursor-not-allowed font-bold text-xs rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    סורק ומנתח הוראות...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    הרצת בדיקה סטטוטורית
                  </>
                )}
              </button>

              {/* 3. Plan History Section (Last 3 plans uploaded or tested) */}
              <div className="pt-3 border-t border-[#D2DFE5]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-[#0D2C4C]/70 uppercase tracking-wider flex items-center gap-1">
                    <Clock size={12} className="text-[#009FA1]" />
                    היסטוריית תכניות (3 אחרונות)
                  </span>
                  <span className="text-[9px] text-[#0D2C4C]/40 font-mono">
                    חזרה לתכנית
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {planHistory.slice(0, 3).map((plan, idx) => {
                    const isSelected = regulationsText.trim() === plan.text.trim();
                    return (
                      <button
                        key={plan.id}
                        id={`load-sample-btn-sample-${idx + 1}`}
                        onClick={() => {
                          setRegulationsText(plan.text);
                          setReviewResult(null);
                          setErrorMessage(null);
                        }}
                        className={`p-2.5 text-right border rounded-xl transition-all text-xs cursor-pointer group flex items-start justify-between gap-2 ${
                          isSelected
                            ? "border-[#009FA1] bg-[#EBF5F6] shadow-2xs"
                            : "border-[#D2DFE5] hover:border-[#0C5A82] hover:bg-[#F8FAFC] bg-white"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className={`font-bold transition-colors truncate text-xs ${
                            isSelected ? "text-[#009FA1]" : "text-[#0D2C4C] group-hover:text-[#0C5A82]"
                          }`}>
                            {plan.title}
                          </div>
                          <div className="text-[10px] text-[#0D2C4C]/60 mt-0.5 line-clamp-1 font-sans">
                            {plan.description}
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-[#0D2C4C]/50 shrink-0 mt-0.5 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
                          {plan.date}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : leftTab === "checklist" ? (
            /* Checklist Rules Selection Tab */
            <div className="p-4 flex flex-col overflow-y-auto">
              <ChecklistTab
                enabledRules={enabledRules}
                toggleRule={toggleRule}
                toggleAll={toggleAllRules}
              />
            </div>
          ) : (
            /* TAHAR Guide Tab */
            <div className="p-4 flex flex-col overflow-y-auto">
              <TaharGuide />
            </div>
          )}

          {/* Feedback/Error Display */}
          {errorMessage && (
            <div id="error-message-alert" className="p-4 m-4 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-start gap-3">
              <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">שגיאה בפעולה:</h4>
                <p className="mt-1 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}
        </aside>

        {/* LEFT COLUMN: Content Area (1fr) */}
        <section className="flex-1 flex flex-col md:overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F3F6F9] min-h-0" style={{
          backgroundImage: "radial-gradient(circle, rgba(12, 90, 130, 0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}>
          
          {/* Tab Headers inside content-area */}
          <div className="flex border-b border-[#D2DFE5] mb-6 shrink-0 bg-transparent">
            <button
              id="right-tab-results-btn"
              onClick={() => setRightTab("results")}
              className={`pb-4 px-6 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                rightTab === "results"
                  ? "border-[#0C5A82] text-[#0C5A82] font-extrabold"
                  : "border-transparent text-[#0D2C4C]/60 hover:text-[#0D2C4C]"
              }`}
            >
              <CheckCircle size={14} />
              דוח בדיקה מפורט
            </button>
            <button
              id="right-tab-chat-btn"
              onClick={() => setRightTab("chat")}
              className={`pb-4 px-6 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                rightTab === "chat"
                  ? "border-[#0C5A82] text-[#0C5A82] font-extrabold"
                  : "border-transparent text-[#0D2C4C]/60 hover:text-[#0D2C4C]"
              }`}
            >
              <MessageSquare size={14} />
              התייעצות AI
            </button>
          </div>

          {/* Audit Results Panel */}
          <div className="flex-1 min-h-0">
            {rightTab === "results" ? (
              <div className="h-full">
                {isLoading ? (
                  /* Scanning state with reassure notes as suggested in guidelines */
                  <div id="loading-spinner-state" className="bg-white rounded-xl border border-[#D2DFE5] p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-lg shadow-[#0c5a82]/5">
                    <RefreshCw size={44} className="text-[#009FA1] animate-spin mb-4" />
                    <h3 className="font-syne font-bold text-base text-[#0D2C4C]">הסוכן סורק ומנתח כעת את התקנון...</h3>
                    <div className="max-w-md text-xs text-[#0D2C4C]/60 mt-3.5 space-y-2 leading-relaxed">
                      <p className="font-bold text-[#0D2C4C]">אנא המתן, ניתוח סטטוטורי מעמיק דורש מספר שניות.</p>
                      <p className="font-sans">מפענח סעיפים חורגים, מאתר ציטוטי חקיקה מיותרים, ומנסח הצעות עריכה תפקודיות וסטטוטוריות מדויקות להסרת כפילויות רישוי.</p>
                    </div>
                  </div>
                ) : reviewResult ? (
                  /* Interactive audit findings */
                  <ReviewResultView
                    result={reviewResult}
                    onApplyAllSuggestions={applyAllSuggestions}
                    originalText={regulationsText}
                  />
                ) : (
                  /* Clean elegant empty placeholder state focusing on negative space as requested by guidelines */
                  <div id="no-audit-placeholder-state" className="text-right max-w-xl mx-auto py-12">
                    <h2 
                      className="font-syne font-extrabold text-[#18181B] tracking-tighter"
                      style={{ textAlign: "center", fontSize: "58px", lineHeight: "66px", marginBottom: "0px" }}
                    >
                      מערכת עזר לבדיקת
                      <br />
                      תכנון חושב רישוי
                    </h2>
                    <div style={{ marginTop: "25px", marginBottom: "37px" }}>
                      <p 
                        className="text-sm sm:text-base text-[#18181B]/60 leading-relaxed max-w-md mx-auto font-sans"
                        style={{ textAlign: "center", marginBottom: "12px" }}
                      >
                        כלי AI המאפשר מעבר מהיר על הוראות התכנית וביצוע השוואה טקסטואלית בינן ובין הנחיות ועקרונות תכנון חושב רישוי.
                      </p>
                      <p 
                        className="text-sm sm:text-base text-[#18181B]/60 leading-relaxed max-w-md mx-auto font-sans"
                        style={{ textAlign: "center" }}
                      >
                        יש להעלות את קובץ הוראות התכנית מצד ימין כדי להתחיל בהליך הבדיקה.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-[#18181B]/15">
                      <div>
                        <p className="font-mono text-[10px] font-bold text-[#2563EB] uppercase tracking-wider mb-1.5">
                          REGULATION / סעיף 109
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-[#18181B] leading-relaxed">
                          זיהוי דרישות קניין, תפעול ואישורים מיותרים בשלב הרישוי.
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] font-bold text-[#2563EB] uppercase tracking-wider mb-1.5">
                          FUNCTIONAL / מעבר לתפקודי
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-[#18181B] leading-relaxed">
                          החלפת מרשמיות יתר עיצובית בהגדרות גמישות המאיצות היתרים.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Interactive AI Chat consultation tab */
              <ChatAgent regulationsText={regulationsText} />
            )}
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-4 bg-white border-t-[1.5px] border-[#18181B] flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#18181B]/60 font-medium shrink-0">
        <div>תכנון חושב רישוי AI • סוכן מקצועי לבדיקת והתאמת תוכניות בנייה</div>
        <div className="font-mono uppercase tracking-wider text-[#18181B]/50 mt-1 sm:mt-0">
          &copy; {new Date().getFullYear()} מינהל התכנון • בודק תחר • V.02
        </div>
      </footer>
    </div>
  );
}
