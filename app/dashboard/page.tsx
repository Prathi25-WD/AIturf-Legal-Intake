"use client";
import { useState, useEffect } from "react";
import React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
/*
  K.T. Dakappa & Associates — Staff Dashboard
  
  Design direction: "Warm utilitarian" — like a well-organized mahogany desk.
  This is for a senior advocate and 2-3 associates in a small Basavanagudi office.
  They open this at 5:15 PM before clients start arriving. They need:
  - What's happening today/this week
  - Which clients submitted intake briefs (from the bot)
  - Which deadlines are coming up
  - Quick access to case files
  
  NOT: flashy dashboards, dark mode, gradients. These are lawyers, not developers.
  Clean, warm, readable. Paper-like. Feels trustworthy.
*/

const PALETTE = {
  bg: "#FAF8F5",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F1EB",
  border: "#E8E0D4",
  borderDark: "#D4CAB8",
  accent: "#8B6914",
  accentLight: "#F7F0E0",
  accentDark: "#6B4F0E",
  teal: "#1A7A6D",
  tealLight: "#E8F5F2",
  rose: "#C4432B",
  roseLight: "#FDF0ED",
  blue: "#2E5E9E",
  blueLight: "#EFF4FB",
  text: "#2C2418",
  textMid: "#6B5D4D",
  textLight: "#9C8E7C",
  white: "#FFFFFF",
  green: "#3D7A45",
  greenLight: "#EDF7EF",
  amber: "#B8860B",
  amberLight: "#FFF8E7",
};

const shareItem = {
  fontSize: 12,
  padding: "8px 10px",
  borderRadius: 4,
  cursor: "pointer",
  background: "#fff",
  border: "1px solid #E8E0D4",
  color: "#2C2418",
  display: "flex",
  alignItems: "center",
  gap: 6,
  transition: "all 0.15s ease",
};
const iconCircle = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "#fff",
  border: "1px solid #E8E0D4",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 6px",
};

const iconLabel = {
  fontSize: 11,
  color: "#2C2418",
};
// ── Mock Data ──
const today = new Date();
const formatDate = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const formatTime = (h: number, m: number) => {
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;

  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

const intakeBriefs:Brief[]= [
  { id: "1", clientName: "Smt. Lakshmi Devi", phone: "98451 XXXXX", type: "Property — Title Dispute", urgency: "high", submittedAt: "3:42 PM", status: "new", summary: "Claims ownership of site in Banashankari based on registered sale deed (2019). Seller's son now claiming property based on an alleged will. Client has possession.", limitationStatus: "safe", limitationDate: "Mar 2028", court: "City Civil Court, Bangalore" },
  { id: "2", clientName: "Sri. Ramesh B.N.", phone: "99020 XXXXX", type: "Family — Succession", urgency: "medium", submittedAt: "1:15 PM", status: "new", summary: "Father expired 4 months ago without a will. 3 legal heirs (2 sons, 1 daughter). Assets: house in Jayanagar + 2 acres agricultural land in Mandya. Siblings disagree on division.", limitationStatus: "safe", limitationDate: "N/A — no strict limit", court: "City Civil Court, Bangalore" },
  { id: "3", clientName: "M/s. Priya Enterprises", phone: "80951 XXXXX", type: "Rent — Commercial Eviction", urgency: "high", submittedAt: "11:30 AM", status: "reviewed", summary: "Commercial tenant in Basavanagudi shop, rent unpaid for 8 months (₹35,000/month = ₹2.8L arrears). Written rent agreement exists. Tenant claims shop needs repairs.", limitationStatus: "safe", limitationDate: "Per Karnataka Rent Act", court: "Small Causes Court" },
  { id: "4", clientName: "Sri. Venkatesh K.", phone: "97310 XXXXX", type: "Documentation — Legal Opinion", urgency: "low", submittedAt: "Yesterday", status: "assigned", assignedTo: "Bhoomika", summary: "Wants legal opinion on agricultural land purchase in Kanakapura taluk. Needs RTC verification, EC check, and conversion feasibility assessment.", limitationStatus: "n/a", limitationDate: "N/A", court: "N/A" },
];

const upcomingDeadlines = [
  { case: "OS 1247/2023 — Nagaraj vs. Krishnappa", event: "Written Statement due", date: "2 Apr", daysLeft: 3, severity: "critical" },
  { case: "OS 892/2024 — Smt. Gowramma Partition", event: "Mediation session #2", date: "4 Apr", daysLeft: 5, severity: "warning" },
  { case: "OS 2103/2022 — Raju Title Suit", event: "Evidence filing deadline", date: "8 Apr", daysLeft: 9, severity: "normal" },
  { case: "MFA 445/2024 — Lakshman Appeal", event: "Appeal hearing (HC)", date: "10 Apr", daysLeft: 11, severity: "normal" },
  { case: "OS 1891/2023 — Shivanna Injunction", event: "Next hearing date", date: "12 Apr", daysLeft: 13, severity: "normal" },
  { case: "OS 567/2024 — Smt. Kamala Succession", event: "Commissioner report due", date: "15 Apr", daysLeft: 16, severity: "normal" },
];

const todayHearings = [
  { time: "10:30 AM", court: "City Civil Court, Court Hall 7", case: "OS 1247/2023", parties: "Nagaraj vs. Krishnappa", matter: "Arguments on IA for temporary injunction", status: "completed", outcome: "Adjourned to 15 Apr. Injunction continued." },
  { time: "11:15 AM", court: "City Civil Court, Court Hall 3", case: "OS 892/2024", parties: "Smt. Gowramma & Ors.", matter: "Mediation status report", status: "completed", outcome: "Mediation ongoing. Next session 4 Apr." },
  { time: "2:30 PM", court: "Small Causes Court", case: "SCC 234/2024", parties: "Prakash vs. Suresh (Tenant)", matter: "Eviction — Rent arrears", status: "completed", outcome: "Tenant sought 2 weeks to file reply. Granted." },
];

const activeCases = { total: 47, property: 22, family: 8, rent: 6, civil: 5, documentation: 4, other: 2 };

const teamMembers = [
  { name: "K.T. Dakappa", role: "Senior Advocate", activeCases: 47, todayTasks: 3 },
  { name: "Bhoomika Y.S.", role: "Legal Associate", activeCases: 12, todayTasks: 5 },
  { name: "Suresh M.", role: "Junior Associate", activeCases: 8, todayTasks: 4 },
];

// ── Components ──

type UrgencyLevel =
  | "critical"
  | "high"
  | "warning"
  | "medium"
  | "low"
  | "normal"
  | "n_a";

  type Brief = {
  id: string;
  clientName: string;
  phone:string;
  urgency: UrgencyLevel;   
  status: string;
  assignedTo?: string;
  submittedAt: string;
  type: string;
  summary:string;
  limitationStatus:string;
  limitationDate:React.ReactNode;
  court:string
};

type UrgencyDotProps = {
  level: UrgencyLevel;
};

const UrgencyDot = ({ level }: UrgencyDotProps) => {
  const colors: Record<UrgencyLevel, string> = {
    critical: PALETTE.rose,
    high: PALETTE.amber,
    warning: PALETTE.amber,
    medium: PALETTE.blue,
    low: PALETTE.teal,
    normal: PALETTE.textLight,
    n_a: PALETTE.textLight,
  };

  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: colors[level],
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
};
type BadgeProps = {
  children: React.ReactNode;
  color?: string;
  bg?: string;
};
const Badge = ({ children, color = PALETTE.accent, bg = PALETTE.accentLight }:BadgeProps) => (
  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 3, background: bg, color, letterSpacing: "0.02em" }}>{children}</span>
);
type Props = {
  icon: any;
  title: any;
  count?: any;
  action?: any;
  onAction?: () => void;   
};
const SectionHeader = ({ icon, title, count, action, onAction }:Props) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color: PALETTE.text, fontFamily: "'Libre Baskerville', Georgia, serif" }}>{title}</span>
      {count !== undefined && <span style={{ fontSize: 11, color: PALETTE.textLight, fontWeight: 500 }}>({count})</span>}
    </div>
    {action && <button onClick={onAction} style={{ fontSize: 11, color: PALETTE.accent, fontWeight: 600, background: "none", border: `1px solid ${PALETTE.border}`, padding: "4px 12px", borderRadius: 4, cursor: "pointer" }}>{action}</button>}
  </div>
);

type CardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const Card = ({ children, style = {} }: CardProps) => (
  <div
    style={{
      background: PALETTE.surface,
      border: `1px solid ${PALETTE.border}`,
      borderRadius: 8,
      padding: 16,
      ...style,
    }}
  >
    {children}
  </div>
);

// ── Main Views ──

function TodaySummary({ newCount }: { newCount: number }) {
  return (
    <Card style={{ borderLeft: `3px solid ${PALETTE.accent}`, marginBottom: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 20 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: PALETTE.textLight, letterSpacing: "0.08em", marginBottom: 4 }}>NEW INTAKE BRIEFS</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: PALETTE.accent, fontFamily: "'Libre Baskerville', serif" }}>{newCount}</div>
          <div style={{ fontSize: 11, color: PALETTE.textMid }}>awaiting review</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: PALETTE.textLight, letterSpacing: "0.08em", marginBottom: 4 }}>TODAY'S HEARINGS</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: PALETTE.teal, fontFamily: "'Libre Baskerville', serif" }}>3</div>
          <div style={{ fontSize: 11, color: PALETTE.textMid }}>all completed</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: PALETTE.textLight, letterSpacing: "0.08em", marginBottom: 4 }}>URGENT DEADLINES</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: PALETTE.rose, fontFamily: "'Libre Baskerville', serif" }}>1</div>
          <div style={{ fontSize: 11, color: PALETTE.rose }}>WS due in 3 days</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: PALETTE.textLight, letterSpacing: "0.08em", marginBottom: 4 }}>ACTIVE CASES</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: PALETTE.text, fontFamily: "'Libre Baskerville', serif" }}>47</div>
          <div style={{ fontSize: 11, color: PALETTE.textMid }}>across all types</div>
        </div>
      </div>
    </Card>
  );
}
function NewEntriesCard() {
  const [entries, setEntries] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from("intake_briefs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching entries:", error);
      } else {
        setEntries(data);
      }
    };

    fetchEntries();
  }, []);

  return (
      <div
    style={{
      maxHeight: 280,
      overflowY: "auto",
      fontFamily: "'Source Sans 3', system-ui, sans-serif",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    }}
  >
      <SectionHeader icon="🆕" title="New Enquires" count={entries.length} />

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {entries.map((entry) => (
          <Card key={entry.id}>
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                  style={{
                    fontSize: 14,          // slightly bigger
                    fontWeight: 600,
                    color: PALETTE.text,   // darker = clearer
                    flex: 1,
                  }}
                >
                {entry.client_name || "Unnamed Client"}
              </span>

              <button
                onClick={() => window.open(`/intake/${entry.id}`, "_blank")}
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 4,
                  border: `1px solid ${PALETTE.border}`,
                  background: PALETTE.white,
                  cursor: "pointer",
                }}
              >
                Open
              </button>
            </div>

            {/* Expanded */}
            {openId === entry.id && (
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: `1px solid ${PALETTE.border}`,
                }}
              >
                <div style={{ fontSize: 12 }}>
                  📞 {entry.contact_phone || "No phone"}
                </div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  📂 {entry.service_type}
                </div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  ⚖️ {entry.recommended_forum}
                </div>
                <div style={{ fontSize: 12, marginTop: 6 }}>
                  {entry.fact_summary}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function ManualEntryCard() {
  const isBrowser = typeof window !== "undefined";
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    client_name: "",
    contact_phone: "",
    service_type: "",
    fact_summary: "",
  });
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.client_name) {
      alert("Client name is required");
      return;
    }

    const { error } = await supabase.from("intake_briefs").insert([
      {
        ...form,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error saving");
    } else {
      alert("Saved successfully");
      setForm({
        client_name: "",
        contact_phone: "",
        service_type: "",
        fact_summary: "",
      });
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      
      {/* ✅ Header OUTSIDE card */}
      <SectionHeader icon="✍️" title="Add Client Manually" />
   <Card style={{ marginTop: 12 }}>

  {/* 🔘 Action Buttons */}
 <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
  
  {/* Share Link */}
<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>

  {/* ✅ ALWAYS VISIBLE BUTTON */}
  <button
    onClick={() => setShowShare(!showShare)}
    style={btnSecondary}
  >
    Share Consultation Link
  </button>

  {/* ✅ SHOW OPTIONS ONLY WHEN CLICKED */}
  {showShare && (
  <div
    style={{
      marginTop: 10,
      padding: 8,
      border: `1px solid ${PALETTE.border}`,
      borderRadius: 8,
      background: PALETTE.surfaceAlt,
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* Email */}
      <div
        onClick={() => {
          if (!isBrowser) return;
          window.location.href = `mailto:?subject=Legal Consultation&body=Please fill this form: ${window.location.origin}/landing`;
        }}
        style={{ cursor: "pointer" }}
      >
        <div style={iconCircle}>📧</div>
        <div style={iconLabel}>Share via Email</div>
      </div>

      {/* Copy */}
      <div
        onClick={() => {
          if (!isBrowser) return;

          navigator.clipboard.writeText(window.location.origin + "/landing");
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        style={{ cursor: "pointer" }}
      >
        <div style={iconCircle}>🔗</div>
        <div style={iconLabel}>
          {copied ? "Copied!" : "Copy Link"}
        </div>
      </div>

      {/* WhatsApp */}
      <div
        onClick={() => {
          if (!isBrowser) return;

          window.open(
            `https://wa.me/?text=${encodeURIComponent(window.location.origin + "/landing")}`
          );
        }}
        style={{ cursor: "pointer" }}
      >
        <div style={iconCircle}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            style={{ width: 18, height: 18 }}
          />
        </div>
        <div style={iconLabel}>WhatsApp</div>
      </div>
    </div>
  </div>
)}
</div>

  {/* Toggle Form */}
   <button
            onClick={() => window.open("/manual-entry", "_blank")}
            style={btnPrimary}
          >
            Fill Client Details
          </button>

</div>
</Card>
</div>
  );
}

const btnPrimary = {
  fontSize: 12,
  fontWeight: 600,
  padding: "6px 10px",
  borderRadius: 4,
  border: "none",
  background: "#8B6914",
  color: "#fff",
  cursor: "pointer",
};

const btnSecondary = {
  fontSize: 12,
  fontWeight: 600,
  padding: "6px 10px",
  borderRadius: 4,
  border: "none",
  background: "#8B6914",
  color:"#fff",
  cursor: "pointer",
};

const inputStyle = {
  fontSize: 12,
  padding: "6px 8px",
  borderRadius: 4,
  border: "1px solid #E8E0D4",
};


function IntakeBriefsList() {
 const [expandedId, setExpandedId] = useState<string | null>(null);
 const [briefs, setBriefs] = useState<any[]>([]);
 useEffect(() => {
  const fetchBriefs = async () => {
    const { data, error } = await supabase
      .from("intake_briefs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching briefs:", error);
    } else {
      setBriefs(data);
    }
  };

  fetchBriefs();
}, []);
  return (
    
    <div style={{ marginBottom: 20 }}>
      <SectionHeader icon="📋" title="Client Intake Briefs" count={intakeBriefs.filter(b => b.status === "new").length + " new"} action="Share bot link" onAction={() => window.open("/landing", "_blank")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {intakeBriefs.map((brief) => (
          <Card key={brief.id} style={{
            cursor: "pointer",
            borderLeft: brief.status === "new" ? `3px solid ${PALETTE.accent}` : brief.status === "reviewed" ? `3px solid ${PALETTE.teal}` : `3px solid ${PALETTE.border}`,
            background: brief.status === "new" ? PALETTE.accentLight : PALETTE.surface,
          }}>
            <div onClick={() => setExpandedId(expandedId === brief.id ? null : brief.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <UrgencyDot level={brief.urgency} />
                <span style={{ fontSize: 13, fontWeight: 600, color: PALETTE.text, flex: 1 }}>{brief.clientName}</span>
                {brief.status === "new" && <Badge>NEW</Badge>}
                {brief.status === "reviewed" && <Badge color={PALETTE.teal} bg={PALETTE.tealLight}>REVIEWED</Badge>}
                {brief.status === "assigned" && <Badge color={PALETTE.blue} bg={PALETTE.blueLight}>ASSIGNED → {brief.assignedTo}</Badge>}
                <span style={{ fontSize: 11, color: PALETTE.textLight }}>{brief.submittedAt}</span>
              </div>
              <div style={{ fontSize: 12, color: PALETTE.textMid, marginLeft: 18 }}>{brief.type}</div>
            </div>

            {expandedId === brief.id && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${PALETTE.border}` }}>
                <div style={{ fontSize: 12.5, color: PALETTE.text, lineHeight: 1.65, marginBottom: 12, background: PALETTE.surfaceAlt, padding: 12, borderRadius: 6 }}>
                  {brief.summary}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: PALETTE.textLight, marginBottom: 2 }}>LIMITATION</div>
                    <div style={{ fontSize: 12, color: brief.limitationStatus === "safe" ? PALETTE.green : PALETTE.rose, fontWeight: 600 }}>
                      {brief.limitationStatus === "safe" ? "✓ Safe" : brief.limitationStatus === "n/a" ? "—" : "⚠ Check"} — {brief.limitationDate}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: PALETTE.textLight, marginBottom: 2 }}>RECOMMENDED COURT</div>
                    <div style={{ fontSize: 12, color: PALETTE.text }}>{brief.court}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: PALETTE.textLight, marginBottom: 2 }}>CONTACT</div>
                    <div style={{ fontSize: 12, color: PALETTE.text }}>{brief.phone}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ fontSize: 11, fontWeight: 600, padding: "6px 14px", borderRadius: 4, border: "none", background: PALETTE.accent, color: PALETTE.white, cursor: "pointer" }}>Mark Reviewed</button>
                  <button style={{ fontSize: 11, fontWeight: 600, padding: "6px 14px", borderRadius: 4, border: `1px solid ${PALETTE.border}`, background: PALETTE.white, color: PALETTE.text, cursor: "pointer" }}>Assign to Associate</button>
                  <button style={{ fontSize: 11, fontWeight: 600, padding: "6px 14px", borderRadius: 4, border: `1px solid ${PALETTE.border}`, background: PALETTE.white, color: PALETTE.text, cursor: "pointer" }}>Download PDF</button>
                  <button style={{ fontSize: 11, fontWeight: 600, padding: "6px 14px", borderRadius: 4, border: `1px solid ${PALETTE.border}`, background: PALETTE.white, color: PALETTE.teal, cursor: "pointer" }}>Call Client</button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function DeadlinesPanel() {
  return (
    <div style={{ marginBottom: 20 }}>
      <SectionHeader icon="⏰" title="Upcoming Deadlines" count={upcomingDeadlines.length} action="View calendar" />
      <Card>
        {upcomingDeadlines.map((d, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "60px 1fr 180px 70px",
            alignItems: "center", gap: 10,
            padding: "10px 0",
            borderBottom: i < upcomingDeadlines.length - 1 ? `1px solid ${PALETTE.border}` : "none",
          }}>
            <div style={{
              fontSize: 12, fontWeight: 700, textAlign: "center", padding: "4px 8px", borderRadius: 4,
              background: d.severity === "critical" ? PALETTE.roseLight : d.severity === "warning" ? PALETTE.amberLight : PALETTE.surfaceAlt,
              color: d.severity === "critical" ? PALETTE.rose : d.severity === "warning" ? PALETTE.amber : PALETTE.textMid,
            }}>{d.date}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: PALETTE.text }}>{d.event}</div>
              <div style={{ fontSize: 11, color: PALETTE.textLight }}>{d.case}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {d.severity === "critical" && <Badge color={PALETTE.rose} bg={PALETTE.roseLight}>CRITICAL</Badge>}
              {d.severity === "warning" && <Badge color={PALETTE.amber} bg={PALETTE.amberLight}>SOON</Badge>}
            </div>
            <div style={{ fontSize: 11, color: d.daysLeft <= 3 ? PALETTE.rose : d.daysLeft <= 7 ? PALETTE.amber : PALETTE.textLight, fontWeight: 600, textAlign: "right" }}>
              {d.daysLeft}d left
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function TodayHearings() {
  return (
    <div style={{ marginBottom: 20 }}>
      <SectionHeader icon="⚖️" title="Today's Hearings" count={todayHearings.length} />
      <Card>
        {todayHearings.map((h, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: i < todayHearings.length - 1 ? `1px solid ${PALETTE.border}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: PALETTE.accent, fontFamily: "monospace", width: 70 }}>{h.time}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: PALETTE.text, flex: 1 }}>{h.parties}</span>
              <span style={{ fontSize: 11, color: PALETTE.textLight }}>{h.court}</span>
              <Badge color={PALETTE.green} bg={PALETTE.greenLight}>Done</Badge>
            </div>
            <div style={{ marginLeft: 80 }}>
              <div style={{ fontSize: 11.5, color: PALETTE.textMid, marginBottom: 2 }}>{h.matter}</div>
              <div style={{ fontSize: 12, color: PALETTE.teal, fontWeight: 500 }}>→ {h.outcome}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function CasePortfolioMini() {
  const types = [
    { label: "Property", count: activeCases.property, pct: Math.round(activeCases.property / activeCases.total * 100), color: PALETTE.accent },
    { label: "Family", count: activeCases.family, pct: Math.round(activeCases.family / activeCases.total * 100), color: PALETTE.teal },
    { label: "Rent", count: activeCases.rent, pct: Math.round(activeCases.rent / activeCases.total * 100), color: PALETTE.blue },
    { label: "Civil", count: activeCases.civil, pct: Math.round(activeCases.civil / activeCases.total * 100), color: PALETTE.amber },
    { label: "Documentation", count: activeCases.documentation, pct: Math.round(activeCases.documentation / activeCases.total * 100), color: PALETTE.green },
    { label: "Other", count: activeCases.other, pct: Math.round(activeCases.other / activeCases.total * 100), color: PALETTE.textLight },
  ];

  return (
    <Card>
      <SectionHeader icon="📂" title="Case Portfolio" count={activeCases.total + " active"} action="View all cases" />
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
        {types.map((t, i) => <div key={i} style={{ width: `${t.pct}%`, background: t.color }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {types.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: t.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: PALETTE.textMid }}>{t.label}</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: PALETTE.text, marginLeft: "auto" }}>{t.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TeamPanel() {
  return (
    <Card style={{ marginTop: 12 }}>
      <SectionHeader icon="👥" title="Team" />
      {teamMembers.map((m, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 0", borderBottom: i < teamMembers.length - 1 ? `1px solid ${PALETTE.border}` : "none"
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: i === 0 ? PALETTE.accentLight : PALETTE.surfaceAlt,
            color: i === 0 ? PALETTE.accent : PALETTE.textMid,
            fontSize: 12, fontWeight: 700,
          }}>{m.name.split(' ').map(n => n[0]).join('')}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: PALETTE.text }}>{m.name}</div>
            <div style={{ fontSize: 10.5, color: PALETTE.textLight }}>{m.role}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: PALETTE.textMid }}>{m.activeCases} cases</div>
            <div style={{ fontSize: 10.5, color: PALETTE.textLight }}>{m.todayTasks} tasks today</div>
          </div>
        </div>
      ))}
    </Card>
  );
}

// ── Main App ──
export default function App() {
  const [entries, setEntries] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
      useEffect(() => {
      setMounted(true);
    }, []);
const [currentTime, setCurrentTime] = useState<Date | null>(null);
  useEffect(() => {
  setCurrentTime(new Date()); // set once after mount

  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 60000);

  return () => clearInterval(timer);
}, []);

  useEffect(() => {
  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("intake_briefs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching entries:", error);
    } else {
      setEntries(data);
    }
  };

  fetchEntries();
}, []);

  return (
    <div style={{ background: PALETTE.bg, minHeight: "100vh", fontFamily: "'Source Sans 3', 'Noto Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── Top Bar ── */}
      <div style={{
        background: PALETTE.white, borderBottom: `1px solid ${PALETTE.border}`,
        padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            paddingRight: 14, borderRight: `1px solid ${PALETTE.border}`,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: `linear-gradient(135deg, ${PALETTE.accent}, ${PALETTE.accentDark})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: PALETTE.white, fontSize: 11, fontWeight: 800,
            }}>AT</div>
            <span style={{ fontSize: 11, fontWeight: 600, color: PALETTE.textLight }}>powered by AITurf</span>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: PALETTE.text, fontFamily: "'Libre Baskerville', Georgia, serif" }}>
              K.T. Dakappa & Associates
            </div>
            <div style={{ fontSize: 11, color: PALETTE.textLight }}>Advocates & Legal Consultants, Basavanagudi, Bangalore</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
           <div style={{ fontSize: 12, fontWeight: 600, color: PALETTE.text }}>
              {currentTime &&
                currentTime.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
            </div>

            <div style={{ fontSize: 11, color: PALETTE.textLight }}>
              {currentTime &&
                currentTime.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}

              {currentTime &&
                (currentTime.getHours() >= 17 && currentTime.getHours() < 21
                  ? " — Office hours"
                  : " — Court hours")}
            </div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: PALETTE.accentLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: PALETTE.accent, fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>KD</div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
        
        {/* Summary Strip */}
        <TodaySummary newCount={entries.length} />

        {/* Two Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          
          {/* Left Column — Main Content */}
          <div>
            {/* Top row → side by side */}
           
            <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "0.9fr 1.1fr",
                  gap: 16,
                  alignItems: "start",
                  marginBottom: 20,
                }}
              >
                {/* LEFT SIDE */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <NewEntriesCard />
                  <ManualEntryCard />   {/* 👈 BELOW New Entries */}
                </div>

                {/* RIGHT SIDE */}
                <IntakeBriefsList />
              </div>

            {/* Rest below */}
            <DeadlinesPanel />
            <TodayHearings />
          </div>

          {/* Right Column — Sidebar */}
          <div>
            <CasePortfolioMini />
            <TeamPanel />

            {/* Quick Actions */}
            <Card style={{ marginTop: 12 }}>
              <SectionHeader icon="⚡" title="Quick Actions" />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                    
                  { label: "Share intake bot link", desc: "Send to new client via WhatsApp", icon: "📱" },
                  { label: "Check eCourts status", desc: "Pull latest case updates", icon: "🔍" },
                  { label: "Draft legal notice", desc: "AI-assisted notice generation", icon: "📝" },
                  { label: "Compute stamp duty", desc: "Karnataka rates calculator", icon: "💰" },
                  { label: "Search case law", desc: "Karnataka HC precedent finder", icon: "📚" },
                ].map((a, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                    borderRadius: 6, cursor: "pointer", border: `1px solid transparent`,
                    transition: "background 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = PALETTE.surfaceAlt; e.currentTarget.style.borderColor = PALETTE.border; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
                  >
                    <span style={{ fontSize: 16 }}>{a.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: PALETTE.text }}>{a.label}</div>
                      <div style={{ fontSize: 10.5, color: PALETTE.textLight }}>{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Office Info */}
            <div style={{
              marginTop: 12, padding: 14, borderRadius: 8,
              background: PALETTE.surfaceAlt, border: `1px solid ${PALETTE.border}`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: PALETTE.textLight, letterSpacing: "0.08em", marginBottom: 6 }}>OFFICE</div>
              <div style={{ fontSize: 11.5, color: PALETTE.textMid, lineHeight: 1.6 }}>
                No. 64/1, 1st Floor, S M Plaza<br />
                DVG Road, Basavanagudi<br />
                Bangalore - 560004<br />
                <span style={{ color: PALETTE.accent, fontWeight: 600 }}>Mon–Sat, 5:30–9:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
