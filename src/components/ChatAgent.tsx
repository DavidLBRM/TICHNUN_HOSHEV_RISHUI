import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { MessageSquare, Send, Sparkles, User, ShieldAlert, CornerDownLeft } from "lucide-react";

interface ChatAgentProps {
  regulationsText: string;
}

export default function ChatAgent({ regulationsText }: ChatAgentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "agent",
      text: "שלום! אני סוכן תכנון חושב רישוי (תח''ר). אני כאן כדי לעזור לך לתקן, לנסח מחדש ולדייק את הוראות התוכנית שלך בהתאם לעקרונות והנחיות תכנון חושב רישוי. \n\nתוכל לשאול אותי שאלות ספציפיות על סעיפים, לבקש נוסחים תקינים עבור נושאים מסוימים (כמו נגר, חנייה, עצים), או להתייעץ איתי על משמעות הכללים.",
      timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    if (!textToSend) {
      setInputValue("");
    }

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, newUserMessage].map((m) => ({
            sender: m.sender,
            text: m.text
          })),
          regulationsText: regulationsText
        })
      });

      if (!response.ok) {
        throw new Error("רשת האינטרנט או השרת אינם מגיבים כראוי");
      }

      const data = await response.json();
      
      const newAgentMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: data.text || "סליחה, לא הצלחתי לעבד את הבקשה כעת.",
        timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, newAgentMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "agent",
          text: "שגיאה בתקשורת עם הסוכן: " + error.message,
          timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const PRESET_QUESTIONS = [
    { label: "איך לתקן 'תנאי להיתר'?", query: "איך עלי לנסח מחדש סעיפים שמתחילים במילים 'תנאי להיתר בנייה יהיה...' כדי שיעמדו בהנחיות תח''ר?" },
    { label: "הנחיות לניהול מי נגר", query: "איזה נוסח מומלץ להוראות של ניהול מי נגר לפי תמ''א 1 שינוי 7?" },
    { label: "למה אסור לצטט חוקים?", query: "מדוע יש איסור גורף לצטט את חוק התכנון והבנייה או את חוק העתיקות בתוך תקנון התוכנית?" },
    { label: "איך לנסח היוועצות במקום אישור?", query: "תן לי דוגמה לנוסח נכון המבקש 'היוועצות' עם גורמי מאשרים (כמו כבאות או בריאות) בשלב הרישוי." }
  ];

  return (
    <div id="chat-agent-container" className="flex flex-col h-[580px] bg-white rounded-xl border border-[#D2DFE5] shadow-xs overflow-hidden" dir="rtl">
      {/* Chat Header */}
      <div className="bg-[#0D2C4C] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-[#009FA1] p-1.5 rounded-lg text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight text-white">התייעצות עם סוכן תכנון חושב רישוי</h3>
            <span className="text-[10px] text-white/70">מענה מקצועי והנחיות לניסוח סטטוטורי לפי סעיף 109</span>
          </div>
        </div>
        <span className="text-[10px] bg-[#0C5A82]/50 text-white/90 px-2 py-0.5 rounded-full font-mono">
          סוכן פעיל
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAFC]">
        {messages.map((msg) => {
          const isAgent = msg.sender === "agent";
          return (
            <div
              key={msg.id}
              id={`chat-msg-${msg.id}`}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                isAgent ? "mr-0 ml-auto" : "mr-auto ml-0 flex-row-reverse"
              }`}
            >
              {/* Avatar */}
              <div className={`p-1.5 rounded-lg shrink-0 ${
                isAgent ? "bg-[#0C5A82] text-white" : "bg-[#009FA1] text-white"
              }`}>
                {isAgent ? <Sparkles size={14} /> : <User size={14} />}
              </div>

              {/* Bubble */}
              <div className="flex flex-col">
                <div className={`p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap shadow-xs border ${
                  isAgent 
                    ? "bg-white text-[#0D2C4C] border-[#D2DFE5] rounded-tr-none" 
                    : "bg-[#009FA1] text-white border-[#00898B] rounded-tl-none font-medium"
                }`}>
                  {msg.text}
                </div>
                <span className={`text-[9px] text-[#0D2C4C]/50 mt-1 px-1 ${
                  isAgent ? "text-right" : "text-left"
                }`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5 max-w-[85%] mr-0 ml-auto">
            <div className="p-1.5 rounded-lg bg-[#0C5A82] text-white shrink-0 animate-pulse">
              <Sparkles size={14} />
            </div>
            <div className="bg-white text-[#0D2C4C] border border-[#D2DFE5] p-3 rounded-xl rounded-tr-none shadow-xs">
              <div className="flex gap-1 items-center justify-center py-1 px-2">
                <span className="h-1.5 w-1.5 bg-[#0C5A82] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 bg-[#0C5A82] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 bg-[#0C5A82] rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Questions Rail */}
      <div className="p-2 border-t border-[#D2DFE5] bg-white overflow-x-auto whitespace-nowrap flex gap-1.5 no-scrollbar">
        {PRESET_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            id={`preset-question-${idx}`}
            onClick={() => handleSend(q.query)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[#0D2C4C] bg-[#F1F5F9] hover:bg-[#EBF5F6] border border-[#D2DFE5] rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <CornerDownLeft size={10} className="text-[#0C5A82]" />
            {q.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 border-t border-[#D2DFE5] bg-white flex gap-2 items-center"
      >
        <input
          type="text"
          id="chat-input-field"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="שאל אותי על סעיף, בקש נוסח חלופי, או התייעץ..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-xs border border-[#D2DFE5] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#0C5A82] focus:border-[#0C5A82] disabled:bg-slate-50 disabled:text-slate-400"
        />
        <button
          type="submit"
          id="chat-submit-btn"
          disabled={isLoading || !inputValue.trim()}
          className="p-2 bg-[#009FA1] hover:bg-[#00898B] disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-lg transition-colors cursor-pointer"
        >
          <Send size={14} className="transform rotate-180" />
        </button>
      </form>
    </div>
  );
}
