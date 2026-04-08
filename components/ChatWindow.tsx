"use client";
import { useState, useEffect, useRef  } from "react";
import IntakeBrief from "./IntakeBrief";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface BriefData {
  clientName: string;
  contactPhone: string;
  serviceType: string;
  serviceSubType: string;
  factSummary: string;
  applicableRules: string[];
  deadlineDate: string;
  deadlineStatus: "safe" | "warning" | "expired";
  recommendedForum: string;
  urgency: "low" | "medium" | "high" | "critical";
  questionsForProfessional: string[];
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaskara! Welcome to K.T. Dakappa & Associates. I am here to help you describe your legal matter so the advocate can review it. Please tell me about your situation in your own words.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [showBrief, setShowBrief] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (data.type === "brief") {
        // Bot produced the intake brief JSON
        setBrief(data.data);
        const assistantMsg: Message = {
          role: "assistant",
          content:
            "BRIEF_READY",
        };
        setMessages([...newMessages, assistantMsg]);
      } else {
        // Regular chat message
        const assistantMsg: Message = {
          role: "assistant",
          content: data.message,
        };
        setMessages([...newMessages, assistantMsg]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function resetConversation() {
    setMessages([
      {
        role: "assistant",
        content:
          "Namaskara! Welcome to K.T. Dakappa & Associates. I am here to help you describe your legal matter so the advocate can review it. Please tell me about your situation in your own words.",
      },
    ]);
    setBrief(null);
    setShowBrief(false);
    setInput("");
  }

  if (showBrief && brief) {
    return <IntakeBrief brief={brief} onBack={() => setShowBrief(false)} />;
  }
  
const spinnerStyle = `
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-6px); }
  }
`;


  return (
    <>
    <style>{spinnerStyle}</style>

    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-[#f5f1ea]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-[#f5f1ea]">
        <div>
          <div className="flex items-center gap-2">
            <a
             href="/"
             className="text-gray-400 hover:text-gray-600 text-sm"
             >
             ←
            </a>
          <h1 className="text-lg font-semibold text-blue-900">
           K.T. Dakappa & Associates
            </h1>
          </div>

          <p className="text-xs text-gray-500">
            Powered by AITurf — This is not legal advice
          </p>
        </div>
        <button
          onClick={resetConversation}
          className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
        >
          New Consultation
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
       {messages.map((m, i) => (
  <div
    key={i}
    className={`flex flex-col gap-0.5 ${
      m.role === "user" ? "items-end" : "items-start"
    }`}
  >
    <span className="text-xs text-gray-400 px-1">
      {m.role === "user" ? "You" : "AITurf Assistant"}
    </span>
    {m.content === "BRIEF_READY" ? (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-sm">
        <p className="text-sm text-green-800 font-medium mb-1">
          Intake brief is ready
        </p>
        <p className="text-xs text-green-700 mb-3">
          Your case details have been captured. Click below to view the full brief.
        </p>
        <button
          onClick={() => setShowBrief(true)}
          className="w-full bg-green-700 text-white text-sm rounded-lg py-2 hover:bg-green-800"
        >
          View Intake Brief
        </button>
      </div>
    ) : (
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          m.role === "user"
            ? "bg-blue-700 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"
        }`}
      >
        {m.content}
      </div>
    )}
  </div>
))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
              <span
                 className="w-2 h-2 bg-gray-400 rounded-full inline-block"
                 style={{ animation: "bounce 1.2s infinite", animationDelay: "0ms" }}
                />
              <span
                 className="w-2 h-2 bg-gray-400 rounded-full inline-block"
                 style={{ animation: "bounce 1.2s infinite", animationDelay: "200ms" }}
                />
             <span
                 className="w-2 h-2 bg-gray-400 rounded-full inline-block"
                 style={{ animation: "bounce 1.2s infinite", animationDelay: "400ms" }}
               />
            </div>
         </div>
       )}
       <div ref={messagesEndRef} />

      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-gray-400 px-4 py-2 border-t border-gray-100">
        This intake form does not constitute legal advice.
      </p>

      {/* Input */}
      {brief ? (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Your intake brief is ready.{" "}
            <button
              onClick={() => setShowBrief(true)}
              className="text-blue-700 underline"
            >
              View brief
            </button>{" "}
            or{" "}
            <button
              onClick={resetConversation}
              className="text-blue-700 underline"
            >
              start a new consultation
            </button>
            .
          </p>
        </div>
      ) : (
        <div className="flex gap-2 px-4 pb-4 pt-2">
          <input
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Describe your legal matter..."
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm hover:bg-blue-800 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      )}

    </div>
  </>
  );
}
