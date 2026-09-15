import React, { useState } from "react";
import { ReviewResult, ReviewIssue } from "../types";
import { 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Copy, 
  Info, 
  Table, 
  Layers, 
  Check, 
  Sparkles,
  Download,
  GitCompare,
  Columns,
  Rows
} from "lucide-react";

interface ReviewResultViewProps {
  result: ReviewResult;
  onApplyAllSuggestions: () => void;
  originalText: string;
}

interface DiffSegment {
  id: string;
  type: "unchanged" | "issue";
  text: string;
  issue?: ReviewIssue;
}

function parseDiffSegments(originalText: string, issues: ReviewIssue[]): DiffSegment[] {
  if (!originalText) return [];
  if (!issues || issues.length === 0) {
    return [{ id: "seg-0", type: "unchanged", text: originalText }];
  }

  const matches: { issue: ReviewIssue; start: number; end: number }[] = [];

  issues.forEach((issue) => {
    if (!issue.quote) return;
    let searchStart = 0;
    while (searchStart < originalText.length) {
      const idx = originalText.indexOf(issue.quote, searchStart);
      if (idx === -1) break;
      matches.push({
        issue,
        start: idx,
        end: idx + issue.quote.length,
      });
      searchStart = idx + Math.max(1, issue.quote.length);
    }
  });

  matches.sort((a, b) => a.start - b.start);

  const nonOverlapping: typeof matches = [];
  let lastEnd = 0;
  for (const match of matches) {
    if (match.start >= lastEnd) {
      nonOverlapping.push(match);
      lastEnd = match.end;
    }
  }

  const segments: DiffSegment[] = [];
  let currentIdx = 0;

  nonOverlapping.forEach((match, index) => {
    if (match.start > currentIdx) {
      segments.push({
        id: `seg-unchanged-${index}`,
        type: "unchanged",
        text: originalText.slice(currentIdx, match.start),
      });
    }
    segments.push({
      id: `seg-issue-${index}`,
      type: "issue",
      text: match.issue.quote,
      issue: match.issue,
    });
    currentIdx = match.end;
  });

  if (currentIdx < originalText.length) {
    segments.push({
      id: `seg-unchanged-end`,
      type: "unchanged",
      text: originalText.slice(currentIdx),
    });
  }

  if (segments.length === 0 && originalText) {
    return [{ id: "seg-0", type: "unchanged", text: originalText }];
  }

  return segments;
}

export default function ReviewResultView({ result, onApplyAllSuggestions, originalText }: ReviewResultViewProps) {
  const [viewMode, setViewMode] = useState<"cards" | "table" | "diff">("cards");
  const [diffLayout, setDiffLayout] = useState<"sideBySide" | "inline">("sideBySide");
  const [diffFilter, setDiffFilter] = useState<"all" | "delete" | "replace">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-700 bg-emerald-50 border-emerald-300";
    if (score >= 60) return "text-amber-700 bg-amber-50 border-amber-300";
    return "text-rose-700 bg-rose-50 border-rose-300";
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 85) return "stroke-emerald-500";
    if (score >= 60) return "stroke-amber-500";
    return "stroke-rose-500";
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSuggestionBadge = (suggestion: string) => {
    switch (suggestion) {
      case "delete":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-0.5 rounded-lg font-bold">
            <Trash2 size={12} />
            הצעה למחיקה
          </span>
        );
      case "replace":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-[#0C5A82]/5 border border-[#0C5A82]/20 text-[#0C5A82] px-2.5 py-0.5 rounded-lg font-bold">
            <Edit3 size={12} />
            שינוי ודיוק ניסוח
          </span>
        );
      case "modify":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-0.5 rounded-lg font-bold">
            <Sparkles size={12} />
            הגדרה תפקודית
          </span>
        );
      default:
        return null;
    }
  };

  // Create downloadable file with the corrected regulations text
  const downloadCorrectedRegulations = () => {
    let corrected = originalText;
    
    // Sort issues by quote length descending to avoid nested replacement bugs
    const sortedIssues = [...result.issues].sort((a, b) => b.quote.length - a.quote.length);
    
    sortedIssues.forEach((issue) => {
      if (issue.quote) {
        if (issue.suggestion === "delete") {
          corrected = corrected.replace(issue.quote, `/* הסעיף הבא הוסר בהתאם לתח"ר (סעיף ${issue.ruleCode}): "${issue.quote}" */`);
        } else {
          corrected = corrected.replace(issue.quote, `/* סעיף מעודכן בהתאם לתח"ר (${issue.ruleCode}): */\n${issue.suggestedText}`);
        }
      }
    });

    const blob = new Blob([corrected], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "הוראות_תכנית_מתוקנות_תחר.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const diffSegments = parseDiffSegments(originalText, result.issues);
  const filteredIssues = result.issues.filter((issue) => {
    if (diffFilter === "delete") return issue.suggestion === "delete";
    if (diffFilter === "replace") return issue.suggestion !== "delete";
    return true;
  });

  return (
    <div id="review-result-container" className="flex flex-col space-y-6" dir="rtl">
      {/* Header Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
        
        {/* Score Ring */}
        <div className="md:col-span-1 bg-white p-4 rounded-xl border border-[#D2DFE5] flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-[10px] font-mono font-bold text-[#0D2C4C]/50 uppercase tracking-wider mb-2">עמידה בתקנות תח"ר</span>
          
          <div className="relative flex items-center justify-center w-28 h-28">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="46"
                className="stroke-[#0D2C4C]/5"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r="46"
                className={`transition-all duration-1000 ${getScoreProgressColor(result.score)}`}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - result.score / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold text-[#0D2C4C] font-syne">{result.score}</span>
              <span className="text-[10px] text-[#0D2C4C]/50">מתוך 100</span>
            </div>
          </div>

          <div className={`mt-3 px-3 py-1 rounded-lg text-xs font-bold border ${getScoreColor(result.score)}`}>
            {result.score >= 85 ? "תקין לעמידה בסעיף 109" : result.score >= 60 ? "נדרשות התאמות קלות" : "מצריך עריכה מקיפה"}
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="md:col-span-3 bg-white p-5 rounded-xl border border-[#D2DFE5] flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-[#009FA1]" size={18} />
              <h3 className="font-syne font-bold text-[#0D2C4C] text-base sm:text-lg">סיכום מנהלי של בודק התכניות</h3>
            </div>
            <p className="text-[#0D2C4C]/80 text-sm leading-relaxed whitespace-pre-line font-sans">
              {result.summary}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 border-t border-[#D2DFE5] pt-3 mt-3 text-center">
            <div className="bg-[#F8FAFC] p-2 rounded-lg border border-[#D2DFE5]/50">
              <div className="text-[10px] font-mono font-bold text-[#0D2C4C]/40 uppercase">מילים שנסרקו</div>
              <div className="text-sm font-bold text-[#0D2C4C] mt-0.5">{result.originalTextLength} מילים</div>
            </div>
            <div className="bg-rose-50/50 p-2 rounded-lg border border-rose-100">
              <div className="text-[10px] font-mono font-bold text-rose-500 uppercase">ליקויים שנמצאו</div>
              <div className="text-sm font-bold text-rose-700 mt-0.5">{result.issues.length} ליקויים</div>
            </div>
            <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
              <div className="text-[10px] font-mono font-bold text-emerald-600 uppercase">מילים שנחסכו</div>
              <div className="text-sm font-bold text-emerald-700 mt-0.5">~{result.wordCountReduced} מילים</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div id="visual-check-disclaimer-box" className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2.5 shadow-xs">
        <AlertTriangle size={16} className="text-[#E28743] shrink-0 mt-0.5" />
        <p className="leading-relaxed font-semibold font-sans">
          {result.disclaimer}
        </p>
      </div>

      {/* Action Buttons & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#EBF5F6] p-3 rounded-xl border border-[#B2D8D8] shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-[#D2DFE5] w-full sm:w-auto shadow-xs">
          <button
            id="view-mode-cards-btn"
            onClick={() => setViewMode("cards")}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all flex-1 sm:flex-none ${
              viewMode === "cards"
                ? "bg-[#0C5A82] text-white shadow-sm"
                : "text-[#0D2C4C]/65 hover:bg-[#0D2C4C]/5"
            }`}
          >
            <Layers size={14} />
            כרטיסיות השוואה
          </button>

          <button
            id="view-mode-diff-btn"
            onClick={() => setViewMode("diff")}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all flex-1 sm:flex-none ${
              viewMode === "diff"
                ? "bg-[#0C5A82] text-white shadow-sm"
                : "text-[#0D2C4C]/65 hover:bg-[#0D2C4C]/5"
            }`}
          >
            <GitCompare size={14} />
            השוואת נוסח (Diff View)
          </button>

          <button
            id="view-mode-table-btn"
            onClick={() => setViewMode("table")}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all flex-1 sm:flex-none ${
              viewMode === "table"
                ? "bg-[#0C5A82] text-white shadow-sm"
                : "text-[#0D2C4C]/65 hover:bg-[#0D2C4C]/5"
            }`}
          >
            <Table size={14} />
            טבלת סיכום לתחר
          </button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            id="download-corrected-btn"
            onClick={downloadCorrectedRegulations}
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-[#0D2C4C] bg-white border border-[#D2DFE5] rounded-xl hover:bg-[#F1F5F9] transition-all cursor-pointer w-full sm:w-auto shadow-xs"
          >
            <Download size={14} />
            הורד קובץ תקנון מתוקן
          </button>
          <button
            id="apply-suggestions-btn"
            onClick={onApplyAllSuggestions}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#009FA1] border border-[#009FA1]/10 rounded-xl hover:bg-[#00898B] transition-all cursor-pointer w-full sm:w-auto shadow-sm"
          >
            <CheckCircle size={14} />
            החל את כל התיקונים בתקנון
          </button>
        </div>
      </div>

      {/* Issues Display */}
      {viewMode === "cards" ? (
        <div id="issues-cards-list" className="space-y-4">
          {result.issues.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-[#D2DFE5] shadow-xs">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-2" />
              <h4 className="font-syne font-bold text-[#0D2C4C]">לא נמצאו חריגות מהנחיות תחר!</h4>
              <p className="text-xs text-[#0D2C4C]/60 mt-1 font-sans">הוראות התכנית שלך עומדות בדרישות סעיף 109 בצורה מושלמת.</p>
            </div>
          ) : (
            result.issues.map((issue, index) => {
              const uniqueId = `issue-${index}`;
              return (
                <div 
                  key={uniqueId} 
                  id={`issue-card-${uniqueId}`}
                  className="bg-white rounded-xl border border-[#D2DFE5] overflow-hidden shadow-sm"
                >
                  {/* Card Header */}
                  <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#D2DFE5]/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[10px] font-bold bg-[#0C5A82] text-white px-2 py-0.5 rounded-lg">
                        {issue.ruleCode}
                      </span>
                      <h4 className="font-bold text-[#0D2C4C] text-xs sm:text-sm">
                        {issue.ruleTitle}
                      </h4>
                      {issue.sectionNumber && (
                        <span className="text-xs text-[#0D2C4C]/45 font-mono font-bold">
                          ({issue.sectionNumber})
                        </span>
                      )}
                    </div>
                    <div>
                      {getSuggestionBadge(issue.suggestion)}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#D2DFE5]/60 text-xs text-[#0D2C4C]/85 flex items-start gap-2 font-sans">
                      <Info size={14} className="text-[#009FA1] shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <span className="font-bold text-[#0D2C4C]">הסבר סטטוטורי: </span>
                        {issue.explanation}
                      </p>
                    </div>

                    {/* Diff Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
                      {/* Left: Original Quote (Before) */}
                      <div className="bg-rose-50/40 p-3 rounded-xl border border-rose-100">
                        <span className="block text-[10px] font-mono font-bold text-rose-700 mb-1.5 uppercase">נוסח מקורי בתקנון</span>
                        <p className="text-xs text-[#0D2C4C] font-mono leading-relaxed bg-white/70 p-2 rounded-lg border border-rose-100 whitespace-pre-wrap">
                          {issue.quote}
                        </p>
                      </div>

                      {/* Right: Suggested Revision (After) */}
                      <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100 flex flex-col justify-between">
                        <div>
                          <span className="block text-[10px] font-mono font-bold text-emerald-700 mb-1.5 uppercase">הצעה לתיקון (תח"ר)</span>
                          {issue.suggestion === "delete" ? (
                            <div className="text-xs text-[#0D2C4C]/60 italic p-3 bg-white/50 rounded-lg border border-[#D2DFE5]/40 text-center font-bold my-4">
                              הסעיף יימחק לחלוטין מתקנון התוכנית
                            </div>
                          ) : (
                            <p className="text-xs text-emerald-900 font-mono leading-relaxed bg-white/70 p-2 rounded-lg border border-emerald-100 whitespace-pre-wrap font-semibold">
                              {issue.suggestedText}
                            </p>
                          )}
                        </div>

                        {issue.suggestion !== "delete" && (
                          <div className="flex justify-end mt-2">
                            <button
                              id={`btn-copy-suggested-${uniqueId}`}
                              onClick={() => handleCopy(issue.suggestedText, uniqueId)}
                              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#0C5A82] bg-white border border-[#D2DFE5] rounded-lg hover:bg-[#F1F5F9] transition-all font-bold cursor-pointer"
                            >
                              {copiedId === uniqueId ? (
                                <>
                                  <Check size={12} />
                                  הועתק!
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  העתק נוסח מוצע
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : viewMode === "diff" ? (
        /* Detailed Diff View Component */
        <div id="issues-diff-inspector-view" className="bg-white rounded-xl border border-[#D2DFE5] overflow-hidden shadow-sm flex flex-col">
          
          {/* Diff View Header Sub-Bar */}
          <div className="p-4 bg-[#F8FAFC] border-b border-[#D2DFE5] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <GitCompare className="text-[#009FA1]" size={18} />
              <div>
                <h4 className="font-syne font-bold text-[#0D2C4C] text-sm">השוואה חזותית של הוראות התקנון (Diff View)</h4>
                <p className="text-[11px] text-[#0D2C4C]/60 mt-0.5">השוואת נוסח התקנון המקורי אל מול התיקונים הסטטוטוריים הנדרשים לפי תח"ר</p>
              </div>
            </div>

            {/* Layout Controls & Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Layout Mode (Side-by-Side vs Inline) */}
              <div className="flex items-center bg-white p-1 rounded-lg border border-[#D2DFE5] shadow-xs">
                <button
                  id="diff-layout-side-btn"
                  onClick={() => setDiffLayout("sideBySide")}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    diffLayout === "sideBySide"
                      ? "bg-[#0C5A82] text-white"
                      : "text-[#0D2C4C]/60 hover:text-[#0D2C4C]"
                  }`}
                >
                  <Columns size={12} />
                  לצד זה (Side-by-Side)
                </button>
                <button
                  id="diff-layout-inline-btn"
                  onClick={() => setDiffLayout("inline")}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    diffLayout === "inline"
                      ? "bg-[#0C5A82] text-white"
                      : "text-[#0D2C4C]/60 hover:text-[#0D2C4C]"
                  }`}
                >
                  <Rows size={12} />
                  משולב בטקסט (Inline)
                </button>
              </div>

              {/* Filter by Issue Type */}
              <div className="flex items-center bg-white p-1 rounded-lg border border-[#D2DFE5] shadow-xs">
                <button
                  id="diff-filter-all-btn"
                  onClick={() => setDiffFilter("all")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    diffFilter === "all"
                      ? "bg-[#009FA1] text-white"
                      : "text-[#0D2C4C]/60 hover:text-[#0D2C4C]"
                  }`}
                >
                  הכל ({result.issues.length})
                </button>
                <button
                  id="diff-filter-delete-btn"
                  onClick={() => setDiffFilter("delete")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    diffFilter === "delete"
                      ? "bg-rose-600 text-white"
                      : "text-rose-700 hover:bg-rose-50"
                  }`}
                >
                  מחיקות ({result.issues.filter((i) => i.suggestion === "delete").length})
                </button>
                <button
                  id="diff-filter-replace-btn"
                  onClick={() => setDiffFilter("replace")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    diffFilter === "replace"
                      ? "bg-emerald-600 text-white"
                      : "text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  שינויי נוסח ({result.issues.filter((i) => i.suggestion !== "delete").length})
                </button>
              </div>
            </div>
          </div>

          {/* Diff Content Body */}
          {diffLayout === "sideBySide" ? (
            /* Side-by-Side Dual Pane */
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#D2DFE5] bg-white">
              
              {/* Right Side Pane: Original Text */}
              <div className="p-4 bg-rose-50/20 flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-rose-200">
                  <span className="text-xs font-bold font-mono text-rose-800 uppercase flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                    נוסח מקורי בתקנון (כפי שהועלה)
                  </span>
                  <span className="text-[10px] font-mono text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-md font-bold">
                    {result.originalTextLength} מילים
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs leading-relaxed max-h-[600px] overflow-y-auto pr-1">
                  {diffSegments.map((seg) => {
                    if (seg.type === "unchanged") {
                      return (
                        <div key={seg.id} className="text-[#0D2C4C]/60 whitespace-pre-wrap py-1 px-2 rounded hover:bg-black/5 transition-colors">
                          {seg.text}
                        </div>
                      );
                    }

                    const isFiltered = diffFilter === "delete" 
                      ? seg.issue?.suggestion === "delete" 
                      : diffFilter === "replace" 
                      ? seg.issue?.suggestion !== "delete" 
                      : true;

                    if (!isFiltered) {
                      return (
                        <div key={seg.id} className="text-[#0D2C4C]/60 whitespace-pre-wrap py-1 px-2">
                          {seg.text}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={seg.id}
                        className="bg-rose-100/70 border-r-4 border-rose-500 text-rose-950 p-3 rounded-lg shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] font-bold bg-rose-700 text-white px-1.5 py-0.5 rounded">
                            {seg.issue?.ruleCode}
                          </span>
                          <span className="text-[10px] font-bold text-rose-700">
                            {seg.issue?.suggestion === "delete" ? "הסעיף מומלץ למחיקה" : "דורש תיקון ניסוח"}
                          </span>
                        </div>
                        <p className={`whitespace-pre-wrap font-semibold ${seg.issue?.suggestion === "delete" ? "line-through text-rose-800" : ""}`}>
                          {seg.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Left Side Pane: Corrected Regulations Text */}
              <div className="p-4 bg-emerald-50/20 flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-200">
                  <span className="text-xs font-bold font-mono text-emerald-800 uppercase flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    נוסח מתוקן לפי הנחיות תח"ר (סעיף 109)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-bold">
                    עומד בתקנות
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs leading-relaxed max-h-[600px] overflow-y-auto pr-1">
                  {diffSegments.map((seg) => {
                    if (seg.type === "unchanged") {
                      return (
                        <div key={seg.id} className="text-[#0D2C4C]/60 whitespace-pre-wrap py-1 px-2 rounded hover:bg-black/5 transition-colors">
                          {seg.text}
                        </div>
                      );
                    }

                    const isFiltered = diffFilter === "delete" 
                      ? seg.issue?.suggestion === "delete" 
                      : diffFilter === "replace" 
                      ? seg.issue?.suggestion !== "delete" 
                      : true;

                    if (!isFiltered) {
                      return (
                        <div key={seg.id} className="text-[#0D2C4C]/60 whitespace-pre-wrap py-1 px-2">
                          {seg.text}
                        </div>
                      );
                    }

                    if (seg.issue?.suggestion === "delete") {
                      return (
                        <div
                          key={seg.id}
                          className="bg-slate-100 border-r-4 border-slate-400 text-slate-500 p-3 rounded-lg text-[11px] italic"
                        >
                          <div className="flex items-center gap-1 font-bold text-slate-600 mb-1 not-italic">
                            <Trash2 size={12} />
                            <span>סעיף זה הוסר במלואו מתקנון התוכנית (סעיף {seg.issue.ruleCode})</span>
                          </div>
                          <span className="line-through opacity-60">"{seg.text}"</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={seg.id}
                        className="bg-emerald-100/70 border-r-4 border-emerald-500 text-emerald-950 p-3 rounded-lg shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] font-bold bg-emerald-700 text-white px-1.5 py-0.5 rounded">
                            {seg.issue?.ruleCode} - נוסח תפקודי תקין
                          </span>
                          <button
                            onClick={() => handleCopy(seg.issue?.suggestedText || "", seg.id)}
                            className="text-[10px] font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
                          >
                            {copiedId === seg.id ? "הועתק!" : "העתק"}
                          </button>
                        </div>
                        <p className="whitespace-pre-wrap font-bold text-emerald-900">
                          {seg.issue?.suggestedText}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            /* Inline Unified Stream Mode */
            <div className="p-4 bg-[#F8FAFC] space-y-4 max-h-[600px] overflow-y-auto">
              {filteredIssues.length === 0 ? (
                <div className="text-center py-8 text-[#0D2C4C]/60 text-xs">
                  אין ליקויים התואמים את הסינון שנבחר.
                </div>
              ) : (
                filteredIssues.map((issue, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-[#D2DFE5] overflow-hidden shadow-2xs">
                    <div className="bg-[#F8FAFC] px-4 py-2.5 border-b border-[#D2DFE5] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold bg-[#0C5A82] text-white px-2 py-0.5 rounded">
                          {issue.ruleCode}
                        </span>
                        <span className="font-bold text-xs text-[#0D2C4C]">{issue.ruleTitle}</span>
                      </div>
                      {getSuggestionBadge(issue.suggestion)}
                    </div>

                    <div className="p-4 space-y-2.5">
                      {/* Old Wording Removed */}
                      <div className="bg-rose-50 border-r-4 border-rose-500 p-3 rounded-r-lg font-mono text-xs text-rose-900">
                        <span className="block text-[10px] font-bold text-rose-700 mb-1 uppercase">- נוסח שהוסר/שונה:</span>
                        <p className="line-through">{issue.quote}</p>
                      </div>

                      {/* New Wording Added */}
                      {issue.suggestion !== "delete" && (
                        <div className="bg-emerald-50 border-r-4 border-emerald-500 p-3 rounded-r-lg font-mono text-xs text-emerald-900">
                          <span className="block text-[10px] font-bold text-emerald-700 mb-1 uppercase">+ נוסח מתוקן לתחר:</span>
                          <p className="font-bold">{issue.suggestedText}</p>
                        </div>
                      )}

                      {/* Rationale */}
                      <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#D2DFE5]/60 text-xs text-[#0D2C4C]/80 font-sans flex items-start gap-2">
                        <Info size={14} className="text-[#009FA1] shrink-0 mt-0.5" />
                        <p><span className="font-bold">הסבר: </span>{issue.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      ) : (
        /* PDF-style Summary Table per 'פרומפט לבדיקת תחר' guidelines */
        <div id="issues-markdown-table-view" className="bg-white rounded-xl border border-[#D2DFE5] overflow-hidden shadow-sm">
          <div className="p-4 bg-[#F8FAFC] border-b border-[#D2DFE5] flex justify-between items-center flex-wrap gap-2">
            <h4 className="font-syne font-bold text-[#0D2C4C] text-sm">טבלת סיכום ממצאים לתחר (לפי דרישות מינהל התכנון)</h4>
            <button
              id="copy-md-table-btn"
              onClick={() => {
                let md = "| הנושא מהטופס | ציטוט + מס' סעיף | הסבר (מדוע הציטוט אינו תואם לתח\"ר/טופס) | הצעה לעריכה (שינוי או מחיקה) |\n| ---: | ---: | ---: | ---: |\n";
                result.issues.forEach(issue => {
                  const safeQuote = issue.quote.replace(/\n/g, " ");
                  const safeExplanation = issue.explanation.replace(/\n/g, " ");
                  const editDesc = issue.suggestion === "delete" 
                    ? "למחוק לחלוטין את הסעיף." 
                    : `לשנות לנוסח: "${issue.suggestedText.replace(/\n/g, " ")}"`;
                  md += `| ${issue.ruleTitle} (${issue.ruleCode}) | "${safeQuote}" (${issue.sectionNumber || "ללא סעיף"}) | ${safeExplanation} | ${editDesc} |\n`;
                });
                handleCopy(md, "table-md");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#0D2C4C] bg-white border border-[#D2DFE5] rounded-xl hover:bg-[#F1F5F9] transition-all cursor-pointer font-bold"
            >
              {copiedId === "table-md" ? (
                <>
                  <Check size={12} />
                  טבלת Markdown הועתקה!
                </>
              ) : (
                <>
                  <Copy size={12} />
                  העתק כטבלת Markdown
                </>
              )}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#D2DFE5] text-[#0D2C4C]/70 font-bold">
                  <th className="p-3 w-1/5">הנושא מהטופס</th>
                  <th className="p-3 w-1/4">ציטוט + מס' סעיף</th>
                  <th className="p-3 w-1/3">הסבר (מדוע הציטוט אינו תואם לתח"ר/טופס)</th>
                  <th className="p-3 w-1/4">הצעה לעריכה (שינוי או מחיקה)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D2DFE5]/30">
                {result.issues.map((issue, index) => (
                  <tr key={index} className="hover:bg-[#F8FAFC]/50">
                    <td className="p-3 font-bold text-[#0D2C4C]">
                      <div className="flex flex-col gap-1">
                        <span>{issue.ruleTitle}</span>
                        <span className="font-mono text-[10px] text-[#0D2C4C]/45">{issue.ruleCode}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[#0D2C4C]/80 leading-relaxed max-w-[200px] break-words">
                      <div className="font-bold text-[#0D2C4C]/50 mb-1">{issue.sectionNumber || "ללא סעיף"}</div>
                      <div className="bg-[#F8FAFC] p-1.5 rounded-lg border border-[#D2DFE5] max-h-24 overflow-y-auto">
                        "{issue.quote}"
                      </div>
                    </td>
                    <td className="p-3 text-[#0D2C4C]/70 leading-relaxed font-sans">
                      {issue.explanation}
                    </td>
                    <td className="p-3 font-medium">
                      {issue.suggestion === "delete" ? (
                        <span className="text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 block text-center font-bold">
                          למחוק לחלוטין את הסעיף
                        </span>
                      ) : (
                        <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-200 text-emerald-900 font-mono text-[11px] max-h-28 overflow-y-auto">
                          <span className="block text-[10px] font-bold text-emerald-700 mb-1">נוסח מעודכן:</span>
                          {issue.suggestedText}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
