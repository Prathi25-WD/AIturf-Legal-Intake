"use client";
import { useState, useEffect, useRef } from "react";
import IntakeBrief from "./IntakeBrief";


interface Message {
  role: "user" | "assistant";
  content: string;
  time?: string;
  chips?: string[];
}
interface BriefData {
  clientName: string; contactPhone: string; serviceType: string;
  serviceSubType: string; factSummary: string; applicableRules: string[];
  deadlineDate: string; deadlineStatus: "safe" | "warning" | "expired";
  recommendedForum: string; urgency: "low" | "medium" | "high" | "critical";
  questionsForProfessional: string[];
}

function getTime() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}
function getHeaderDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}
function isOfficeHours() {
  const h = new Date().getHours();
  const day = new Date().getDay();
  return day >= 1 && day <= 6 && h >= 17 && h < 21;
}

const INITIAL_CHIPS = [
  "Property dispute", "Tenant issue",
  "Builder delay", "Cheque bounce", "Family / inheritance",
];


export default function ChatWindow() {
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Namaskara! Welcome to K.T. Dakappa & Associates. I am here to help you describe your legal matter so the advocate can review it. Please tell me about your situation in your own words or Please select the options below",
    time: getTime(),
    chips: INITIAL_CHIPS,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [showBrief, setShowBrief] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content, time: getTime() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content === "BRIEF_READY" ? "The intake brief has been generated." : m.content,
      }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      if (data.type === "brief") {
        setBrief(data.data);
        setMessages([...newMessages, {
          role: "assistant", content: "BRIEF_READY", time: getTime(),
        }]);
      } else {
        // Generate contextual chips based on common follow-up answers
        const chips = generateChips(data.message);
        setMessages([...newMessages, {
          role: "assistant", content: data.message,
          time: getTime(), chips,
        }]);
      }
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        time: getTime(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function generateChips(botMessage: string): string[] | undefined {
    const msg = botMessage.toLowerCase();
    if (msg.includes("document") || msg.includes("deed") || msg.includes("agreement")) {
      return ["Yes, I have documents", "No documents yet", "Not sure what I have"];
    }
    if (msg.includes("residential") || msg.includes("commercial")) {
      return ["Residential", "Commercial"];
    }
    if (msg.includes("how long") || msg.includes("when did") || msg.includes("how many months")) {
      return ["Less than 1 year", "1-3 years", "More than 3 years"];
    }
    if (msg.includes("notice") || msg.includes("sent") || msg.includes("communicated")) {
      return ["Yes, sent notice", "No notice yet"];
    }
    if (msg.includes("will") || msg.includes("testament")) {
      return ["Yes, there is a will", "No will", "Not sure"];
    }
    return undefined;
  }

  function resetConversation() {
    setMessages([{
      role: "assistant",
      content: "Namaskara! Welcome to K.T. Dakappa & Associates. I am here to help you describe your legal matter so the advocate can review it. Please tell me about your situation in your own words.",
      time: getTime(),
      chips: INITIAL_CHIPS,
    }]);
    setBrief(null); setShowBrief(false); setInput("");
  }

  if (showBrief && brief) {
    return <IntakeBrief brief={brief} onBack={() => setShowBrief(false)} />;
  }

  const officeStatus = isOfficeHours();

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100dvh",
      maxWidth: "680px", margin: "0 auto",
      background: "var(--bg-page)", fontFamily: "var(--font-sans, sans-serif)",
    }}>

      {/* ── Header ── */}
      <div style={{
        background: "var(--bg-header)", borderBottom: "1px solid var(--border-main)",
        padding: "12px 16px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "12px",
      }}>
        <button
              onClick={() => window.location.href = "/landing"}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "var(--olive-dark)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="#F5F0E8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="13" y1="8" x2="3" y2="8" />
                <polyline points="7,4 3,8 7,12" />
              </svg>
            </button>

        {/* Left: logo + firm info */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "8px",
            background: "var(--olive-dark)", color: "#F5F0E8",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 600, flexShrink: 0,
          }}>AT</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>
              K.T. Dakappa &amp; Associates
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.3 }}>
              Advocates &amp; Legal Consultants, Basavanagudi, Bangalore
            </p>
          </div>
        </div>

        {/* Right: date + office hours + user avatar + new consultation */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <div style={{ textAlign: "right", display: "none" }} className="sm-show">
            <p style={{ fontSize: "11px", color: "var(--text-primary)", margin: 0, fontWeight: 500 }}>
              {getHeaderDate()}
            </p>
            <p style={{
              fontSize: "11px", margin: 0,
              color: officeStatus ? "var(--accent-green)" : "var(--text-secondary)",
            }}>
              {officeStatus ? "Office hours" : "Outside office hours"}
            </p>
          </div>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "var(--cream-dark)", color: "var(--olive-dark)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", fontWeight: 600,
          }}>KD</div>
          <button onClick={resetConversation} style={{
            background: "var(--bg-page)", border: "1px solid var(--border-main)",
            borderRadius: "8px", padding: "7px 12px", fontSize: "12px",
            fontWeight: 500, color: "var(--text-primary)", cursor: "pointer",
            whiteSpace: "nowrap",
          }}>+ New consultation</button>
        </div>
      </div>

      {/* ── AITurf badge ── */}
      <div style={{
        padding: "6px 16px", background: "var(--bg-page)",
        borderBottom: "1px solid var(--border-main)",
        display: "flex", alignItems: "center", gap: "6px",
      }}>
        <span style={{
          width: "7px", height: "7px", borderRadius: "50%",
          background: "var(--olive-mid)", display: "inline-block",
        }} />
        <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
          powered by AITurf
        </span>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "16px",
        display: "flex", flexDirection: "column", gap: "4px",
      }}>
        {messages.map((m, i) => (
          <div key={i}>
            {m.role === "assistant" ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "2px" }}>
                {/* Bot avatar */}
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "var(--olive-dark)", color: "#F5F0E8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: 600, flexShrink: 0, marginTop: "2px",
                }}>AT</div>
                <div style={{ maxWidth: "78%", minWidth: 0 }}>
                  {m.content === "BRIEF_READY" ? (
                    <div style={{
                      background: "var(--accent-green-bg)",
                      border: "1px solid #C0DD97", borderRadius: "12px",
                      borderTopLeftRadius: "4px", padding: "14px 16px",
                    }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-green)", margin: "0 0 4px" }}>
                        Intake brief is ready
                      </p>
                      <p style={{ fontSize: "12px", color: "#3B5A1A", margin: "0 0 10px" }}>
                        Your case details have been captured and classified.
                      </p>
                      <button onClick={() => setShowBrief(true)} style={{
                        background: "var(--accent-green)", color: "#fff",
                        border: "none", borderRadius: "8px", padding: "8px 16px",
                        fontSize: "12px", fontWeight: 600, cursor: "pointer", width: "100%",
                      }}>View Intake Brief</button>
                    </div>
                  ) : (
                    <div style={{
                      background: "var(--bg-bot-bubble)",
                      border: "1px solid var(--border-main)",
                      borderRadius: "12px", borderTopLeftRadius: "4px",
                      padding: "10px 14px", fontSize: "13px",
                      lineHeight: "1.6", color: "var(--text-primary)",
                    }}>{m.content}</div>
                  )}
                  {m.time && (
                    <p style={{ fontSize: "10px", color: "var(--text-secondary)", margin: "3px 0 0 4px" }}>
                      {m.time}
                    </p>
                  )}
                  {/* Quick-reply chips */}
                  {m.chips && m.chips.length > 0 && !brief && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                      {m.chips.map((chip, ci) => (
                        <button key={ci} onClick={() => sendMessage(chip)} style={{
                          background: "var(--bg-chip)",
                          border: "1px solid var(--border-chip)",
                          borderRadius: "20px", padding: "5px 12px",
                          fontSize: "11px", color: "var(--text-chip)",
                          cursor: "pointer", fontWeight: 500,
                        }}>{chip}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginBottom: "2px" }}>
                <div style={{ maxWidth: "78%" }}>
                  <div style={{
                    background: "var(--bg-user-bubble)", color: "var(--text-user-msg)",
                    borderRadius: "12px", borderTopRightRadius: "4px",
                    padding: "10px 14px", fontSize: "13px",
                    lineHeight: "1.6", fontWeight: 500,
                  }}>{m.content}</div>
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "flex-end", gap: "6px", marginTop: "3px",
                  }}>
                    {m.time && (
                      <p style={{ fontSize: "10px", color: "var(--text-secondary)", margin: 0 }}>
                        {m.time}
                      </p>
                    )}
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "50%",
                      background: "var(--cream-dark)", color: "var(--olive-dark)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "8px", fontWeight: 700,
                    }}>You</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "var(--olive-dark)", color: "#F5F0E8",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", fontWeight: 600, flexShrink: 0,
            }}>AT</div>
            <div style={{
              background: "var(--bg-bot-bubble)", border: "1px solid var(--border-main)",
              borderRadius: "12px", borderTopLeftRadius: "4px",
              padding: "12px 16px", display: "flex", gap: "4px", alignItems: "center",
            }}>
              {[0, 150, 300].map((delay) => (
                <span key={delay} style={{
                  width: "7px", height: "7px", borderRadius: "50%",
                  background: "var(--olive-light)", display: "inline-block",
                  animation: "bounce 1.2s infinite",
                  animationDelay: delay + "ms",
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Disclaimer ── */}
      <p style={{
        textAlign: "center", fontSize: "10px", color: "var(--text-secondary)",
        padding: "6px 16px", borderTop: "1px solid var(--border-main)",
        background: "var(--bg-page)", margin: 0,
      }}>
        This intake form does not constitute legal advice.
      </p>

      {/* ── Input bar ── */}
      {brief ? (
        <div style={{
          padding: "12px 16px", borderTop: "1px solid var(--border-main)",
          background: "var(--bg-page)", textAlign: "center",
        }}>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
            Brief ready.{" "}
            <button onClick={() => setShowBrief(true)} style={{
              color: "var(--olive-dark)", background: "none", border: "none",
              textDecoration: "underline", cursor: "pointer", fontSize: "13px",
            }}>View brief</button>
            {" "}or{" "}
            <button onClick={resetConversation} style={{
              color: "var(--olive-dark)", background: "none", border: "none",
              textDecoration: "underline", cursor: "pointer", fontSize: "13px",
            }}>start new consultation</button>.
          </p>
        </div>
      ) : (
        <div style={{
          padding: "10px 14px", borderTop: "1px solid var(--border-main)",
          background: "var(--bg-page)", display: "flex", gap: "8px", alignItems: "center",
        }}>
          <input
            type="file"
            id="fileUpload"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
                console.log("Selected file:", e.target.files[0]);
              }
            }}
          />
          <button
            onClick={() => document.getElementById("fileUpload")?.click()}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#e5e7eb",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
              +
            </button>
              
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Describe your legal matter..."
            style={{
              flex: 1, border: "1px solid var(--border-main)",
              borderRadius: "10px", padding: "10px 14px",
              fontSize: "13px", background: "var(--bg-input)",
              color: "var(--text-primary)", outline: "none",
              fontFamily: "inherit",
            }}
          />
          <button onClick={() => sendMessage()} disabled={loading} style={{
            width: "38px", height: "38px", borderRadius: "50%",
            background: loading ? "var(--cream-dark)" : "var(--olive-dark)",
            border: "none", cursor: loading ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
              stroke="#F5F0E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="13" x2="8" y2="3"/>
              <polyline points="4,7 8,3 12,7"/>
            </svg>
          </button>
        </div>
      )}
      {file && (
              <div style={{ fontSize: 12 }}>
                📎 {file.name}
              </div>
            )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
        @media (min-width: 480px) { .sm-show { display: block !important; } }
      `}</style>
    </div>
  );
}
