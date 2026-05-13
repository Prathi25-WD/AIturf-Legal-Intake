"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// ── TYPES ──
 
type UrgencyLevel = "critical" | "high" | "medium" | "low" | "normal" | "warning" | "n_a";
 
type IntakeBrief = {
  id: string;
  client_name: string;
  contact_phone: string;
  service_type: string;
  fact_summary: string;
  recommended_forum: string;
  created_at: string;
  status?: string;
  source?:string;
};
 
type ManualClientForm = {
  client_name: string;
  contact_phone: string;
  service_type: string;
  recommended_forum: string,
  fact_summary: string;
};
 
type NavItem = {
  key: string;
  label: string;
  icon: string;
  badge?: number;
};

async function generateClientId(): Promise<string> {
  const { data, error } = await supabase
    .from("intake_briefs")
    .select("client_id")
    .not("client_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return "CLT-001";

  const last = data[0].client_id as string; // e.g. "CLT-047"
  const num = parseInt(last.replace("CLT-", ""), 10);
  return `CLT-${String(num + 1).padStart(3, "0")}`;
}
// ── COLOR PALETTE (matches the HTML dashboard exactly) ──
const P = {
  bg:      "#f5f2ed",   // warm cream background
  s1:      "#ffffff",   // white — cards and sidebar
  s2:      "#faf8f5",   // very light cream — hover states
  s3:      "#f0ece4",   // slightly darker cream — deep hover
  border:  "#e2ddd4",   // warm gray border
  borderD: "#ccc6ba",   // darker border for hover
  accent:  "#2d6a4f",   // dark green — primary color
  accentL: "rgba(45,106,79,0.10)",   // green tint for backgrounds
  accentM: "rgba(45,106,79,0.18)",   // medium green tint
  gold:    "#8b6914",   // gold — secondary color
  goldL:   "rgba(139,105,20,0.10)",  // gold tint
  rose:    "#a63232",   // red — warnings and critical
  roseL:   "rgba(166,50,50,0.10)",   // red tint
  blue:    "#1e4d8c",   // blue — info color
  blueL:   "rgba(30,77,140,0.10)",   // blue tint
  teal:    "#1a6470",   // teal — secondary info
  tealL:   "rgba(26,100,112,0.10)",  // teal tint
  text:    "#2c2417",   // near-black — main text
  muted:   "#6b5e4a",   // medium brown — secondary text
  dim:     "#a0917c",   // light brown — labels and captions
  ink:     "#1a1208",   // darkest — headings
};

// ── MOCK DATA (from the HTML dashboard) ──
 
const INTAKES = [
  { id:"INT-041", name:"Suresh Gowda", phone:"9845012345",
    type:"PROPERTY_TITLE", tc:"#2d6a4f",
    subtype:"Ownership dispute — sale deed challenge",
    urgency:"high", uc:"#a63232", deadline:"2026-06-12", dl:56,
    status:"new", court:"City Civil Court", lim:"safe",
    summary:"Client's father purchased a plot in Jakkasandra in 1998. A neighbour now challenges the title via a disputed gift deed from 1992. Client has original sale deed and encumbrance certificate.",
    laws:["Transfer of Property Act, S.54","Specific Relief Act, S.38","Karnataka Land Revenue Act, S.133"],
    questions:["Is the gift deed registered?","Any prior litigation on this survey number?","Is property in client's physical possession?"],
    time:"Today, 8:14 AM" },
  { id:"INT-040", name:"Meena Reddy", phone:"9741123456",
    type:"CHEQUE_BOUNCE", tc:"#a63232",
    subtype:"Dishonour — business loan repayment",
    urgency:"critical", uc:"#a63232", deadline:"2026-04-28", dl:11,
    status:"new", court:"JMFC / Magistrate Court", lim:"warning",
    summary:"Cheque of Rs.4.2L issued as loan repayment was dishonoured on Feb 28. Legal notice sent via RPAD on March 14. 15-day notice period has elapsed. Complaint under S.138 must be filed by April 28.",
    laws:["Negotiable Instruments Act, S.138","NI Act, S.142","CrPC S.200"],
    questions:["Has RPAD acknowledgement been received?","Was the cheque for a legally enforceable debt?","Any part payments after dishonour?"],
    time:"Yesterday, 6:31 PM" },
  { id:"INT-039", name:"Rajappa H.K.", phone:"9632014578",
    type:"RENT_TENANCY", tc:"#1a6470",
    subtype:"Commercial eviction — rent arrears",
    urgency:"medium", uc:"#1a6470", deadline:"2026-07-30", dl:104,
    status:"reviewed", court:"Small Causes Court", lim:"safe",
    summary:"Commercial tenant in Jayanagar has not paid rent for 8 months (Rs.18,000/month). No written agreement — oral tenancy for 6 years. Client wants eviction and recovery of Rs.1.44L arrears.",
    laws:["Karnataka Rent Act, 1999","Transfer of Property Act, S.106"],
    questions:["Any rent receipts issued?","Any written communication about arrears?"],
    time:"Apr 15, 3:12 PM" },
  { id:"INT-038", name:"Vidya Srinivas", phone:"9880056789",
    type:"FAMILY_SUCCESSION", tc:"#1e4d8c",
    subtype:"Intestate succession — ancestral property",
    urgency:"medium", uc:"#1a6470", deadline:"2026-09-18", dl:154,
    status:"reviewed", court:"City Civil Court / Family Court", lim:"safe",
    summary:"Father died intestate in 2019. Property in Bangalore (est. Rs.85L) and agricultural land in Tumkur. Three siblings, one refuses partition. No will. Client is eldest daughter.",
    laws:["Hindu Succession Act, S.6","Partition Act, S.2"],
    questions:["Death certificate obtained?","Agricultural land in whose name on Pahani?"],
    time:"Apr 14, 11:05 AM" },
  { id:"INT-037", name:"Prakash B.", phone:"9743210987",
    type:"RERA_BUILDER", tc:"#8b6914",
    subtype:"Possession delay — flat not delivered",
    urgency:"high", uc:"#8b6914", deadline:"2026-05-20", dl:33,
    status:"converted", court:"Karnataka RERA", lim:"warning",
    summary:"Flat booked in 2020, possession promised Dec 2023. Builder citing COVID delays. Still not delivered. Agreement value Rs.62L. No OC obtained.",
    laws:["RERA Act, S.18","Karnataka RERA Regulations"],
    questions:["RERA registration number of project?","Any extension agreement signed?"],
    time:"Apr 13, 9:45 AM" },
];
 // ── MOCK CASE (temporary) ──
const CASES = [
  { id:"CS-2024-089", client:"LEENA MADAN K", type:"PROPERTY_TITLE", tc:"#2d6a4f",
    cnr: "KABC010051322015",stage:"Decree", sc:P.accent, next:"Apr 22, 2026",
    court:"City Civil Court", judge:"A.V. Nataraj, J.", suit:"OS 1950/2015",
    status:"won", value:"Rs.42L", docs:14,
    last:"Case closed. Decree passed — City Civil Court.",
     party_designation:    "Plaintiff",           // Plaintiff/Petitioner/Defendant
    opposite_party:       "Narayan S.A.",
    opposite_designation: "Defendant",           // Defendant/Respondent/Accused
    client_address:       "No. 12, 3rd Cross, Basavanagudi, Bengaluru - 560004",
    client_id_type:       "Aadhaar",
    advocate:             "M.A. Fayaz Ahammed",
    advocate_roll:        "KAR/1234/2015",
    advocate_address:     "No. 45, Court Road, Bengaluru - 560001. Ph: 98451XXXXX",
    filing_date:          "2026-02-10",
    opposite_party2:      "",                    // second defendant if any
    advocate2:            "",                    // junior advocate if any
    advocate2_roll:       "",
    tl:[{d:"Apr 12, 2026",e:"Written statement received from defendant"},
        {d:"Mar 28, 2026",e:"Summons served to defendant"},
        {d:"Feb 10, 2026",e:"Plaint filed — admitted by City Civil Court"}] },
  { id:"CS-2024-076", client:"Lakshmi Devi", type:"FAMILY_SUCCESSION",cnr: "KABC010051322016", tc:"#1e4d8c",
    stage:"Mediation", sc:"#1a6470", next:"Apr 29, 2026",
    court:"Family Court", judge:"Sunita Rao, J.", suit:"HMP 78/2024",
    status:"active", value:"Rs.1.1Cr", docs:9,
    last:"Mediation notice issued Mar 28. Session 2 scheduled.",
     party_designation:    "Plaintiff",           // Plaintiff/Petitioner/Defendant
    opposite_party:       "Narayan S.A.",
    opposite_designation: "Defendant",           // Defendant/Respondent/Accused
    client_address:       "No. 12, 3rd Cross, Basavanagudi, Bengaluru - 560004",
    client_id_type:       "Aadhaar",
    advocate:             "M.A. Fayaz Ahammed",
    advocate_roll:        "KAR/1234/2015",
    advocate_address:     "No. 45, Court Road, Bengaluru - 560001. Ph: 98451XXXXX",
    filing_date:          "2026-02-10",
    opposite_party2:      "",                    // second defendant if any
    advocate2:            "",                    // junior advocate if any
    advocate2_roll:       "",
    tl:[{d:"Mar 28, 2026",e:"Mediation session 1 — partial progress"},
        {d:"Jan 22, 2026",e:"OS filed — partition suit admitted"}] },
  { id:"CS-2025-012", client:"Mohan Rao", type:"CHEQUE_BOUNCE",cnr: "KABC010051322017", tc:"#a63232",
    stage:"Arguments", sc:"#8b6914", next:"May 6, 2026",
    court:"JMFC Court 14", judge:"Ravi Kumar, MM.", suit:"CC 234/2025",
    status:"active", value:"Rs.8.5L", docs:6,
    last:"Cross-examination completed Apr 10. Written arguments due May 6.",
     party_designation:    "Plaintiff",           // Plaintiff/Petitioner/Defendant
    opposite_party:       "Narayan S.A.",
    opposite_designation: "Defendant",           // Defendant/Respondent/Accused
    client_address:       "No. 12, 3rd Cross, Basavanagudi, Bengaluru - 560004",
    client_id_type:       "Aadhaar",
    advocate:             "M.A. Fayaz Ahammed",
    advocate_roll:        "KAR/1234/2015",
    advocate_address:     "No. 45, Court Road, Bengaluru - 560001. Ph: 98451XXXXX",
    filing_date:          "2026-02-10",
    opposite_party2:      "",                    // second defendant if any
    advocate2:            "",                    // junior advocate if any
    advocate2_roll:       "",
    tl:[{d:"Apr 10, 2026",e:"Cross-examination of complainant completed"},
        {d:"Jan 8, 2025",e:"Complaint filed under NI Act S.138"}] },
  { id:"CS-2023-145", client:"Sujatha K.", type:"CIVIL_INJUNCTION",cnr: "KABC010051322018", tc:"#8b6914",
    stage:"Decree", sc:"#2d6a4f", next:null,
    court:"City Civil Court", judge:"B.M. Patil, J.", suit:"OS 445/2023",
    status:"won", value:"Rs.28L", docs:22,
    last:"Decree passed Apr 3. Permanent injunction granted.",
     party_designation:    "Plaintiff",           // Plaintiff/Petitioner/Defendant
    opposite_party:       "Narayan S.A.",
    opposite_designation: "Defendant",           // Defendant/Respondent/Accused
    client_address:       "No. 12, 3rd Cross, Basavanagudi, Bengaluru - 560004",
    client_id_type:       "Aadhaar",
    advocate:             "M.A. Fayaz Ahammed",
    advocate_roll:        "KAR/1234/2015",
    advocate_address:     "No. 45, Court Road, Bengaluru - 560001. Ph: 98451XXXXX",
    filing_date:          "2026-02-10",
    opposite_party2:      "",                    // second defendant if any
    advocate2:            "",                    // junior advocate if any
    advocate2_roll:       "",
    tl:[{d:"Apr 3, 2026",e:"Decree passed — permanent injunction granted"},
        {d:"Nov 5, 2023",e:"Suit filed — interim injunction granted ex-parte"}] },
  { id:"CS-2025-031", client:"Ibrahim Khan", type:"RENT_TENANCY", cnr: "KABC010051322019",tc:"#1a6470",
    stage:"Filing", sc:"#1e4d8c", next:"Apr 25, 2026",
    court:"Small Causes Court", judge:"TBD", suit:"RCP 12/2025",
    status:"active", value:"Rs.1.4L", docs:3,
    last:"Plaint filed Apr 12. First date Apr 25.",
     party_designation:    "Plaintiff",           // Plaintiff/Petitioner/Defendant
    opposite_party:       "Narayan S.A.",
    opposite_designation: "Defendant",           // Defendant/Respondent/Accused
    client_address:       "No. 12, 3rd Cross, Basavanagudi, Bengaluru - 560004",
    client_id_type:       "Aadhaar",
    advocate:             "M.A. Fayaz Ahammed",
    advocate_roll:        "KAR/1234/2015",
    advocate_address:     "No. 45, Court Road, Bengaluru - 560001. Ph: 98451XXXXX",
    filing_date:          "2026-02-10",
    opposite_party2:      "",                    // second defendant if any
    advocate2:            "",                    // junior advocate if any
    advocate2_roll:       "",
    tl:[{d:"Apr 12, 2026",e:"Plaint filed — admitted. First date issued."}] },
];
 
const DEADLINES = [
  {caseId:"CS-2024-089",client:"Anand Murthy",task:"File Rejoinder to Written Statement",due:"2026-04-20",days:3,type:"filing",uc:"#a63232",cal:true},
  {caseId:"INT-040",client:"Meena Reddy",task:"File NI Act S.138 Complaint",due:"2026-04-28",days:11,type:"limitation",uc:"#a63232",cal:true},
  {caseId:"CS-2025-031",client:"Ibrahim Khan",task:"First Hearing — appear for admission",due:"2026-04-25",days:8,type:"hearing",uc:"#8b6914",cal:true},
  {caseId:"CS-2024-076",client:"Lakshmi Devi",task:"Mediation Session 2",due:"2026-04-29",days:12,type:"hearing",uc:"#8b6914",cal:false},
  {caseId:"CS-2025-012",client:"Mohan Rao",task:"Submit Written Arguments",due:"2026-05-06",days:19,type:"filing",uc:"#1a6470",cal:false},
  {caseId:"INT-037",client:"Prakash B.",task:"RERA Complaint Window Closes",due:"2026-05-20",days:33,type:"limitation",uc:"#2d6a4f",cal:true},
];

// ── COLOR HELPERS ──
 
const typeColor = (t: string): string => ({
  PROPERTY_TITLE:        P.accent,
  CHEQUE_BOUNCE:         P.rose,
  RENT_TENANCY:          P.teal,
  FAMILY_SUCCESSION:     P.blue,
  RERA_BUILDER:          P.gold,
  PROPERTY_ENCROACHMENT: P.gold,
  CIVIL_INJUNCTION:      P.gold,
  CIVIL_CONTRACT:        P.teal,
} as Record<string,string>)[t] || P.muted;
 
const urgColor = (u: string): string => ({
  critical: P.rose,
  high:     P.gold,
  medium:   P.teal,
  low:      P.dim,
} as Record<string,string>)[u] || P.dim;
 
const stageColor = (s: string): string => ({
  Evidence:    P.blue,
  Mediation:   P.teal,
  Arguments:   P.gold,
  Decree:      P.accent,
  Filing:      P.blue,
  "Cross-Exam": P.rose,
} as Record<string,string>)[s] || P.dim;

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 9.5, fontWeight: 700, padding: "2px 8px",
      borderRadius: 20, background: color + "18", color,
      border: "1px solid " + color + "35",
      letterSpacing: "0.04em", whiteSpace: "nowrap" as const,
      display: "inline-flex", alignItems: "center",
    }}>{label}</span>
  );
}
 
function Card({ children, style = {}, onClick, accentColor }:
  { children: React.ReactNode; style?: React.CSSProperties;
    onClick?: () => void; accentColor?: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov && onClick ? P.s2 : P.s1,
        border: "1px solid " + (hov && onClick ? P.borderD : P.border),
        borderLeft: accentColor ? "3px solid " + accentColor : undefined,
        borderRadius: accentColor ? "0 10px 10px 0" : 10,
        padding: "14px 16px",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.12s ease",
        ...style,
      }}>{children}</div>
  );
}
 
function StatBox({ label, value, color, sub, onClick }:
  { label: string; value: string; color: string;
    sub?: string; onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov && onClick ? P.s2 : P.s1,
        border: "1px solid " + (hov && onClick ? P.borderD : P.border),
        borderRadius: 10, padding: "16px 18px",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.12s ease",
      }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: P.dim,
        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Lora', Georgia, serif",
        fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: P.muted, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}
 
function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ margin: 0, fontFamily: "'Lora', Georgia, serif",
        fontSize: 21, fontWeight: 700, color: P.ink, letterSpacing: "-0.01em" }}>
        {children}
      </h2>
      {sub && <p style={{ margin: "3px 0 0", fontSize: 12, color: P.dim }}>{sub}</p>}
    </div>
  );
}
 
function Row({ label, value, valueColor }:
  { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between",
      alignItems: "center", padding: "5px 0",
      borderBottom: "1px solid " + P.border, fontSize: 11.5 }}>
      <span style={{ color: P.dim }}>{label}</span>
      <span style={{ color: valueColor || P.text, fontWeight: 600 }}>{value}</span>
    </div>
  );
}
 
function SecLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 9.5, fontWeight: 700, color: P.dim,
      letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </div>
  );
}
 
function BackLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 11.5, color: P.accent, background: "none",
      border: "none", cursor: "pointer", padding: "0 0 16px",
      display: "block", fontFamily: "inherit",
    }}>{children}</button>
  );
}

// ── OVERVIEW SCREEN ──
 
function Overview({ nav, entries }: {
  nav: (s: string, d?: any) => void;
  entries: IntakeBrief[];
}) {
  return (
    <div>
      <SectionTitle sub={new Date().toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      }) + " — Aadya Law"}>
        Today at a Glance
      </SectionTitle>
 
      {/* ── 4 Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        gap: 12, marginBottom: 20 }}>
        <StatBox label="New Intakes"
          value={String(entries.length || 2)}
          color={P.accent} sub="Tap to review briefs"
          onClick={() => nav("enquiries")} />
        <StatBox label="Upcoming Hearings"
          value="3" color={P.teal} sub="Next: Apr 22 — OS 1241"
          onClick={() => nav("calendar")} />
        <StatBox label="Critical Deadlines"
          value="2" color={P.rose} sub="Action required now"
          onClick={() => nav("deadlines")} />
        <StatBox label="Active Cases"
          value="47" color={P.blue} sub="5 hearings this month"
          onClick={() => nav("cases")} />
      </div>
 
      {/* ── Two columns: Recent Intakes + Urgent Deadlines ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr",
        gap: 16, marginBottom: 16 }}>
 
        <div>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: P.text }}>
              📋 Recent Intakes
            </span>
            <button onClick={() => nav("intake")} style={{
              fontSize: 11, color: P.accent, background: "none",
              border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit",
            }}>View all →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {INTAKES.slice(0, 3).map(i => (
              <Card key={i.id} onClick={() => nav("intake-detail", i)}
                accentColor={i.tc}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: P.ink }}>
                      {i.name}
                    </div>
                    <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>
                      {i.subtype}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                    <Pill label={i.urgency.toUpperCase()} color={i.uc} />
                    {i.status === "new" && <Pill label="NEW" color={P.accent} />}
                  </div>
                </div>
                <div style={{ fontSize: 10.5, color: P.dim, marginTop: 6 }}>
                  {i.time} · {i.court}
                </div>
              </Card>
            ))}
          </div>
        </div>
 
        <div>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: P.text }}>
              ⏰ Urgent Deadlines
            </span>
            <button onClick={() => nav("deadlines")} style={{
              fontSize: 11, color: P.accent, background: "none",
              border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit",
            }}>View all →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DEADLINES.filter(d => d.days <= 14).map((d, i) => (
              <Card key={i} accentColor={d.uc}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: P.ink }}>
                  {d.task}
                </div>
                <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>
                  {d.client} · {d.caseId}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between",
                  marginTop: 9, alignItems: "center" }}>
                  <Pill label={d.days + " DAYS LEFT"} color={d.uc} />
                  {d.cal && <span style={{ fontSize: 10, color: P.accent, fontWeight: 600 }}>
                    📅 Synced
                  </span>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
 
      {/* ── Quick Actions ── */}
      <Card>
        <SecLabel>Quick Actions</SecLabel>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
          {[
            { label: "Share Intake Bot Link", icon: "🔗", sc: "add-client" },
            { label: "Add Case Manually",     icon: "➕", sc: "add-client" },
            { label: "Draft Legal Notice",    icon: "📝", sc: "ai-drafts" },
            { label: "Check eCourts Status",  icon: "🔍", sc: "tools" },
            { label: "Compute Stamp Duty",    icon: "🧮", sc: "tools" },
            { label: "Upload Document",       icon: "📎", sc: "documents" },
          ].map((a, i) => (
            <button key={i} onClick={() => nav(a.sc)} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 14px", background: P.s2,
              border: "1px solid " + P.border, borderRadius: 8,
              color: P.muted, fontSize: 12, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.12s",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = P.accent;
                e.currentTarget.style.color = P.accent;
                e.currentTarget.style.background = P.accentL;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = P.border;
                e.currentTarget.style.color = P.muted;
                e.currentTarget.style.background = P.s2;
              }}
            ><span>{a.icon}</span> {a.label}</button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── NEW ENQUIRIES SCREEN (Supabase-connected) ──
 
function NewEnquiries({ nav }: { nav: (s: string, d?: any) => void }) {
  const [entries, setEntries] = useState<IntakeBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
 
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("intake_briefs")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setEntries(data as IntakeBrief[]);
      setLoading(false);
    }
    load();
  }, []);
 
  
const filtered = filter === 'all'
  ? entries
  : filter === 'new'
    ? entries.filter(e => !e.status || e.status === 'new')
    : ['whatsapp', 'web_chat', 'manual'].includes(filter)
      ? entries.filter(e => e.source === filter)
      : entries.filter(e => e.status === filter);
 
  const newCount = entries.filter(e => !e.status || e.status === "new")
 
  function fmt(iso: string) {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
    });
  }
  const newenquiresnum = entries.filter(e => !e.status || e.status === "new").length
 
  return (
    <div>
      <SectionTitle sub={newenquiresnum + " new briefs awaiting review"}>
        New Enquiries
      </SectionTitle>
 
      {/* Filter buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "new", "reviewed", "web_chat", "whatsapp", "manual"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 14px", borderRadius: 20,
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            background: filter === f ? P.accent : P.s1,
            color: filter === f ? "#fff" : P.muted,
            border: "1px solid " + (filter === f ? P.accent : P.border),
            fontFamily: "inherit",
          }}>
            {f === "web_chat" ? "WEB CHAT" : f === "whatsapp" ? "WHATSAPP" : f.toUpperCase()}
          </button>
        ))}
      </div>
 
      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: P.dim, fontSize: 13 }}>
          Loading enquiries...
        </div>
      )}
 
      {!loading && filtered.length === 0 && (
        <Card>
          <div style={{ textAlign: "center", padding: 24, color: P.dim, fontSize: 13 }}>
            No enquiries found.
          </div>
        </Card>
      )}
 
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(e => {
          const isNew = !e.status || e.status === "new";
          const isOpen = expandedId === e.id;
          return (
            <Card key={e.id} accentColor={isNew ? P.accent : P.border}
              >
 
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center",
                    flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: P.ink }}>
                      {e.client_name || "Unnamed Client"}
                    </span>

                      {/* Status badges */}
                      {(!e.status || e.status === 'new') && <Pill label="NEW" color={P.accent} />}
                      {e.status === 'reviewed'           && <Pill label="REVIEWED" color={P.teal} />}
                      {e.status === 'closed'             && <Pill label="CLOSED" color={P.dim} />}

                      {/* Source badges */}
                      {e.source === 'whatsapp'     && <Pill label="WHATSAPP" color="#1565C0" />}
                      {e.source === 'web_chat'     && <Pill label="WEB CHAT" color="#2E7D32" />}
                      {e.source === 'manual'       && <Pill label="MANUAL" color="#E65100" />}
                                          
                  </div>
                  <div style={{ fontSize: 12, color: P.muted }}>
                    {e.service_type || "General Enquiry"}
                  </div>
                  <div style={{ fontSize: 10.5, color: P.dim, marginTop: 3 }}>
                    {fmt(e.created_at)} · {e.contact_phone || "No phone"}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ fontSize: 11, color: P.dim }}>
                    {e.recommended_forum || "—"}
                  </div>
                  <Link href={`/intake/${e.id}`}>
                    <button
                      onClick={ev => ev.stopPropagation()}
                      style={{
                        fontSize: 11,
                        color: P.accent,
                        background: "none",
                        border: "1px solid " + P.border,
                        padding: "3px 10px",
                        borderRadius: 4,
                        cursor: "pointer",
                        marginTop: 4,
                        fontFamily: "inherit"
                      }}
                    >
                      Open →
                    </button>
                  </Link>
                </div>
              </div>
 
              
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── ADD CLIENT MANUALLY SCREEN ──
 
function AddClient() {
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [form, setForm] = useState<ManualClientForm>({
    client_name: "",
    contact_phone: "",
    service_type: "",
    recommended_forum: "", 
    fact_summary: "",
  });
 
  function set(field: keyof ManualClientForm, val: string) {
    setForm(prev => ({ ...prev, [field]: val }));
  }
 
  function showStatus(text: string, ok: boolean) {
    setStatusMsg({ text, ok });
    setTimeout(() => setStatusMsg(null), 3000);
  }
 
  async function save() {
  if (!form.client_name.trim()) {
    showStatus("Client name is required.", false);
    return;
  }
  setSaving(true);
  try {
    // 1. Generate client ID
    const clientId = await generateClientId();

    // 2. Insert the client record
    const { data: inserted, error } = await supabase
      .from("intake_briefs")
      .insert([{
        client_id:     clientId,
        client_name:   form.client_name.trim(),
        contact_phone: form.contact_phone.trim(),
        service_type:  form.service_type,
        recommended_forum: form.recommended_forum,
        fact_summary:  form.fact_summary.trim(),
        status:        "new",
        source:        "manual",
        created_at:    new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    // 3. Upload each document to Supabase Storage
    for (const file of docs) {
      const ext      = file.name.split(".").pop();
      const filePath = `${clientId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue; // skip this file but don't stop
      }

      // 4. Get public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // 5. Save document record to DB
      // 5. Save document record to DB
      console.log("DOCS TO UPLOAD:", docs.length, docs);
      showStatus(`Saving... ${docs.length} file(s) to upload`, true);

      await supabase.from("documents").insert([{
        client_id:   clientId,
        client_name: form.client_name.trim(),
        doc_type:    "CHEQUE",        // ← hardcoded for this test
        file_name:   file.name,
        file_url:    urlData.publicUrl,
        intake_id:   inserted.id,
        verified:    false,
        ai_parsed:   false,
        created_at:  new Date().toISOString(),
      }]);
    }

    showStatus(`Client saved! ID: ${clientId}`, true);
    setForm({
      client_name: "", contact_phone: "",
      service_type: "", recommended_forum: "", fact_summary: "",
    });
    setDocs([]);

  } catch (err) {
    console.error(err);
    showStatus("Error saving. Check console (F12).", false);
  } finally {
    setSaving(false);
  }
}
 
  const inputStyle: React.CSSProperties = {
    width: "100%", fontSize: 12, padding: "8px 11px",
    borderRadius: 7, border: "1px solid " + P.border,
    background: P.s2, color: P.text, outline: "none",
    fontFamily: "inherit", transition: "border-color 0.1s",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 10, color: P.dim, marginBottom: 4, display: "block",
    textTransform: "uppercase", letterSpacing: "0.07em",
  };
  const [docs, setDocs] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  
 
  return (
    <div style={{ maxWidth: 680 }}>
      <SectionTitle sub="Save a client record directly — no bot needed">
        Add Client Manually
      </SectionTitle>
 
      {/* Share Consultation Link */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: P.text, marginBottom: 10 }}>
          📲 Share Consultation Link
        </div>
        <button onClick={() => setShowShare(!showShare)} style={{
          fontSize: 12, fontWeight: 600, padding: "7px 14px",
          borderRadius: 5, border: "1px solid " + P.border,
          background: P.s1, color: P.text, cursor: "pointer",
          fontFamily: "inherit",
        }}>
          {showShare ? "Hide Options ▲" : "Show Share Options ▼"}
        </button>
 
        {showShare && (
          <div style={{ marginTop: 10, padding: 12,
            border: "1px solid " + P.border, borderRadius: 8,
            background: P.s2 }}>
            <div style={{ display: "flex", justifyContent: "space-around",
              textAlign: "center" }}>
 
              <div onClick={() => {
                window.location.href =
                  "mailto:?subject=Legal Consultation&body=Please fill this form: " +
                  window.location.origin + "/landing";
              }} style={{ cursor: "pointer" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%",
                  border: "1px solid " + P.border, background: P.s1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 4px", fontSize: 18 }}>📧</div>
                <div style={{ fontSize: 10, color: P.text }}>Email</div>
              </div>
 
              <div onClick={() => {
                navigator.clipboard.writeText(window.location.origin + "/landing");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }} style={{ cursor: "pointer" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%",
                  border: "1px solid " + P.border, background: P.s1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 4px", fontSize: 18 }}>
                  {copied ? "✅" : "🔗"}
                </div>
                <div style={{ fontSize: 10, color: P.text }}>
                  {copied ? "Copied!" : "Copy Link"}
                </div>
              </div>
 
              
                <div style={{ cursor:"pointer" }} onClick={() => {
                  if (typeof window === "undefined") return;
                  const chatUrl = window.location.origin + "/chat";
                  const message = `Namaskara,

                Aadya Law has set up an online intake form for you to describe your legal matter before your consultation.

                Please click the link below and answer a few questions. The advocate will review your case before meeting you.

                ${chatUrl}

                This takes about 5 minutes and is available 24/7.

                _This does not constitute legal advice._`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
                }}>
                  <div style={{
                      width:44,
                      height:44,
                      borderRadius:"50%",
                      background:P.s1,
                      border:`1px solid ${P.border}`,
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center",
                      margin:"0 auto 5px",
                    }}>
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                        alt="WhatsApp"
                        style={{ width:22, height:22 }}
                      />
                    </div>
                  <div style={{ fontSize:11, color:P.text }}>WhatsApp</div>
                </div>

 
            </div>
          </div>
        )}
      </Card>
 
      {/* Manual form */}
      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, color: P.text, marginBottom: 14 }}>
          Client Details
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
 
          <div>
            <label style={labelStyle}>Client Name *</label>
            <input value={form.client_name}
              onChange={e => set("client_name", e.target.value)}
              placeholder="e.g. Smt. Lakshmi Devi"
              style={inputStyle} />
          </div>
 
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input value={form.contact_phone}
              onChange={e => set("contact_phone", e.target.value)}
              placeholder="e.g. 98451 XXXXX"
              style={inputStyle} />
          </div>
 
          <div>
            <label style={labelStyle}>Service Type</label>
            <select value={form.service_type}
              onChange={e => set("service_type", e.target.value)}
              style={inputStyle}>
              <option value="">— Select type —</option>
              <option value="Property — Title Dispute">Property — Title Dispute</option>
              <option value="Property — Partition">Property — Partition</option>
              <option value="PROPERTY_ENCROACHMENT">PROPERTY_ENCROACHMENT</option>
              <option value="Family — Succession">Family — Succession</option>
              <option value="Family — Divorce">Family — Divorce</option>
              <option value="Rent — Tenancy">Rent — Commercial Eviction</option>
              <option value="Cheque Bounce — NI Act S.138">Cheque Bounce — NI Act S.138</option>
              <option value="RERA — Builder Dispute">RERA — Builder Dispute</option>
              <option value="Civil — Recovery of Money">Civil — Recovery of Money</option>
              <option value="Civil - Contract">Civil Contract</option>
              <option value="Civil - Injunction">Civil Injunction</option>
              <option value="Documentation — Legal Opinion">Documentation — Legal Opinion</option>
              <option value="Other">Other</option>
            </select>
          </div>

             <div>
            <label style={labelStyle}>Recommended Forum</label>
            <select value={form.recommended_forum}
              onChange={e => set("recommended_forum", e.target.value)}
              style={inputStyle}>
              <option value="">— Select type —</option>
              <option value="City Civil Court">City Civil Court</option>
              <option value="Civil Court + Revenue">Civil Court + Revenue</option>
              <option value="Small Causes Court">Small Causes Court</option>
              <option value="Family Court">Family Court</option>
              <option value="Commercial Court">Commercial Court</option>
              <option value="Karnataka RERA">Karnataka RERA</option>
              <option value="Magistrate">Magistrate</option>
              <option value="N/A">N/A</option>
              <option value="Other">Other</option>
            </select>
          </div>
 
          <div>
            <label style={labelStyle}>Brief Summary of Facts</label>
            <textarea value={form.fact_summary}
              onChange={e => set("fact_summary", e.target.value)}
              placeholder="Describe the client situation briefly..."
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
          <label style={labelStyle}>Documents (Optional)</label>

          <div
            style={{
              border: `1px dashed ${P.border}`,
              borderRadius: 8,
              padding: 12,
              background: P.bg,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              cursor: "pointer",
            }}
            onClick={() => fileRef.current?.click()}
          >
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              + Upload Documents
            </div>

            <div style={{ fontSize: 11, color: P.muted }}>
              PDFs, images, contracts, etc.
            </div>

            <input
              ref={fileRef}
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setDocs(files);
              }}
            />

            <div style={{ fontSize: 11, color: P.muted }}>
              Attach supporting documents (PDF, images, etc). Not saved to database.
            </div>
          </div>
        </div>
        {docs.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Uploaded Documents:
              </div>

              {docs.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: 11,
                    color: P.text,
                    padding: "4px 0",
                    borderBottom: `1px solid ${P.border}`,
                  }}
                >
                  📄 {file.name}
                </div>
              ))}
            </div>
          )}

          
          <button onClick={save} disabled={saving} style={{
            fontSize: 13, fontWeight: 600, padding: "9px 20px",
            borderRadius: 7, border: "none",
            background: saving ? P.border : P.accent,
            color: saving ? P.muted : "#fff",
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all 0.1s",
          }}>
            {saving ? "Saving..." : "Save Client Record"}
          </button>
 
          {statusMsg && (
            <div style={{ fontSize: 12, fontWeight: 600, textAlign: "center",
              color: statusMsg.ok ? P.accent : P.rose }}>
              {statusMsg.text}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── INTAKE LIST SCREEN ──
 
function IntakeList({ nav }: { nav: (s: string, d?: any) => void }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all"
    ? INTAKES
    : INTAKES.filter(i => i.status === filter);
 
  return (
    <div>
      <SectionTitle sub={INTAKES.filter(i => i.status === "new").length + " new briefs awaiting review"}>
        Client Intake Briefs
      </SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all","new","reviewed","converted"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 14px", borderRadius: 20,
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            background: filter === f ? P.accent : P.s1,
            color: filter === f ? "#fff" : P.muted,
            border: "1px solid " + (filter === f ? P.accent : P.border),
            fontFamily: "inherit",
          }}>{f.toUpperCase()}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(i => (
          <Card key={i.id} onClick={() => nav("intake-detail", i)}
            accentColor={i.tc}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center",
                  flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: P.ink }}>
                    {i.name}
                  </span>
                  <span style={{ fontSize: 10, color: P.dim }}>{i.id}</span>
                  <Pill label={i.type.replace(/_/g," ")} color={i.tc} />
                  <Pill label={i.urgency.toUpperCase()} color={i.uc} />
                  {i.status === "new" && <Pill label="NEW" color={P.accent} />}
                  {i.status === "converted" && <Pill label="CONVERTED" color={P.teal} />}
                </div>
                <div style={{ fontSize: 12, color: P.muted }}>{i.subtype}</div>
                <div style={{ fontSize: 11, color: P.dim, marginTop: 4 }}>
                  {i.time} · {i.phone}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700,
                  color: i.dl < 30 ? P.rose : P.accent }}>
                  {i.dl}d limit
                </div>
                <div style={{ fontSize: 10, color: P.dim, marginTop: 2 }}>{i.court}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
 
// ── INTAKE DETAIL SCREEN ──
 function IntakeDetail({ item, nav }: {
  item: any;
  nav: (s: string, d?: any) => void;
}) {
  // Normalize fields — works for both mock INTAKES and real Supabase IntakeBrief
  const clientName  = item.client_name  || item.name     || "—";
  const clientPhone = item.contact_phone || item.phone    || "—";
  const caseType    = item.service_type  || item.type     || "—";
  const summary     = item.fact_summary  || item.summary  || "—";
  const forum       = item.recommended_forum || item.court || "—";
  const receivedAt  = item.created_at    || item.time     || "—";
  const urgency     = item.urgency       || "medium";
  const deadline    = item.deadline      || "—";
  const daysLeft    = item.dl            ?? "—";
  const limStatus   = item.lim           || "safe";
  const laws        = item.laws          || [];
  const questions   = item.questions     || [];
  const uc          = item.uc            || P.gold;
  const tc          = item.tc            || P.accent;

  const [showCaseForm, setShowCaseForm] = useState(false);
 const [caseForm, setCaseForm] = useState({
  cnr: "",
  suit: "",
  court: forum,
  judge: "",
  stage: "Filing",
  value: "",
  filing_date: new Date().toISOString().split("T")[0],
  next_hearing: "",
  advocate: "",
  advocate_roll: "",
  opposite_party: "",
  party_designation: "Plaintiff",
  opposite_designation: "Defendant",
  client_address: "",
  advocate_address: "",
});
  const [converting, setConverting] = useState(false);

  async function convertToCase() {
  setConverting(true);
  try {
    const { data: last } = await supabase
      .from("cases")
      .select("case_id")
      .not("case_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1);

    const lastNum = last?.[0]?.case_id
      ? parseInt(last[0].case_id.split("-")[2] || "0")
      : 0;
    const year   = new Date().getFullYear();
    const caseId = `CS-${year}-${String(lastNum + 1).padStart(3, "0")}`;

    const typeMap: Record<string, string> = {
      "Property — Title Dispute":      "PROPERTY_TITLE",
      "Property — Partition":          "FAMILY_SUCCESSION",
      "PROPERTY_ENCROACHMENT":         "PROPERTY_ENCROACHMENT",
      "Family — Succession":           "FAMILY_SUCCESSION",
      "Family — Divorce":              "FAMILY_SUCCESSION",
      "Rent — Tenancy":                "RENT_TENANCY",
      "Cheque Bounce — NI Act S.138":  "CHEQUE_BOUNCE",
      "RERA — Builder Dispute":        "RERA_BUILDER",
      "Civil — Recovery of Money":     "CIVIL_CONTRACT",
      "Civil - Contract":              "CIVIL_CONTRACT",
      "Civil - Injunction":            "CIVIL_INJUNCTION",
      "Documentation — Legal Opinion": "CIVIL_CONTRACT",
    };

    const { error } = await supabase.from("cases").insert([{
      case_id:              caseId,
      client_name:               clientName,
      case_type:                 typeMap[caseType] || caseType.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase(),
      suit:                 caseForm.suit || "—",
      suit_number:          caseForm.suit || "—",
      cnr:                  caseForm.cnr  || "—",
      cnr_number:           caseForm.cnr  || "—",
      court_name:                caseForm.court,
      judge:                caseForm.judge,
      stage:                caseForm.stage,
      status:               "active",
      value:                caseForm.value,
      filing_date:          caseForm.filing_date,
      next_hearing:         caseForm.next_hearing || null,
      last_activity:        `Case filed. ${summary?.slice(0, 80) || ""}`,
      party_designation:    caseForm.party_designation,
      opposite_party:       caseForm.opposite_party,
      opposite_designation: caseForm.opposite_designation,
      advocate:             caseForm.advocate,
      advocate_roll:        caseForm.advocate_roll,
      client_address:       caseForm.client_address,
      advocate_address:     caseForm.advocate_address,
      intake_id:            item.id && !item.id.toString().startsWith("INT-") ? item.id : null,
      created_at:           new Date().toISOString(),
    }]);

    if (error) throw error;

    if (item.id && !item.id.toString().startsWith("INT-")) {
      await supabase
        .from("intake_briefs")
        .update({ status: "converted" })
        .eq("id", item.id);
    }

    setShowCaseForm(false);
    alert(`✓ Case ${caseId} created!`);
    nav("cases");
  } catch (err: any) {
    alert("Error: " + err.message);
  } finally {
    setConverting(false);
  }
}

  return (
    <div>
      <BackLink onClick={() => nav("intake")}>← Back to Intake Briefs</BackLink>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: "'Lora', Georgia, serif",
            fontSize: 23, fontWeight: 700, color: P.ink }}>{clientName}</h2>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 8 }}>
            <Pill label={item.id || "—"} color={P.dim} />
            <Pill label={caseType.replace(/_/g," ")} color={tc} />
            <Pill label={"Urgency: " + urgency} color={uc} />
            <Pill
              label={limStatus === "safe" ? "✓ Within Limitation" : "⚠ Deadline Warning"}
              color={limStatus === "safe" ? P.accent : P.gold} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => nav("deadlines")} style={{
            padding: "7px 16px", background: P.s2, color: P.text,
            border: "1px solid " + P.border, borderRadius: 7,
            fontSize: 12, cursor: "pointer", fontFamily: "inherit",
          }}>📅 Add to Calendar</button>
          <button onClick={() => setShowCaseForm(true)} style={{
          padding: "7px 16px",
          background: P.accent, color: "#fff",
          border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          Convert to Case →
        </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 14, marginBottom: 14 }}>
        <Card>
          <SecLabel>Client Details</SecLabel>
          <Row label="Phone"     value={clientPhone} />
          <Row label="Received"  value={receivedAt} />
          <Row label="Case Type" value={caseType} valueColor={tc} />
          <Row label="Forum"     value={forum} />
        </Card>
        <Card>
          <SecLabel>Deadline Analysis</SecLabel>
          <Row label="Limitation Deadline" value={deadline} />
          <Row label="Days Remaining"
            value={daysLeft + " days"}
            valueColor={Number(daysLeft) < 30 ? P.rose : P.accent} />
          <Row label="Status"
            value={limStatus === "safe" ? "Safe — File at any time" : "Warning — File soon"}
            valueColor={limStatus === "safe" ? P.accent : P.gold} />
        </Card>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <SecLabel>Fact Summary</SecLabel>
        <p style={{ margin: 0, fontSize: 13, color: P.text, lineHeight: 1.8 }}>
          {summary}
        </p>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 14, marginBottom: 14 }}>
        <Card>
          <SecLabel>Applicable Laws</SecLabel>
          {laws.length > 0
            ? laws.map((l: string, i: number) => (
                <div key={i} style={{ fontSize: 12.5, color: P.blue, padding: "5px 0",
                  borderBottom: i < laws.length - 1 ? "1px solid " + P.border : "none" }}>
                  § {l}
                </div>
              ))
            : <div style={{ fontSize: 12, color: P.dim }}>No laws recorded yet.</div>
          }
        </Card>
        <Card>
          <SecLabel>Questions for Advocate</SecLabel>
          {questions.length > 0
            ? questions.map((q: string, i: number) => (
                <div key={i} style={{ fontSize: 12.5, color: P.text, padding: "5px 0",
                  borderBottom: i < questions.length - 1 ? "1px solid " + P.border : "none" }}>
                  ? {q}
                </div>
              ))
            : <div style={{ fontSize: 12, color: P.dim }}>No questions recorded yet.</div>
          }
        </Card>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => nav("ai-drafts")} style={{
          padding: "8px 18px", background: P.blue, color: "#fff",
          border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
        }}>✨ Draft Legal Notice (AI)</button>
        <button style={{
          padding: "8px 18px", background: P.s2, color: P.text,
          border: "1px solid " + P.border, borderRadius: 7,
          fontSize: 12, cursor: "pointer", fontFamily: "inherit",
        }}>📄 Download Brief PDF</button>
      </div>
      {showCaseForm && (
  <div style={{
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
  }} onClick={() => setShowCaseForm(false)}>
    <div onClick={e => e.stopPropagation()} style={{
      width: 580, maxHeight: "90vh", background: P.s1,
      borderRadius: 12, overflow: "hidden",
      display: "flex", flexDirection: "column",
      boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    }}>
      {/* Header */}
      <div style={{
        padding: "18px 24px", background: P.accentL,
        borderBottom: "1px solid " + P.border,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: P.accent }}>
            Convert to Case
          </div>
          <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>
            {clientName} · {caseType}
          </div>
        </div>
        <button onClick={() => setShowCaseForm(false)} style={{
          background: "none", border: "none", fontSize: 20,
          cursor: "pointer", color: P.muted,
        }}>×</button>
      </div>

      {/* Form body */}
      <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
        {/* Court & Filing */}
        <div style={{ fontSize: 10, fontWeight: 700, color: P.dim,
          letterSpacing: "0.1em", textTransform: "uppercase",
          marginBottom: 12 }}>Court & Filing Details</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { label: "CNR Number",    field: "cnr",          placeholder: "e.g. KABC010051322015" },
            { label: "Suit Number",   field: "suit",         placeholder: "e.g. OS 1241/2024" },
            { label: "Court",         field: "court",        placeholder: "e.g. City Civil Court" },
            { label: "Judge",         field: "judge",        placeholder: "e.g. A.V. Nataraj, J." },
            { label: "Suit Value",    field: "value",        placeholder: "e.g. Rs.42L" },
            { label: "Filing Date",   field: "filing_date",  placeholder: "", type: "date" },
            { label: "Next Hearing",  field: "next_hearing", placeholder: "", type: "date" },
          ].map(({ label, field, placeholder, type }) => (
            <div key={field}>
              <div style={{ fontSize: 10, color: P.dim, marginBottom: 4,
                textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
              <input
                type={type || "text"}
                value={(caseForm as any)[field]}
                onChange={e => setCaseForm(prev => ({ ...prev, [field]: e.target.value }))}
                placeholder={placeholder}
                style={{ width: "100%", fontSize: 12, padding: "8px 11px",
                  borderRadius: 7, border: "1px solid " + P.border,
                  background: P.s2, color: P.text, outline: "none",
                  fontFamily: "inherit", boxSizing: "border-box" as const }}
              />
            </div>
          ))}

          {/* Stage dropdown */}
          <div>
            <div style={{ fontSize: 10, color: P.dim, marginBottom: 4,
              textTransform: "uppercase", letterSpacing: "0.07em" }}>Stage</div>
            <select
              value={caseForm.stage}
              onChange={e => setCaseForm(prev => ({ ...prev, stage: e.target.value }))}
              style={{ width: "100%", fontSize: 12, padding: "8px 11px",
                borderRadius: 7, border: "1px solid " + P.border,
                background: P.s2, color: P.text, outline: "none",
                fontFamily: "inherit", cursor: "pointer" }}>
              {["Filing","Summons","Written Statement","Issues","Evidence",
                "Arguments","Judgment","Decree","Mediation","Cross-Exam"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Parties */}
        <div style={{ fontSize: 10, fontWeight: 700, color: P.dim,
          letterSpacing: "0.1em", textTransform: "uppercase",
          marginBottom: 12, marginTop: 4 }}>Parties & Advocate</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Party Designation",    field: "party_designation",    placeholder: "Plaintiff / Petitioner" },
            { label: "Opposite Party",        field: "opposite_party",       placeholder: "e.g. Narayan S.A." },
            { label: "Opposite Designation",  field: "opposite_designation", placeholder: "Defendant / Respondent" },
            { label: "Advocate Name",         field: "advocate",             placeholder: "e.g. M.A. Fayaz Ahammed" },
            { label: "Advocate Roll No.",     field: "advocate_roll",        placeholder: "e.g. KAR/1234/2015" },
            { label: "Client Address",        field: "client_address",       placeholder: "Full address" },
            { label: "Address for Service",   field: "advocate_address",     placeholder: "Advocate office address" },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <div style={{ fontSize: 10, color: P.dim, marginBottom: 4,
                textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
              <input
                value={(caseForm as any)[field]}
                onChange={e => setCaseForm(prev => ({ ...prev, [field]: e.target.value }))}
                placeholder={placeholder}
                style={{ width: "100%", fontSize: 12, padding: "8px 11px",
                  borderRadius: 7, border: "1px solid " + P.border,
                  background: P.s2, color: P.text, outline: "none",
                  fontFamily: "inherit", boxSizing: "border-box" as const }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "16px 24px", borderTop: "1px solid " + P.border,
        display: "flex", gap: 10, background: P.s1,
      }}>
        <button onClick={convertToCase} disabled={converting} style={{
          flex: 1, padding: "10px", background: converting ? P.border : P.accent,
          color: converting ? P.muted : "#fff", border: "none",
          borderRadius: 8, fontSize: 13, fontWeight: 700,
          cursor: converting ? "not-allowed" : "pointer", fontFamily: "inherit",
        }}>
          {converting ? "Creating Case..." : "✓ Create Case"}
        </button>
        <button onClick={() => setShowCaseForm(false)} style={{
          padding: "10px 20px", background: P.s2, color: P.text,
          border: "1px solid " + P.border, borderRadius: 8,
          fontSize: 13, cursor: "pointer", fontFamily: "inherit",
        }}>Cancel</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}


// ── CASES LIST ──
 
function CaseList({ nav }: { nav: (s: string, d?: any) => void }) {
  const [filter, setFilter]   = useState("active");
  const [cases, setCases]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
  setLoading(true);
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });

  const dbCases = (!error && data && data.length > 0)
    ? data.map(c => ({
        ...c,
        tc:                   typeColor(c.type || ""),
        sc:                   stageColor(c.stage || "Filing"),
        next:                 c.next_hearing || "—",
        last:                 c.last_activity || "No activity recorded",
        cnr:                  c.cnr || "—",
        suit:                 c.suit || c.case_id || "—",
        court:                c.court || "—",
        judge:                c.judge || "TBD",
        value:                c.value || "—",
        client:               c.client || "—",
        docs:                 c.docs || 0,
        party_designation:    c.party_designation    || "Plaintiff",
        opposite_party:       c.opposite_party       || "—",
        opposite_designation: c.opposite_designation || "Defendant",
        advocate:             c.advocate             || "—",
        advocate_roll:        c.advocate_roll        || "—",
        advocate_address:     c.advocate_address     || "—",
        client_address:       c.client_address       || "—",
        client_id_type:       c.client_id_type       || "—",
        advocate2:            c.advocate2            || "—",
        advocate2_roll:       c.advocate2_roll       || "—",
        filing_date:          c.filing_date          || "—",
        tl:                   [],
      }))
    : [];

  // Always show mock cases + real DB cases (excluding any DB cases with same id as mock)
  const merged = [
    ...CASES,
    ...dbCases.filter(db => !CASES.find(m => m.id === db.id || m.id === db.case_id)),
  ];
  setCases(merged);
  setLoading(false);
}
    load();
  }, []);

  const filtered = filter === "all"
  ? cases
  : filter === "won"
    ? cases.filter(c => c.status === "won" || c.status === "closed" || c.status === "disposed")
    : cases.filter(c => c.status === filter);

  return (
    <div>
      <SectionTitle sub="Manage litigation · track stages · monitor hearings">
        Active Cases
      </SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["active","all","won"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 14px", borderRadius: 20,
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            background: filter === f ? P.accent : P.s1,
            color: filter === f ? "#fff" : P.muted,
            border: "1px solid " + (filter === f ? P.accent : P.border),
            fontFamily: "inherit",
          }}>{f === "won" ? "CLOSED / WON / DISPOSED" : f.toUpperCase()}</button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: P.dim, fontSize: 13 }}>
          Loading cases...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card>
          <div style={{ textAlign: "center", padding: 24, color: P.dim, fontSize: 13 }}>
            No cases found. Convert an intake brief to create your first case.
          </div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(c => (
          <Card key={c.id} onClick={() => nav("case-detail", c)} accentColor={c.tc}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center",
                  flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: P.ink }}>
                    {c.client}
                  </span>
                  <span style={{ fontSize: 10, color: P.dim }}>{c.suit}</span>
                  <Pill label={(c.type||"").replace(/_/g," ")} color={c.tc} />
                  <Pill label={(c.stage||"Filing").toUpperCase()} color={c.sc} />
                  {c.status === "won" && <Pill label="✓ WON" color={P.accent} />}
                </div>
                <div style={{ fontSize: 11.5, color: P.muted }}>
                  {c.court} · {c.judge}
                </div>
                <div style={{ fontSize: 11, color: P.dim, marginTop: 3 }}>{c.last}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: P.text }}>{c.value}</div>
                {c.next && c.next !== "—" && (
                  <div style={{ fontSize: 10.5, color: P.teal, marginTop: 3 }}>
                    Next: {c.next}
                  </div>
                )}
                <div style={{ fontSize: 10, color: P.dim, marginTop: 2 }}>{c.docs} docs</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
 
// ── CASE DETAIL ──
 
function CaseDetail({ item, nav }: {
  item: typeof CASES[0];
  nav: (s: string, d?: any) => void;
}) {
  const [tab, setTab] = useState("overview");
  const [courtData, setCourtData]     = useState<any>(null);
const [courtLoading, setCourtLoading] = useState(false);
const [courtError, setCourtError]   = useState<string | null>(null);
const [lastSource, setLastSource]   = useState<string | null>(null);
const [showAllOrders, setShowAllOrders] = useState(false);
const [selectedDraft, setSelectedDraft] = useState<string | null>(null);
const [draftGenerating, setDraftGenerating] = useState(false);
const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
const [editMode, setEditMode] = useState<string | null>(null); // which card is editing
const [editData, setEditData] = useState<any>({ ...item });    // local copy of case data

 async function fetchCourtStatus() {
  if (!item?.cnr) {
    setCourtError('No CNR number available for this case.');
    return;
  }
  setCourtLoading(true);
  setCourtError(null);
  try {
    const res  = await fetch(`/api/court-status?cnr=${item.cnr}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'API call failed');
    setCourtData(json.data);
    setLastSource(json.source);
    if (json.warning) setCourtError(json.warning);
  } catch (err: any) {
    setCourtError(err.message);
  } finally {
    setCourtLoading(false);
  }
}
async function generateDraft() {
  setDraftGenerating(true);
  setGeneratedDraft(null);

  try {
    const endpoint = selectedDraft === 'Vakalatnama'
      ? '/api/vakalatnama'
      : '/api/order-brief'; // fallback for now

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseData: editData }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    setGeneratedDraft(json.draft);

  } catch (err: any) {
    setGeneratedDraft(`Error generating draft: ${err.message}`);
  } finally {
    setDraftGenerating(false);
  }
}
async function fetchAiBrief(pdfUrl: string, purpose: string) {
  const win = window.open('', '_blank');
  if (!win) { alert('Please allow popups for this site'); return; }

  // Loading screen
  const loadingBlob = new Blob([`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>AI Brief</title>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
<style>body{font-family:'Source Sans 3',sans-serif;max-width:700px;margin:60px auto;
padding:0 24px;background:#f5f2ed;color:#2c2417;text-align:center;}
.spinner{font-size:32px;margin-bottom:16px;}</style></head>
<body><div class="spinner">⚖️</div>
<p style="color:#6b5e4a;font-size:15px;">Reading order and generating brief...</p>
</body></html>`], { type: 'text/html;charset=utf-8' });
  win.location.href = URL.createObjectURL(loadingBlob);

  try {
    const res = await fetch('/api/order-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: pdfUrl, cnr: item.cnr, purpose }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);

    const b = json.brief;
    const isLegacy = json.isLegacy;

    // Confidence badge helper
    function confidenceBadge(level: string) {
      const map: Record<string, [string, string]> = {
        high:   ['#2d6a4f', '#e8f5ee'],
        medium: ['#8b6914', '#fef9ec'],
        low:    ['#a63232', '#fdf0f0'],
      };
      const [color, bg] = map[level] || map.medium;
      return `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;
        background:${bg};color:${color};border:1px solid ${color}30;
        text-transform:uppercase;letter-spacing:0.05em;">${level}</span>`;
    }

    const genDate = b.generatedAt
      ? new Date(b.generatedAt).toLocaleString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : new Date().toLocaleString('en-IN');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AI Brief — ${purpose}</title>
  <link href="https://fonts.googleapis.com/css2?family=Lora:wght@700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Source Sans 3', system-ui, sans-serif; max-width: 700px;
           margin: 40px auto; padding: 0 24px 60px; color: #2c2417; background: #f5f2ed; }
    h1   { font-family: 'Lora', Georgia, serif; font-size: 26px; color: #2d6a4f; margin: 0; }
    .meta { font-size: 12px; color: #6b5e4a; margin-top: 4px; }
    .header { border-bottom: 2px solid #2d6a4f; padding-bottom: 16px; margin-bottom: 24px; }
    .section-label { font-size: 10px; font-weight: 700; color: #a0917c;
                     letter-spacing: 0.1em; text-transform: uppercase;
                     margin: 28px 0 10px; }
    .what-happened { font-size: 14px; line-height: 1.9; color: #2c2417;
                     background: #fff; border-radius: 8px; padding: 14px 16px;
                     border: 1px solid #e2ddd4; }
    .item { background: #fff; border: 1px solid #e2ddd4; border-radius: 8px;
            padding: 12px 14px; margin-bottom: 8px; }
    .item-text { font-size: 13.5px; color: #2c2417; line-height: 1.6; margin-bottom: 6px; }
    .citation { font-size: 11px; color: #1e4d8c; font-style: italic; }
    .risk-item { background: #fff; border: 1px solid #e2ddd4; border-radius: 8px;
                 padding: 12px 14px; margin-bottom: 8px;
                 border-left: 3px solid #a63232; }
    .risk-header { display: flex; justify-content: space-between;
                   align-items: flex-start; gap: 10px; margin-bottom: 6px; }
    .confidence-reason { font-size: 11px; color: #a0917c; margin-top: 4px; font-style: italic; }
    .authority-item { display: flex; gap: 10px; padding: 8px 0;
                      border-bottom: 1px solid #e2ddd4; font-size: 13px; }
    .authority-name { font-weight: 700; color: #1e4d8c; flex: 1; }
    .authority-ref  { color: #6b5e4a; font-size: 12px; }
    .action-btn { display: inline-block; margin-top: 8px; padding: 5px 14px;
                  background: #1e4d8c; color: #fff; border-radius: 5px;
                  font-size: 11px; font-weight: 700; cursor: pointer;
                  border: none; font-family: inherit; }
    .disclaimer { margin-top: 28px; padding: 14px 18px; background: #fef9ec;
                  border: 1px solid rgba(139,105,20,0.25); border-radius: 8px;
                  font-size: 12px; color: #8b6914; line-height: 1.7; }
    .actions { margin-top: 20px; display: flex; gap: 10px; }
    .btn-print { padding: 8px 20px; background: #2d6a4f; color: #fff;
                 border: none; border-radius: 6px; font-size: 13px;
                 cursor: pointer; font-family: inherit; font-weight: 600; }
    .btn-copy  { padding: 8px 20px; background: #f0ece4; color: #2c2417;
                 border: 1px solid #e2ddd4; border-radius: 6px; font-size: 13px;
                 cursor: pointer; font-family: inherit; font-weight: 600; }
    .btn-back  { padding: 8px 20px; background: #f0ece4; color: #2c2417;
             border: 1px solid #e2ddd4; border-radius: 6px; font-size: 13px;
             cursor: pointer; font-family: inherit; font-weight: 600; }
  </style>
</head>
<body>

  <div class="header">
    <div style="font-size:10px;font-weight:700;color:#a0917c;letter-spacing:0.1em;
                text-transform:uppercase;margin-bottom:6px;">
      AI Order Brief · ${item.cnr}
    </div>
    <h1>${purpose}</h1>
    <div class="meta">${item.client} · ${item.court}</div>
  </div>

  ${isLegacy ? `<div style="white-space:pre-wrap;font-size:14px;line-height:1.9;">${b}</div>` : `

  <!-- WHAT HAPPENED -->
  <div class="section-label">What Happened</div>
  <div class="what-happened">${b.whatHappened || '—'}</div>

  <!-- KEY DIRECTIONS -->
  <div class="section-label">Key Directions</div>
  ${(b.keyDirections || []).map((d: any) => `
    <div class="item">
      <div class="item-text">${d.direction}</div>
      ${d.citation ? `<div class="citation">📎 ${d.citation}</div>` : ''}
    </div>`).join('') || '<div class="item"><div class="item-text">None recorded.</div></div>'}

  <!-- NEXT STEPS -->
  <div class="section-label">Next Steps for Advocate</div>
  ${(b.nextSteps || []).map((s: any) => `
    <div class="item">
      <div class="item-text">${s.step}</div>
      ${s.action && s.action !== 'none' ? `
        <button class="action-btn"
          onclick="window.opener?.postMessage({action:'${s.action}'},'*'); window.close();">
          ✨ ${s.actionLabel || 'Open in Dashboard'}
        </button>` : ''}
    </div>`).join('') || '<div class="item"><div class="item-text">No immediate steps required.</div></div>'}

  <!-- RISK FLAGS -->
  <div class="section-label">Risk Flags</div>
  ${(b.riskFlags || []).map((r: any) => `
    <div class="risk-item">
      <div class="risk-header">
        <div class="item-text" style="margin:0;">${r.flag}</div>
        ${confidenceBadge(r.confidence || 'medium')}
      </div>
      ${r.citation ? `<div class="citation">📎 ${r.citation}</div>` : ''}
      ${r.confidenceReason ? `<div class="confidence-reason">${r.confidenceReason}</div>` : ''}
    </div>`).join('') || '<div class="item"><div class="item-text">No risk flags identified.</div></div>'}

  <!-- CITED AUTHORITIES -->
  ${(b.citedAuthorities || []).length > 0 ? `
  <div class="section-label">Cited Authorities</div>
  <div style="background:#fff;border:1px solid #e2ddd4;border-radius:8px;padding:4px 14px;">
    ${b.citedAuthorities.map((a: any) => `
      <div class="authority-item">
        <div class="authority-name">§ ${a.name}</div>
        <div class="authority-ref">${a.reference}</div>
      </div>`).join('')}
  </div>` : ''}

  `}

  <!-- DISCLAIMER -->
  <div class="disclaimer">
    ⚠ AI-generated summary. Always read the original order before appearing in court.
    <br>
    <span style="font-size:11px;color:#a0917c;">
      Generated ${genDate} · ${b.modelNote || 'claude-sonnet-4-20250514'}
    </span>
  </div>

  <div class="actions">
    <button class="btn-print" onclick="window.print()">🖨 Print / Save PDF</button>
    <button class="btn-copy" onclick="navigator.clipboard.writeText(document.body.innerText)">
      📋 Copy Text
    </button>
    <button class="btn-back" onclick="window.close()">← Back</button>
  </div>

</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    win.location.href = URL.createObjectURL(blob);

  } catch (err: any) {
    const errBlob = new Blob([`<!DOCTYPE html><html><body style="font-family:sans-serif;
      padding:40px;color:#a63232;">Error: ${err.message}</body></html>`],
      { type: 'text/html;charset=utf-8' });
    win.location.href = URL.createObjectURL(errBlob);
  }
}
function openDailyStatus(h: any) {
  const win = window.open('', '_blank');
  if (!win) { alert('Please allow popups for this site'); return; }

  const petitioner = courtData?.petitioner_and_advocate?.split('(')[0]?.trim() || '—';
  const respondent = courtData?.respondent_and_advocate?.split('(')[0]?.trim() || '—';

  const rows = [
    ['Business',           h.purpose || '—'],
    ['Hearing Date',       h.hearing_date || '—'],
    ['Nature of Disposal', courtData?.disposal_type_raw || '—'],
    ['Disposal Date',      courtData?.decision_date || '—'],
  ];

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Daily Status — ${h.date}</title>
    <link href="https://fonts.googleapis.com/css2?family=Lora:wght@700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; }
      body { font-family: 'Source Sans 3', system-ui, sans-serif;
             max-width: 580px; margin: 60px auto; padding: 0 24px;
             color: #2c2417; background: #f5f2ed; }
      h1   { font-family: 'Lora', Georgia, serif; font-size: 24px;
             color: #2c2417; margin: 0 0 20px; text-align: center; }
      .court-block { text-align: center; font-size: 13px; color: #6b5e4a;
                     line-height: 2; padding: 16px; background: #fff;
                     border-radius: 10px; margin-bottom: 20px;
                     border: 1px solid #e2ddd4; }
      .court-block strong { color: #2c2417; }
      .row  { display: flex; padding: 10px 0;
              border-bottom: 1px solid #e2ddd4; font-size: 13px; }
      .row-label { color: #a0917c; width: 180px; flex-shrink: 0; }
      .row-value { color: #2c2417; font-weight: 600; }
      .judge-line { text-align: right; font-size: 12px; color: #6b5e4a;
                    margin-top: 14px; font-style: italic; }
      .actions { margin-top: 24px; display: flex; gap: 10px; padding-bottom: 60px; }
      button { padding: 8px 20px; border-radius: 6px; font-size: 13px;
               cursor: pointer; font-family: inherit; font-weight: 600; border: none; }
      .btn-pdf   { background: #f0ece4; color: #2c2417;
                   border: 1px solid #e2ddd4 !important; }
      .btn-close { background: #1e4d8c; color: #fff; }
    </style>
  </head>
  <body>
    <h1>Daily Status</h1>
    <div class="court-block">
      <div><strong>${courtData?.court_name || item.court}</strong></div>
      <div>In the court of: ${h.judge || courtData?.judge || item.judge || '—'}</div>
      <div>CNR Number: <strong>${item.cnr}</strong></div>
      <div>Case Number: <strong>${item.suit}</strong></div>
      <div><strong>${petitioner}</strong> versus <strong>${respondent}</strong></div>
      <div>Date: <strong>${h.date}</strong></div>
    </div>
    ${rows.map(([label, value]) => `
      <div class="row">
        <span class="row-label">${label}</span>
        <span class="row-value">${value}</span>
      </div>`).join('')}
    <div class="judge-line">
      ${h.judge || courtData?.judge || item.judge || ''}
    </div>
    <div class="actions">
      ${h.pdf_url ? `
        <button class="btn-pdf" onclick="window.open('/api/court-pdf?file=${encodeURIComponent(h.pdf_url)}&cnr=${encodeURIComponent(item.cnr)}', '_blank')">
          📄 Download Order PDF
        </button>` : ''}
      <button class="btn-close" onclick="window.close()">Close</button>
    </div>
  </body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  win.location.href = URL.createObjectURL(blob);
}

function EditableCard({ cardKey, title, fields, editMode, editData, setEditMode, setEditData }: {
  cardKey: string;
  title: string;
  fields: { label: string; field: string; }[];
  editMode: string | null;
  editData: any;
  setEditMode: (k: string | null) => void;
  setEditData: (d: any) => void;
}) {
  const isEditing = editMode === cardKey;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 10 }}>
        <SecLabel>{title}</SecLabel>
        <button
  onClick={() => setEditMode(isEditing ? null : cardKey)}
  style={{
    fontSize: 10.5, fontWeight: 700,
    padding: "4px 12px", borderRadius: 20,
    background: isEditing ? P.accent : P.blueL,
    color: isEditing ? "#fff" : P.blue,
    border: "1px solid " + (isEditing ? P.accent : "rgba(30,77,140,0.25)"),
    cursor: "pointer", fontFamily: "inherit",
    letterSpacing: "0.02em",
  }}
>
  {isEditing ? "✓ Done" : "✏ Edit"}
</button>
      </div>

      {fields.map(({ label, field }) => (
        isEditing ? (
          <div key={field} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9.5, color: P.dim, marginBottom: 3,
              textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {label}
            </div>
            <input
              value={editData[field] ?? ""}
              onChange={e => setEditData((prev: any) => ({ ...prev, [field]: e.target.value }))}
              style={{
                width: "100%", fontSize: 12, padding: "7px 10px",
                borderRadius: 6, border: "1px solid " + P.accent,
                background: P.s2, color: P.text, outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
        ) : (
          <Row key={field} label={label} value={editData[field] || "—"} />
        )
      ))}
    </Card>
  );
}

  return (
    <div>
      <BackLink onClick={() => nav("cases")}>← Back to Cases</BackLink>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: "'Lora', Georgia, serif",
            fontSize: 23, fontWeight: 700, color: P.ink }}>{item.client}</h2>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 8 }}>
            <Pill label={item.suit} color={P.dim} />
            <Pill label={(item.stage || "Filing").toUpperCase()} color={item.sc || P.dim} />
            <Pill label={(item.type || "").replace(/_/g," ")} color={item.tc || P.muted} />
            {item.status === "won" && <Pill label="✓ DECREE PASSED" color={P.accent} />}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => nav("documents", { filterCase: item.suit && item.suit !== "—" ? item.suit : item.id })} style={{
            padding: "7px 16px", background: P.blue, color:"#fff",
            border: "1px solid " + P.border, borderRadius: 6,
            fontSize: 11, cursor: "pointer", fontFamily: "inherit",
          }}>📎 Docs ({item.docs})</button>
          
        </div>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid ' + P.border, marginBottom: 16 }}>

  {/* Existing Overview tab */}
  <button onClick={() => setTab('overview')} style={{
    padding: '8px 18px', background: 'none', border: 'none',
    borderBottom: tab === 'overview' ? '2px solid ' + P.accent : '2px solid transparent',
    color: tab === 'overview' ? P.accent : P.muted,
    fontSize: 12, fontWeight: tab === 'overview' ? 700 : 400,
    cursor: 'pointer', fontFamily: 'inherit',
  }}>Overview</button>

  {/* Existing Timeline tab */}
 <button
  onClick={() => {
    setTab('timeline');
    // Fetch court data if it has not been loaded yet
    // (same pattern already used by the eCourts Live tab)
    if (!courtData) fetchCourtStatus();
  }}
  style={{
    padding: '8px 18px', background: 'none', border: 'none',
    borderBottom: tab === 'timeline' ? '2px solid ' + P.accent : '2px solid transparent',
    color: tab === 'timeline' ? P.accent : P.muted,
    fontSize: 12, fontWeight: tab === 'timeline' ? 700 : 400,
    cursor: 'pointer', fontFamily: 'inherit',
  }}
>Timeline</button>


  {/* NEW: eCourts Live tab */}
  <button
    onClick={() => { setTab('ecourts'); if (!courtData) fetchCourtStatus(); }}
    style={{
      padding: '8px 18px', background: 'none', border: 'none',
      borderBottom: tab === 'ecourts' ? '2px solid ' + P.accent : '2px solid transparent',
      color: tab === 'ecourts' ? P.accent : P.muted,
      fontSize: 12, fontWeight: tab === 'ecourts' ? 700 : 400,
      cursor: 'pointer', fontFamily: 'inherit', display: 'flex',
      alignItems: 'center', gap: 6,
    }}
  >
    eCourts Live
    <span style={{
      fontSize: 8, fontWeight: 700, padding: '1px 5px',
      borderRadius: 8, background: P.accent + '20',
      color: P.accent, border: '1px solid ' + P.accent + '40',
    }}>NEW</span>
  </button>

  {/* AI Drafts tab */}
<button
  onClick={() => setTab('ai-drafts')}
  style={{
    padding: '8px 18px', background: 'none', border: 'none',
    borderBottom: tab === 'ai-drafts' ? '2px solid ' + P.blue : '2px solid transparent',
    color: tab === 'ai-drafts' ? P.blue : P.muted,
    fontSize: 12, fontWeight: tab === 'ai-drafts' ? 700 : 400,
    cursor: 'pointer', fontFamily: 'inherit',
  }}
>
  ✨ AI Drafts
</button>

</div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <EditableCard
                cardKey="case-details"
                title="Case Details"
                fields={[
                  { label: "Court",         field: "court" },
                  { label: "CNR Number",    field: "cnr" },
                  { label: "Judge",         field: "judge" },
                  { label: "Suit Value",    field: "value" },
                  { label: "Stage",         field: "stage" },
                  { label: "Next Hearing",  field: "next" },
                  { label: "Filing Date",   field: "filing_date" },
                ]}
                editMode={editMode}
                editData={editData}
                setEditMode={setEditMode}
                setEditData={setEditData}
              />

              <EditableCard
                cardKey="parties"
                title="Parties & Representation"
                fields={[
                  { label: "Party Role",         field: "party_designation" },
                  { label: "Opposite Party",     field: "opposite_party" },
                  { label: "Opposite Role",      field: "opposite_designation" },
                  { label: "Advocate",           field: "advocate" },
                  { label: "Roll No.",           field: "advocate_roll" },
                  { label: "Jr. Advocate",       field: "advocate2" },
                  { label: "Jr. Roll No.",       field: "advocate2_roll" },
                ]}
                editMode={editMode}
                editData={editData}
                setEditMode={setEditMode}
                setEditData={setEditData}
              />

              <EditableCard
                cardKey="client"
                title="Client & Service Details"
                fields={[
                  { label: "Client Address",      field: "client_address" },
                  { label: "Phone",               field: "phone" },
                  { label: "ID Proof Type",       field: "client_id_type" },
                  { label: "Address for Service", field: "advocate_address" },
                ]}
                editMode={editMode}
                editData={editData}
                setEditMode={setEditMode}
                setEditData={setEditData}
              />

            <Card>
              <SecLabel>Last Activity</SecLabel>
              <p style={{ margin: 0, fontSize: 13, color: P.text, lineHeight: 1.7 }}>
                {item.last}
              </p>
            </Card>
            
          </div>
          <Card>
            <SecLabel>Documents on File</SecLabel>
            {Array.from({ length: Math.min(item.docs, 4) }, (_, i) => (
              <div key={i} style={{ padding: "6px 0",
                borderBottom: "1px solid " + P.border,
                fontSize: 11.5, color: P.muted }}>
                📄 Case document {i + 1}.pdf
              </div>
            ))}
            {item.docs > 4 && (
              <div style={{ padding: "6px 0", fontSize: 11, color: P.dim }}>
                + {item.docs - 4} more
              </div>
            )}
            <button onClick={() => nav("documents", { filterCase: item.suit && item.suit !== "—" ? item.suit : item.id })} style={{
              fontSize: 11, marginTop: 8, width: "100%", padding: "6px",
              background: P.s2, border: "1px solid " + P.border,
              borderRadius: 5, color: P.text, cursor: "pointer",
              fontFamily: "inherit",
            }}>View All Documents</button>
          </Card>
          <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => nav("ai-drafts")} style={{
            padding: "7px 16px", background: P.blue, color: "#fff",
            border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>Upload Details</button>
          
         
        </div>
        </div>
        
      )}
     {tab === 'timeline' && (
  <Card>
 
    {/* ── LOADING STATE ── */}
    {courtLoading && !courtData && (
      <div style={{ padding: 32, textAlign: 'center', color: P.dim, fontSize: 13 }}>
        Loading order history from eCourts...
      </div>
    )}
 
    {/* ── ERROR STATE ── */}
    {courtError && !courtData && (
      <div style={{ padding: 16 }}>
        <div style={{
          padding: '10px 14px', borderRadius: 7,
          background: 'rgba(166,50,50,0.08)',
          border: '1px solid rgba(166,50,50,0.2)',
          fontSize: 12, color: P.rose, marginBottom: 12,
        }}>
          ⚠ {courtError}
        </div>
        <button
          onClick={fetchCourtStatus}
          style={{
            padding: '7px 16px', background: P.accent, color: '#fff',
            border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          ↻ Retry
        </button>
      </div>
    )}
 
    {/* ── EMPTY STATE — data loaded but no orders returned ── */}
    {courtData && (courtData.timeline_orders || []).length === 0 && (
      <div style={{ padding: 24, textAlign: 'center', color: P.dim, fontSize: 13 }}>
        No order history available for this case.
      </div>
    )}
 
    {/* ── MAIN TIMELINE — real data from eCourts API ── */}
    {courtData && (courtData.timeline_orders|| []).map((h: any, i: number) => {
      // Build the total list length for the connector line logic
      const total = (courtData.timeline_orders || []).length;
      return (
        <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 20 }}>
 
          {/* Left column: coloured dot + connecting vertical line */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: 9, height: 9, borderRadius: '50%',
              background: i === 0 ? P.accent : P.dim,
              flexShrink: 0, marginTop: 3,
            }} />
            {i < total - 1 && (
              <div style={{
                width: 1, flex: 1, background: P.border,
                minHeight: 16, marginTop: 4,
              }} />
            )}
          </div>
 
          {/* Right column: date, NEW badge, event text, action buttons */}
          <div style={{ flex: 1 }}>
 
            {/* Row 1: date + NEW badge (only on the first/most recent entry) */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 2,
              }}>
                {/* Date */}
                <div style={{ fontSize: 10.5, color: P.dim }}>
                  {h.date || '—'}
                </div>

                {/* 🟢 ORDER TYPE BADGE */}
                {h.type === 'judgment' && (
                  <span style={{
                    fontSize: 8,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 8,
                    background: 'rgba(0,128,0,0.12)',
                    color: 'green',
                    border: '1px solid rgba(0,128,0,0.3)',
                  }}>
                    FINAL
                  </span>
                )}

                {h.type === 'interim' && (
                  <span style={{
                    fontSize: 8,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 8,
                    background: P.s2,
                    color: P.text,
                    border: '1px solid ' + P.border,
                  }}>
                    ORDER
                  </span>
                )}

                {/* 🔵 NEW BADGE */}
                {i === 0 && (
                  <span style={{
                    fontSize: 8,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 8,
                    background: P.accent + '18',
                    color: P.accent,
                    border: '1px solid ' + P.accent + '30',
                  }}>
                    NEW
                  </span>
                )}
              </div>
 
            {/* Row 2: purpose / event description */}
            <div style={{ fontSize: 13, color: P.text, marginBottom: 4 }}>
              {h.purpose || h.hearing_purpose || 'Hearing'}
            </div>
 
            {/* Row 3: judge name (if available) */}
            {h.judge && (
              <div style={{ fontSize: 11, color: P.muted, marginBottom: 8 }}>
                {h.judge}
              </div>
            )}
 
            {/* Row 4: action buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
 
              {/* Download PDF — uses pdf_url if the API returns one */}
              <button
              // In CaseDetail, Timeline tab — Download PDF button onClick:
                // In CaseDetail Timeline tab — Download PDF button
                onClick={async () => {
                if (!h.pdf_url) { alert('No PDF available'); return; }
                
                const proxyUrl = `/api/court-pdf?file=${encodeURIComponent(h.pdf_url)}&cnr=${encodeURIComponent(item.cnr)}`;
                
                try {
                  const res = await fetch(proxyUrl);
                  if (res.ok) {
                    const blob = await res.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    window.open(blobUrl, '_blank');
                  } else {
                    // Fixed fallback — CNR search lands directly on the case
                    window.open(
                      `https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/viewCase&type=cnr&cnrNumber=${encodeURIComponent(item.cnr)}&search_by=CNR`,
                      '_blank'
                    );
                  }
                } catch {
                  window.open(
                    `https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/viewCase&type=cnr&cnrNumber=${encodeURIComponent(item.cnr)}&search_by=CNR`,
                    '_blank'
                  );
                }
              }}
                style={{
                  fontSize: 10.5, fontWeight: 600,
                  padding: '4px 12px',
                  background: P.s2,
                  border: '1px solid ' + P.border,
                  borderRadius: 5, cursor: 'pointer',
                  fontFamily: 'inherit', color: P.text,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                📄 Download PDF
              </button>
 
              {/* View AI Brief — placeholder until AI brief panel is built */}
              <button
                onClick={() => {
                  if (h.pdf_url) fetchAiBrief(h.pdf_url, h.purpose || 'Court Order');
                  else alert('No PDF available for this order');
                }}
                style={{
                  fontSize: 10.5, fontWeight: 600,
                  padding: '4px 12px',
                  background: 'rgba(30,77,140,0.10)',
                  border: '1px solid rgba(30,77,140,0.25)',
                  borderRadius: 5, cursor: 'pointer',
                  fontFamily: 'inherit', color: P.blue,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                ✨ View AI Brief
              </button>
 
            </div>
          </div>
        </div>
      );
    })}
 
    {/* ── FOOTER: refresh link + Next Step button ── */}
    {courtData && (
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginTop: 8,
        paddingTop: 12, borderTop: '1px solid ' + P.border,
      }}>
        <button
          onClick={fetchCourtStatus}
          disabled={courtLoading}
          style={{
            fontSize: 11, color: P.accent, background: 'none',
            border: 'none', cursor: courtLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', fontWeight: 600,
          }}
        >
          {courtLoading ? 'Refreshing...' : '↻ Refresh from eCourts'}
        </button>
 
        <button
          onClick={() => nav('ai-drafts')}
          style={{
            padding: '7px 16px', background: P.blue, color: '#fff',
            border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Next Step
        </button>
      </div>
    )}
 
    {/* ── EMPTY STATE before first fetch ── */}
    {!courtData && !courtLoading && !courtError && (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: P.muted, marginBottom: 10 }}>
          Click below to load the live order history for this case
        </div>
        <button
          onClick={fetchCourtStatus}
          style={{
            padding: '8px 20px', background: P.accent, color: '#fff',
            border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          ↻ Fetch from eCourts
        </button>
      </div>
    )}
 
  </Card>
)}

      {tab === 'ecourts' && (
        <div>

        {/* ── SYNC HEADER BAR ── */}
        <div style={{
          background: P.accent, borderRadius: '10px 10px 0 0',
          padding: '10px 16px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
              ⚡ eCourts Live Feed
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
              CNR: {item.cnr}
            </div>
          </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {courtData && !courtLoading && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>
            {lastSource === 'live' ? '● LIVE' : '○ CACHED'}
          </span>
        )}
        <button
          onClick={fetchCourtStatus}
          disabled={courtLoading}
          style={{
            fontSize: 11, fontWeight: 600, padding: '5px 12px',
            background: 'rgba(255,255,255,0.15)',
            color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 6, cursor: courtLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {courtLoading ? 'Fetching...' : '↻ Refresh'}
        </button>
        </div>
        </div>

        {/* ── PANEL BODY ── */}
        <div style={{
          border: '1px solid ' + P.border, borderTop: 'none',
          borderRadius: '0 0 10px 10px', overflow: 'hidden',
        }}>

          {/* Loading state */}
          {courtLoading && !courtData && (
            <div style={{ padding: 40, textAlign: 'center', color: P.dim, fontSize: 13 }}>
              Fetching live data from eCourts...
            </div>
          )}

          {/* Error / warning */}
          {courtError && (
            <div style={{
              padding: '10px 16px', fontSize: 12,
              background: 'rgba(139,105,20,0.08)',
              color: P.gold, borderBottom: '1px solid ' + P.border,
            }}>
              ⚠ {courtError}
            </div>
          )}

              {/* Main data panel */}
              {courtData && (
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: 0,
                }}>

                  {/* LEFT: Status + AI Summary */}
                  <div style={{
                    padding: 16, borderRight: '1px solid ' + P.border,
                    display: 'flex', flexDirection: 'column', gap: 14,
                  }}>

            {/* Current Status */}
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: P.dim,
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                Current Status
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: P.ink }}>
                Case is {courtData.case_status || 'PENDING'}</div>
              {courtData.next_hearing_date && (
                <div style={{ fontSize: 11.5, color: P.teal, marginTop: 4 }}>
                  Next listed: {courtData.next_hearing_date}
                </div>
              )}
            </div>

            {/* Latest Order AI Summary */}
            {courtData.latest_order_summary && (
              <div style={{
                background: P.accentL,
                border: '1px solid rgba(45,106,79,0.15)',
                borderRadius: 8, padding: '10px 12px',
              }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: P.accent,
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Latest Order — AI Summary
                </div>
                <div style={{ fontSize: 12, color: P.text, lineHeight: 1.7 }}>
                  {courtData.latest_order_summary}
                </div>
              </div>
            )}

            {/* Case Details */}
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: P.dim,
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                Case Details
              </div>
              {[
                ['Court',      courtData.court_name || item.court],
                ['Judge',      courtData.judge      || item.judge],
                ['Petitioner', courtData.petitioner_and_advocate || '—'],
                ['Respondent', courtData.respondent_and_advocate || '—'],
              ].map(([l, v]) => (
                <div key={l} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '5px 0', borderBottom: '1px solid ' + P.border,
                  fontSize: 11.5,
                }}>
                  <span style={{ color: P.dim }}>{l}</span>
                  <span style={{ color: P.text, fontWeight: 600,
                    maxWidth: 200, textAlign: 'right', fontSize: 11 }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>

            {/* External link */}
            <button
              onClick={() => window.open('https://services.ecourts.gov.in', '_blank')}
              style={{
                fontSize: 11, padding: '6px 0', background: 'none',
                border: 'none', color: P.blue, cursor: 'pointer',
                textAlign: 'left', fontFamily: 'inherit', fontWeight: 600,
              }}
            >
              View on eCourts ↗
            </button>
          </div>

          {/* RIGHT: Recent Orders */}
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: P.dim,
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              Recent Orders & Updates
            </div>
           {(() => {
  const timelineOrders = courtData.timeline_orders || [];
const hearingDates = courtData.hearing_dates || courtData.case_history || [];

// Merge: use timeline_orders (which have pdf_url) and fill in remaining hearing dates
// Deduplicate by date — prefer timeline entry if same date exists in both
const timelineDates = new Set(timelineOrders.map((o: any) => o.date));
const extraHearings = hearingDates.filter((h: any) => !timelineDates.has(h.date));

const allOrders = [
  ...timelineOrders,
  ...extraHearings,
].sort((a: any, b: any) => {
  // Sort descending by date (newest first)
  const da = new Date(a.date?.split(' ').reverse().join('-') || 0);
  const db = new Date(b.date?.split(' ').reverse().join('-') || 0);
  return db.getTime() - da.getTime();
});
  const visibleOrders = showAllOrders ? allOrders : allOrders.slice(0, 6);
  return (
    <>
      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1.2fr 0.8fr 0.8fr',
        gap: 8,
        padding: '4px 0 8px',
        borderBottom: '2px solid ' + P.border,
        marginBottom: 2,
      }}>
        {['Business On Date', 'Hearing Date', 'Purpose', 'Order', 'AI Brief'].map(col => (
          <div key={col} style={{
            fontSize: 9, fontWeight: 700, color: P.dim,
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>{col}</div>
        ))}
      </div>

      {/* Data rows */}
      {visibleOrders.map((h: any, i: number) => (
        <div key={i} style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1.2fr 0.8fr 0.8fr',
          gap: 8,
          padding: '7px 0',
          borderBottom: '1px solid ' + P.border,
          alignItems: 'center',
        }}>

          {/* Business on Date — clickable blue link */}
          <button
            onClick={() => openDailyStatus(h)}
            style={{
              background: 'none', border: 'none', padding: 0,
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'inherit',
            }}
          >
            <span style={{
              fontSize: 11.5, color: P.blue,
              textDecoration: 'underline', fontWeight: 600,
            }}>
              {h.date || '—'}
            </span>
          </button>

          {/* Hearing Date */}
          <div style={{ fontSize: 11.5, color: P.text }}>
            {h.hearing_date || '—'}
          </div>

         {/* Purpose + NEW badge */}
<div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
  <span style={{ fontSize: 11.5, color: P.text }}>
    {h.purpose || 'Hearing'}
  </span>
  {i === 0 && (
    <span style={{
      fontSize: 8, fontWeight: 700, padding: '1px 5px',
      borderRadius: 8, background: P.accent + '18',
      color: P.accent, border: '1px solid ' + P.accent + '30',
      flexShrink: 0,
    }}>NEW</span>
  )}
</div>

{/* ── ADD THESE TWO NEW CELLS ── */}

{/* Download PDF */}
<div>
  {h.pdf_url ? (
    <button
      onClick={async () => {
        const proxyUrl = `/api/court-pdf?file=${encodeURIComponent(h.pdf_url)}&cnr=${encodeURIComponent(item.cnr)}`;
        try {
          const res = await fetch(proxyUrl);
          if (res.ok) {
            const blob = await res.blob();
            window.open(URL.createObjectURL(blob), '_blank');
          } else {
            window.open(`https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/viewCase&type=cnr&cnrNumber=${encodeURIComponent(item.cnr)}&search_by=CNR`, '_blank');
          }
        } catch {
          window.open(`https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/viewCase&type=cnr&cnrNumber=${encodeURIComponent(item.cnr)}&search_by=CNR`, '_blank');
        }
      }}
      style={{
        fontSize: 10, fontWeight: 600, padding: '3px 8px',
        background: P.s2, border: '1px solid ' + P.border,
        borderRadius: 4, cursor: 'pointer',
        fontFamily: 'inherit', color: P.text,
      }}
    >
      📄 PDF
    </button>
  ) : (
    <span style={{ fontSize: 10, color: P.dim }}>—</span>
  )}
</div>

{/* View AI Brief */}
<div>
  {h.pdf_url ? (
    <button
      onClick={() => fetchAiBrief(h.pdf_url, h.purpose || 'Court Order')}
      style={{
        fontSize: 10, fontWeight: 600, padding: '3px 8px',
        background: 'rgba(30,77,140,0.10)',
        border: '1px solid rgba(30,77,140,0.25)',
        borderRadius: 4, cursor: 'pointer',
        fontFamily: 'inherit', color: P.blue,
      }}
    >
      ✨ AI
    </button>
  ) : (
    <span style={{ fontSize: 10, color: P.dim }}>—</span>
  )}
</div>
          


        </div>
      ))}

      {/* View more / Show less */}
      {allOrders.length > 6 && (
        <div style={{ paddingTop: 10, textAlign: 'center' }}>
          <button
            onClick={() => setShowAllOrders(!showAllOrders)}
            style={{
              fontSize: 11, fontWeight: 600, color: P.accent,
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', textDecoration: 'underline',
            }}
          >
            {showAllOrders
              ? '↑ Show less'
              : `View full order history (${allOrders.length - 6} more) →`}
          </button>
        </div>
      )}

      {allOrders.length === 0 && (
        <div style={{ fontSize: 12, color: P.dim, padding: '8px 0' }}>
          No hearing history available
        </div>
      )}
    </>
  );
})()}

          </div>
        </div>
      )}

      {/* Empty state - nothing fetched yet */}
      {!courtData && !courtLoading && !courtError && (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: P.muted, marginBottom: 10 }}>
            Click Refresh to load live court data for this case
          </div>
          <button onClick={fetchCourtStatus} style={{
            padding: '8px 20px', background: P.accent, color: '#fff',
            border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            ↻ Fetch from eCourts
          </button>
        </div>
      )}
    </div>
  </div>
)}
{tab === 'ai-drafts' && (
  <div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)",
      gap: 10, marginBottom: 20 }}>
      {[
        {name:"Legal Notice",    icon:"⚖️", desc:"NI Act / Contract / Property notice",  color:P.accent},
        {name:"Vakalatnama",     icon:"📜", desc:"Power of attorney for court",           color:P.teal},
        {name:"Plaint Draft",   icon:"📋", desc:"Civil suit plaint with cause of action", color:P.blue},
        {name:"Reply to Notice", icon:"✉️", desc:"Structured reply to legal notice",      color:P.gold},
        {name:"Affidavit",      icon:"📝", desc:"Sworn affidavit for court proceedings",  color:P.rose},
        {name:"Execution Petition", icon:"🏛", desc:"Execution of decree",               color:P.accent},
      ].map((t, i) => (
        <div key={i}
          onClick={() => setSelectedDraft(t.name)}
          style={{
            background: selectedDraft === t.name ? P.s2 : P.s1,
            border: selectedDraft === t.name
              ? "1.5px solid " + t.color : "1px solid " + P.border,
            borderRadius: 10, padding: 16, cursor: "pointer",
            transition: "all 0.12s",
          }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>{t.icon}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: P.ink }}>{t.name}</div>
          <div style={{ fontSize: 11, color: P.muted, marginTop: 3 }}>{t.desc}</div>
        </div>
      ))}
    </div>

    {selectedDraft && (
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, color: P.blue }}>
          Generate: {selectedDraft}
        </div>
        {/* Pre-filled with case details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 10, marginBottom: 12 }}>
          {[
              { label: "Client Full Name",     val: item.client },
              { label: "Party Designation",    val: item.party_designation   || "Plaintiff" },
              { label: "Opposite Party",       val: item.opposite_party      || "" },
              { label: "Opposite Designation", val: item.opposite_designation || "Defendant" },
              { label: "Case / Reference",     val: item.suit },
              { label: "Court",                val: item.court },
              { label: "Advocate Name",        val: item.advocate            || "" },
              { label: "Advocate Roll No.",    val: item.advocate_roll       || "" },
              { label: "Address for Service",  val: item.advocate_address    || "" },
              { label: "Client Address",       val: item.client_address      || "" },
              ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: 10, color: P.dim, marginBottom: 4,
                  textTransform: "uppercase", letterSpacing: "0.07em" }}>{f.label}</div>
                <input defaultValue={f.val}
                  style={{ width: "100%", fontSize: 12, padding: "8px 11px",
                    borderRadius: 7, border: "1px solid " + P.border,
                    background: P.s2, color: P.text, outline: "none",
                    fontFamily: "inherit" }} />
              </div>
            ))}
        </div>
        <button onClick={generateDraft} disabled={draftGenerating} style={{
          padding: "8px 20px",
          background: draftGenerating ? P.border : P.blue,
          color: draftGenerating ? P.muted : "#fff",
          border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700,
          cursor: draftGenerating ? "not-allowed" : "pointer", fontFamily: "inherit",
        }}>
          {draftGenerating ? "Generating…" : "✨ Generate Draft"}
        </button>
      </Card>
    )}

    
       {generatedDraft && (
  <Card>
    <div style={{ display: "flex", justifyContent: "space-between",
      marginBottom: 10, alignItems: "center" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: P.accent }}>
        ✓ {selectedDraft} Generated — Review & Edit before use
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => {
            const win = window.open('', '_blank');
            if (!win) return;
            const blob = new Blob([`<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>${selectedDraft} — ${editData.suit}</title>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { 
    font-family: 'Source Sans 3', system-ui, sans-serif; 
    max-width: 720px;
    margin: 40px auto; 
    padding: 0 32px 60px; 
    color: #2c2417; 
    background: #f5f2ed; 
  }
  h2 { 
    font-family: 'Lora', Georgia, serif; 
    color: #2d6a4f; 
    font-size: 24px;
    margin-bottom: 4px;
  }
  .draft-body {
    font-family: 'Source Sans 3', system-ui, sans-serif;
    font-size: 14px;
    line-height: 2;
    background: #fff;
    padding: 40px 48px;
    border-radius: 8px;
    border: 1px solid #e2ddd4;
    color: #1a1208;
    white-space: pre-wrap;
  }
  .disclaimer { 
    margin-top: 20px; padding: 12px 16px; 
    background: #fef9ec;
    border: 1px solid rgba(139,105,20,0.25); 
    border-radius: 8px;
    font-size: 12px; color: #8b6914; 
  }
  .actions { margin-top: 16px; display: flex; gap: 10px; }
  button { 
    padding: 8px 20px; border-radius: 6px; font-size: 13px;
    cursor: pointer; font-family: inherit; font-weight: 600; border: none; 
  }
</style></head>
<body>
  <h2>${selectedDraft}</h2>
  <div style="font-size:12px;color:#6b5e4a;margin-bottom:20px;">
    ${editData.suit} · ${editData.court} · ${editData.client}
  </div>
  <div class="draft-body">${generatedDraft
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  }</div>
  <div class="disclaimer">
    ⚠ AI-generated draft. Always review with the advocate before filing.
  </div>
  <div class="actions">
    <button style="background:#2d6a4f;color:#fff" onclick="window.print()">🖨 Print / Save PDF</button>
    <button style="background:#f0ece4;color:#2c2417;border:1px solid #e2ddd4" onclick="window.close()">← Back</button>
  </div>
</body></html>`], { type: 'text/html;charset=utf-8' });
            win.location.href = URL.createObjectURL(blob);
          }}
          style={{ fontSize: 11, padding: "5px 12px",
            background: P.accent, color: "#fff", border: "none",
            borderRadius: 5, cursor: "pointer", fontFamily: "inherit" }}>
          🖨 Open Full Draft
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(generatedDraft)}
          style={{ fontSize: 11, padding: "5px 12px",
            background: P.s2, border: "1px solid " + P.border,
            borderRadius: 5, cursor: "pointer", fontFamily: "inherit",
            color: P.text }}>
          📋 Copy
        </button>
      </div>
    </div>

    {/* ── EDITABLE DRAFT BODY ── */}
    <textarea
      value={generatedDraft}
      onChange={e => setGeneratedDraft(e.target.value)}
      style={{
        width: "100%",
        fontFamily: "'Source Sans 3', system-ui, sans-serif",
        fontSize: 13,
        lineHeight: 2,
        background: "#fff",
        padding: "20px 24px",
        borderRadius: 8,
        color: "#1a1208",
        minHeight: 320,
        border: "1px solid " + P.border,
        outline: "none",
        resize: "vertical",
        boxSizing: "border-box" as const,
      }}
    />

    <div style={{ padding: "10px 13px", borderRadius: 7, fontSize: 11,
      marginTop: 10, background: P.goldL,
      border: "1px solid rgba(139,105,20,0.2)", color: P.gold }}>
      ✏ Edit directly above · ⚠ AI-generated — always review before filing.
    </div>
  </Card>
)}
        
     
  </div>
)}

      
    </div>
  );
}

// ── DEADLINES SCREEN ──
 
function Deadlines() {
  const [filterClient, setFilterClient] = useState("");
  const [filterCase, setFilterCase]     = useState("");

  const sorted = [...DEADLINES]
    .filter(d => {
      const matchClient = filterClient === "" ||
        d.client.toLowerCase().includes(filterClient.toLowerCase());
      const matchCase = filterCase === "" ||
        d.caseId.toLowerCase().includes(filterCase.toLowerCase());
      return matchClient && matchCase;
    })
    .sort((a, b) => a.days - b.days);

  const inputS: React.CSSProperties = {
    fontSize: 12, padding: "7px 11px",
    borderRadius: 7, border: "1px solid " + P.border,
    background: P.s1, color: P.text, outline: "none",
    fontFamily: "inherit",
  };
  const labelS: React.CSSProperties = {
    fontSize: 10, color: P.dim, marginBottom: 4,
    display: "block", textTransform: "uppercase",
    letterSpacing: "0.07em",
  };

  return (
    <div>
      <SectionTitle sub="All tracked deadlines · Google Calendar synced">
        Deadline Tracker
      </SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)",
        gap: 12, marginBottom: 20 }}>
        <StatBox label="Critical (<14 Days)"
          value={String(DEADLINES.filter(d=>d.days<14).length)}
          color={P.rose} sub="Immediate action needed" />
        <StatBox label="High (14–30 Days)"
          value={String(DEADLINES.filter(d=>d.days>=14&&d.days<=30).length)}
          color={P.gold} sub="Schedule this week" />
        <StatBox label="Calendar Synced"
          value={String(DEADLINES.filter(d=>d.cal).length)}
          color={P.accent} sub={"of " + DEADLINES.length + " total"} />
      </div>

      {/* ── Filter bar ── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap",
        alignItems: "flex-end", marginBottom: 16 }}>
        <div>
          <label style={labelS}>Client Name</label>
          <input value={filterClient}
            onChange={e => setFilterClient(e.target.value)}
            placeholder="e.g. Meena Reddy"
            style={{ ...inputS, width: 180 }} />
        </div>
        <div>
          <label style={labelS}>Case / Intake ID</label>
          <input value={filterCase}
            onChange={e => setFilterCase(e.target.value)}
            placeholder="e.g. CS-2024-089"
            style={{ ...inputS, width: 180 }} />
        </div>
        <button onClick={() => { setFilterClient(""); setFilterCase(""); }}
          style={{
            fontSize: 11, padding: "7px 14px", borderRadius: 7,
            border: "1px solid " + P.border,
            background: P.s2, color: P.muted,
            cursor: "pointer", fontFamily: "inherit",
          }}>✕ Clear</button>
        {(filterClient || filterCase) && (
          <div style={{ fontSize: 11, color: P.dim, alignSelf: "center" }}>
            {sorted.length} of {DEADLINES.length} deadlines
          </div>
        )}
      </div>

      {sorted.length === 0 && (
        <Card>
          <div style={{ textAlign: "center", padding: 24, color: P.dim, fontSize: 13 }}>
            No deadlines match your filters.
          </div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((d, i) => (
          <Card key={i} accentColor={d.uc}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center",
                  marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: P.ink }}>
                    {d.task}
                  </span>
                  <Pill label={d.type} color={P.dim} />
                </div>
                <div style={{ fontSize: 11.5, color: P.muted }}>
                  {d.client} · {d.caseId} · Due {d.due}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {d.cal
                  ? <span style={{ fontSize: 11, color: P.accent, fontWeight: 600 }}>
                      📅 Synced
                    </span>
                  : <button style={{ fontSize: 10.5, padding: "5px 12px",
                      background: P.s2, border: "1px solid " + P.border,
                      borderRadius: 5, cursor: "pointer", fontFamily: "inherit",
                      color: P.text }}>+ Add to Calendar</button>
                }
                <div style={{ background: d.uc + "14",
                  border: "1px solid " + d.uc + "28",
                  borderRadius: 8, padding: "8px 14px", textAlign: "center",
                  minWidth: 56 }}>
                  <div style={{ fontFamily: "'Lora', Georgia, serif",
                    fontSize: 24, fontWeight: 700, color: d.uc, lineHeight: 1 }}>
                    {d.days}
                  </div>
                  <div style={{ fontSize: 9, color: P.dim,
                    letterSpacing: "0.07em", textTransform: "uppercase" }}>
                    Days
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
 
// ── CALENDAR SCREEN ──
 
function CalendarView() {
  const [dbEvents, setDbEvents]       = useState<any[]>([]);
  const [dbCases, setDbCases]         = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    title: '', event_date: '', event_type: 'hearing',
    client_name: '', cnr_number: '', court: '', notes: '',
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Load calendar_events
        const { data: evData } = await supabase
          .from("calendar_events")
          .select("*")
          .order("event_date", { ascending: true });
        setDbEvents(evData || []);

        // Load cases with next_hearing
        const { data: caseData } = await supabase
          .from("cases")
          .select("*")
          .not("next_hearing", "is", null)
          .eq("status", "active");
        setDbCases(caseData || []);
      } catch { /* silently fall back to mock */ }
      setLoading(false);
    }
    load();
  }, []);

  // Build unified event list from all sources
  const allEvents = [
    ...dbCases.map(c => ({
      id:          "case-" + c.id,
      title:       (c.stage || "Hearing") + " — " + (c.suit || c.case_id || ""),
      event_date:  c.next_hearing,
      event_type:  "hearing",
      client_name: c.client || c.client_name,
      court:       c.court  || "",
      accentColor: typeColor(c.type || ""),
    })),
    ...dbEvents.map(e => ({
      ...e,
      accentColor: e.event_type === "deadline" ? P.rose
                 : e.event_type === "filing"   ? P.blue : P.teal,
    })),
    ...DEADLINES.map(d => ({
      id:          "dl-" + d.caseId,
      title:       d.task,
      event_date:  d.due,
      event_type:  d.type === "limitation" ? "deadline" : "hearing",
      client_name: d.client,
      court:       "",
      accentColor: d.uc,
    })),
  ].sort((a, b) =>
    new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );

  async function addEvent() {
    try {
      const { error } = await supabase
        .from("calendar_events")
        .insert([{ ...form, source: "manual" }]);
      if (error) throw error;
      setShowAddForm(false);
      const { data } = await supabase
        .from("calendar_events")
        .select("*")
        .order("event_date", { ascending: true });
      setDbEvents(data || []);
    } catch (err: any) { alert("Save failed: " + err.message); }
  }

  async function exportIcs() {
    try {
      const res  = await fetch('/api/calendar/export-ics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: allEvents }),
      });
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'aadya-hearings.ics'; a.click();
    } catch { alert("Export failed"); }
  }

 // Replace the hardcoded `days` array and the grid with this:
const today = new Date();
const year  = today.getFullYear();
const month = today.getMonth();
const [viewMonth, setViewMonth] = useState(month);
const [viewYear, setViewYear]   = useState(year);

const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
const monthName  = new Date(viewYear, viewMonth).toLocaleString("en-IN", { month: "long", year: "numeric" });

// Build calendar cells (empty + day numbers)
const cells = [
  ...Array(firstDay).fill(null),
  ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
];

// Check if a day has events
function eventsOnDay(day: number) {
  return allEvents.filter(e => {
    const d = new Date(e.event_date + "T00:00:00");
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth && d.getDate() === day;
  });
}

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 16 }}>
        <SectionTitle sub="Hearings, deadlines and events across all cases">
          Hearing Calendar
        </SectionTitle>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={exportIcs} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 16px", background: P.s1,
            border: "1px solid " + P.border, borderRadius: 8,
            fontSize: 12, fontWeight: 600, color: P.muted,
            cursor: "pointer", fontFamily: "inherit",
          }}>⬇ Export .ics</button>
          <button onClick={() => setShowAddForm(true)} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 16px", background: P.accent, border: "none",
            borderRadius: 8, fontSize: 12, fontWeight: 700,
            color: "#fff", cursor: "pointer", fontFamily: "inherit",
          }}>+ Add Event</button>
        </div>
      </div>

      {/* Mini calendar strip */}
      {/* Month nav */}
<div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
  <button onClick={() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }} style={{ background: "none", border: "1px solid " + P.border,
    borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 14, color: P.muted }}>‹</button>
  <span style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 16,
    fontWeight: 700, color: P.ink, minWidth: 160, textAlign: "center" }}>{monthName}</span>
  <button onClick={() => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }} style={{ background: "none", border: "1px solid " + P.border,
    borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 14, color: P.muted }}>›</button>
  <button onClick={() => { setViewMonth(month); setViewYear(year); }}
    style={{ fontSize: 11, color: P.accent, background: "none", border: "none",
      cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Today</button>
</div>

{/* Day headers */}
<div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
    <div key={d} style={{ fontSize: 9.5, fontWeight: 700, color: P.dim,
      textAlign: "center", letterSpacing: "0.07em", textTransform: "uppercase",
      padding: "4px 0" }}>{d}</div>
  ))}
</div>

{/* Calendar grid */}
<div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 20 }}>
  {cells.map((day, i) => {
    if (!day) return <div key={"empty-" + i} />;
    const isToday = day === today.getDate() && viewMonth === month && viewYear === year;
    const dayEvents = eventsOnDay(day);
    return (
      <div key={day} style={{
        background: isToday ? P.accentL : P.s1,
        border: "1px solid " + (isToday ? P.accent : P.border),
        borderRadius: 8, padding: "6px 4px", minHeight: 60,
        textAlign: "center",
      }}>
        <div style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 15,
          fontWeight: 700, color: isToday ? P.accent : P.ink }}>{day}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 3 }}>
          {dayEvents.slice(0, 2).map((ev, j) => (
            <div key={j} style={{
              fontSize: 8, fontWeight: 600, padding: "1px 4px",
              borderRadius: 3, background: (ev.accentColor || P.teal) + "20",
              color: ev.accentColor || P.teal,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{ev.title?.split("—")[0]?.trim() || ev.event_type}</div>
          ))}
          {dayEvents.length > 2 && (
            <div style={{ fontSize: 7, color: P.dim }}>+{dayEvents.length - 2} more</div>
          )}
        </div>
      </div>
    );
  })}
</div>

      {/* Events list */}
      <div style={{ fontSize: 9.5, fontWeight: 700, color: P.dim,
        letterSpacing: "0.1em", textTransform: "uppercase",
        marginBottom: 10 }}>Upcoming Events</div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 32, color: P.dim, fontSize: 13 }}>
          Loading calendar...
        </div>
      ) : allEvents.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: 24, color: P.dim, fontSize: 13 }}>
            No upcoming events. Add one using the button above.
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {allEvents.map((e, i) => {
            const d     = new Date(e.event_date + "T00:00:00");
            const color = e.accentColor || P.teal;
            return (
              <Card key={e.id || i} accentColor={color}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{
                    background: color + "18", border: "1px solid " + color + "30",
                    borderRadius: 8, padding: "8px 14px",
                    textAlign: "center", minWidth: 56, flexShrink: 0,
                  }}>
                    <div style={{ fontFamily: "'Lora', Georgia, serif",
                      fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>
                      {d.getDate()}
                    </div>
                    <div style={{ fontSize: 9, color: P.dim, marginTop: 2,
                      textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {d.toLocaleString("en-IN", { month: "short" })}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700,
                      color: P.ink, marginBottom: 2 }}>
                      {e.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: P.muted }}>
                      {e.client_name}{e.court ? " · " + e.court : ""}
                    </div>
                  </div>
                  <Pill label={(e.event_type || "HEARING").toUpperCase()} color={color} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Event slide-in panel — keep your existing JSX here unchanged */}
      {showAddForm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "flex-end",
        }} onClick={() => setShowAddForm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 420, height: "100vh", background: P.s1,
            borderLeft: "1px solid " + P.border,
            display: "flex", flexDirection: "column",
            boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
          }}>
            <div style={{
              padding: "20px 24px 16px", borderBottom: "1px solid " + P.border,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: P.accentL,
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: P.accent }}>
                  Add Calendar Event
                </div>
                <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>
                  Saved to Supabase · appears in all calendar views
                </div>
              </div>
              <button onClick={() => setShowAddForm(false)} style={{
                background: "none", border: "none", fontSize: 20,
                cursor: "pointer", color: P.muted, lineHeight: 1,
              }}>×</button>
            </div>
            <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
              {[
                { label:"Event Title *", field:"title",       type:"text",     placeholder:"e.g. Evidence Hearing — OS 1241" },
                { label:"Date *",        field:"event_date",  type:"date",     placeholder:"" },
                { label:"Client Name",   field:"client_name", type:"text",     placeholder:"e.g. Anand Murthy" },
                { label:"CNR Number",    field:"cnr_number",  type:"text",     placeholder:"e.g. KABC010051322015" },
                { label:"Court",         field:"court",       type:"text",     placeholder:"e.g. City Civil Court" },
                { label:"Notes",         field:"notes",       type:"textarea", placeholder:"Any notes..." },
              ].map(({ label: lbl, field, type, placeholder }) => (
                <div key={field} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: P.dim,
                    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>
                    {lbl}
                  </div>
                  {type === "textarea" ? (
                    <textarea rows={3}
                      value={(form as any)[field]}
                      onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                      placeholder={placeholder}
                      style={{ width:"100%", fontSize:12, padding:"8px 11px",
                        borderRadius:7, border:"1px solid "+P.border,
                        background:P.s2, color:P.text, outline:"none",
                        fontFamily:"inherit", resize:"vertical" }} />
                  ) : (
                    <input type={type}
                      value={(form as any)[field]}
                      onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                      placeholder={placeholder}
                      style={{ width:"100%", fontSize:12, padding:"8px 11px",
                        borderRadius:7, border:"1px solid "+P.border,
                        background:P.s2, color:P.text, outline:"none",
                        fontFamily:"inherit" }} />
                  )}
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize:10, fontWeight:700, color:P.dim,
                  letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>
                  Event Type
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {["hearing","deadline","filing","meeting"].map(t => (
                    <button key={t}
                      onClick={() => setForm(prev => ({ ...prev, event_type: t }))}
                      style={{
                        padding:"5px 14px", borderRadius:20,
                        fontSize:11, fontWeight:700, cursor:"pointer",
                        background: form.event_type === t ? P.accent : P.s1,
                        color: form.event_type === t ? "#fff" : P.muted,
                        border:"1px solid "+(form.event_type === t ? P.accent : P.border),
                        fontFamily:"inherit",
                      }}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding:"16px 24px", borderTop:"1px solid "+P.border,
              display:"flex", gap:10 }}>
              <button onClick={addEvent} style={{
                flex:1, padding:"10px", background:P.accent, color:"#fff",
                border:"none", borderRadius:8, fontSize:13, fontWeight:700,
                cursor:"pointer", fontFamily:"inherit",
              }}>Save Event</button>
              <button onClick={() => setShowAddForm(false)} style={{
                padding:"10px 20px", background:P.s2, color:P.text,
                border:"1px solid "+P.border, borderRadius:8,
                fontSize:13, cursor:"pointer", fontFamily:"inherit",
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DAILY CAUSE LIST SCREEN ──

function DailyCauseList({ nav }: { nav: (s: string, d?: any) => void }) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]  // today as YYYY-MM-DD
  );
  const [cases, setCases]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");  // all | court

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res  = await fetch(`/api/daily-cause-list?date=${selectedDate}`);
        const json = await res.json();
        setCases(json.cases ?? []);
      } catch { setCases([]); }
      setLoading(false);
    }
    load();
  }, [selectedDate]);

  // Get unique courts for filter tabs
  const courts = [...new Set(cases.map(c => c.court).filter(Boolean))];

  const filtered = filter === "all"
    ? cases
    : cases.filter(c => c.court === filter);

  // Stats
  const totalCases    = cases.length;
  const earliestTime  = cases.reduce((min, c) =>
    c.time && (!min || c.time < min) ? c.time : min, "");
  const uniqueCourts  = courts.length;

  // Format date for display
  const displayDate = new Date(selectedDate + "T00:00:00")
    .toLocaleDateString("en-IN", {
      weekday: "short", day: "numeric", month: "short", year: "numeric"
    });

  return (
    <div>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <BackLink onClick={() => nav("calendar")}>← Back to Calendar</BackLink>
          <h2 style={{ margin: 0, fontFamily: "'Lora', Georgia, serif",
            fontSize: 22, fontWeight: 700, color: P.ink }}>
            Daily Cause List
          </h2>
          <div style={{ fontSize: 12, color: P.dim, marginTop: 3 }}>
            All firm cases listed across Bengaluru courts on this date
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* SYNC badge */}
          <span style={{ fontSize: 9, fontWeight: 700,
            padding: "3px 10px", borderRadius: 10,
            background: P.accent, color: "#fff",
            letterSpacing: "0.08em" }}>SYNCED</span>
          {/* Date picker */}
          <input type="date" value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ fontSize: 12, padding: "6px 10px",
              borderRadius: 7, border: "1px solid " + P.border,
              background: P.s1, color: P.text, fontFamily: "inherit" }} />
          {/* Export button */}
          <button style={{
            padding: "7px 14px", background: P.blue, color: "#fff",
            border: "none", borderRadius: 7, fontSize: 11, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            📅 Export to Cal
          </button>
        </div>
      </div>

      {/* ── 3 Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        gap: 12, marginBottom: 20 }}>
        <StatBox label="Appearances Today"
          value={String(totalCases)}
          color={P.accent} sub="cases listed" />
        <StatBox label="Earliest Hearing"
          value={earliestTime || "—"}
          color={P.teal} sub={cases[0]?.court || ""} />
        <StatBox label="Courts to Visit"
          value={String(uniqueCourts)}
          color={P.blue} sub="across Bengaluru" />
        <div style={{
          background: P.accent, borderRadius: 10,
          padding: "16px 18px", color: "#fff",
        }}>
          <div style={{ fontSize: 9, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: 6, color: "rgba(255,255,255,0.7)" }}>
            Next Sync
          </div>
          <div style={{ fontFamily: "'Lora', Georgia, serif",
            fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>
            {new Date(new Date(selectedDate).getTime() + 86400000)
              .toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            {" · 6:00 AM"}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
            Auto-refreshed daily
          </div>
        </div>
      </div>

      {/* ── Court filter tabs ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14,
        alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: P.dim, marginRight: 4 }}>
          Court:
        </span>
        {["all", ...courts].map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: "4px 12px", borderRadius: 20,
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            background: filter === c ? P.accent : P.s1,
            color: filter === c ? "#fff" : P.muted,
            border: "1px solid " + (filter === c ? P.accent : P.border),
            fontFamily: "inherit",
          }}>
            {c === "all" ? "All Courts" : c}
          </button>
        ))}
      </div>

      {/* ── Table header ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr 1.4fr 1fr 1fr 0.7fr",
        gap: 8, padding: "10px 16px",
        background: P.accent, borderRadius: "8px 8px 0 0",
        marginBottom: 0,
      }}>
        {["CASE", "CLIENT", "COURT & HALL", "JUDGE", "PURPOSE", "ITEM #"].map(h => (
          <div key={h} style={{
            fontSize: 9.5, fontWeight: 700, color: "#fff",
            letterSpacing: "0.08em",
          }}>{h}</div>
        ))}
      </div>

      {/* ── Table rows ── */}
      {loading && (
        <div style={{ padding: 32, textAlign: "center",
          color: P.dim, background: P.s1, fontSize: 13 }}>
          Loading cause list...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ padding: 32, textAlign: "center",
          color: P.dim, background: P.s1,
          border: "1px solid " + P.border,
          borderTop: "none", borderRadius: "0 0 8px 8px",
          fontSize: 13 }}>
          No cases listed for {displayDate}.
        </div>
      )}

      <div style={{ border: "1px solid " + P.border,
        borderTop: "none", borderRadius: "0 0 8px 8px",
        overflow: "hidden" }}>
        {filtered.map((c, i) => (
          <div key={c.id || i} style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1.4fr 1fr 1fr 0.7fr",
            gap: 8, padding: "12px 16px",
            background: i % 2 === 0 ? P.s1 : P.s2,
            borderBottom: "1px solid " + P.border,
            alignItems: "center",
            cursor: "pointer",
            transition: "background 0.1s",
          }}
          onClick={() => nav("case-detail", c.caseObj)}
          onMouseEnter={e => e.currentTarget.style.background = P.accentL}
          onMouseLeave={e => e.currentTarget.style.background =
            i % 2 === 0 ? P.s1 : P.s2}
          >
            {/* Case number + type */}
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: P.ink }}>
                {c.suit}
              </div>
              <div style={{ fontSize: 10.5, color: P.muted, marginTop: 2 }}>
                {c.case_type}
              </div>
            </div>
            {/* Client */}
            <div style={{ fontSize: 12, color: P.text }}>{c.client_name}</div>
            {/* Court + Hall + Time */}
            <div>
              <div style={{ fontSize: 12, color: P.text }}>{c.court}</div>
              <div style={{ fontSize: 10.5, color: P.dim, marginTop: 2 }}>
                {c.hall && `Hall ${c.hall} · `}{c.time}
              </div>
            </div>
            {/* Judge */}
            <div style={{ fontSize: 11.5, color: P.muted }}>{c.judge}</div>
            {/* Purpose */}
            <div style={{ fontSize: 11.5, color: P.text }}>{c.purpose}</div>
            {/* Item number badge */}
            <div>
              {c.item_number && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  padding: "3px 10px", borderRadius: 5,
                  background: P.accentL, color: P.accent,
                  border: "1px solid " + P.accent + "30",
                }}>
                  Item {c.item_number}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── AI Insight for the Day ── */}
      {cases.length > 0 && (
        <div style={{
          marginTop: 20, padding: "16px 20px",
          background: P.blueL,
          border: "1px solid rgba(30,77,140,0.2)",
          borderRadius: 10,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: P.blue,
            marginBottom: 8 }}>
            🧠 AI Insight for the Day
          </div>
          <div style={{ fontSize: 12.5, color: P.text, lineHeight: 1.8 }}>
            You have {totalCases} appearances across {uniqueCourts} courts.
            {earliestTime && ` Start at ${earliestTime}.`}
            {" Plan your court order by location to avoid delays."}
          </div>
        </div>
      )}

    </div>
  );
}

 
// ── DOCUMENTS SCREEN ──
 
function Documents({ detail }: { detail?: any }) {

// Then initialize filterCase from detail if provided:
const [filterCase, setFilterCase] = useState(detail?.filterCase || "");
  const [parsing, setParsing] = useState<string | null>(null);   // doc id being parsed
  const [expanded, setExpanded] = useState<string | null>(null); // doc id expanded
  const [realDocs, setRealDocs]         = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filterClient, setFilterClient] = useState("");
  const [filterType, setFilterType]     = useState("all");
  const [dragging, setDragging]         = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [uploadMsg, setUploadMsg]       = useState<{text:string;ok:boolean}|null>(null);
  const [showForm, setShowForm]         = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadForm, setUploadForm]     = useState({
    client_id:"", client_name:"", case_number:"", doc_type:"",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const MOCK_DOCS = [
    { id:"mock-1", file_name:"Sale Deed — Suresh Gowda 1998.pdf",
      doc_type:"SALE DEED", file_size:"2.4 MB",
      created_at: new Date().toISOString(),
      case_number:"INT-041", client_name:"Suresh Gowda", client_id:"CLT-001",
      verified:true, ai_parsed:true, file_url:null, is_mock:true },
    { id:"mock-2", file_name:"EC_SureshGowda_1998-2026.pdf",
      doc_type:"ENCUMBRANCE", file_size:"890 KB",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      case_number:"INT-041", client_name:"Suresh Gowda", client_id:"CLT-001",
      verified:false, ai_parsed:false, file_url:null, is_mock:true },
    { id:"mock-3", file_name:"Cheque_MeenaReddy_bounce.jpg",
      doc_type:"CHEQUE", file_size:"340 KB",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      case_number:"INT-040", client_name:"Meena Reddy", client_id:"CLT-002",
      verified:true, ai_parsed:true, file_url:null, is_mock:true },
    { id:"mock-4", file_name:"Notice_RPAD_MeenaReddy.pdf",
      doc_type:"LEGAL NOTICE", file_size:"1.1 MB",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      case_number:"INT-040", client_name:"Meena Reddy", client_id:"CLT-002",
      verified:true, ai_parsed:true, file_url:null, is_mock:true },
    { id:"mock-5", file_name:"Plaint_OS1241_2024.pdf",
      doc_type:"PLAINT", file_size:"3.2 MB",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      case_number:"CS-2024-089", client_name:"Leena Madan K", client_id:"CLT-003",
      verified:true, ai_parsed:true, file_url:null, is_mock:true },
    { id:"mock-6", file_name:"WS_Defendant_OS1241.pdf",
      doc_type:"WRITTEN STATEMENT", file_size:"2.8 MB",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      case_number:"CS-2024-089", client_name:"Leena Madan K", client_id:"CLT-003",
      verified:false, ai_parsed:false, file_url:null, is_mock:true },
  ];

  async function loadDocs() {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents").select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setRealDocs(data);
    setLoading(false);
  }
  useEffect(() => { loadDocs(); }, []);

  const allDocs       = [...realDocs, ...MOCK_DOCS];
  const totalDocs     = allDocs.length;
  const aiParsed      = allDocs.filter(d => d.ai_parsed).length;
  const pendingReview = allDocs.filter(d => !d.verified).length;

  const docTypes = ["all", ...Array.from(
    new Set(allDocs.map(d => d.doc_type).filter(Boolean))
  )];

  const filtered = allDocs.filter(d => {
    const matchClient = filterClient === "" ||
      d.client_id?.toLowerCase().includes(filterClient.toLowerCase()) ||
      d.client_name?.toLowerCase().includes(filterClient.toLowerCase());
    const matchCase = filterCase === "" ||
      (d.case_number ?? "").toLowerCase().includes(filterCase.toLowerCase());
    const matchType = filterType === "all" || d.doc_type === filterType;
    return matchClient && matchCase && matchType;
  });

  function fmtDate(iso: string) {
    const d   = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / 86400000
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day:"numeric", month:"short" });
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault(); setDragging(true);
  }
  function onDragLeave() { setDragging(false); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) openForm(files);
  }
  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) openForm(files);
  }
  function openForm(files: File[]) {
    setPendingFiles(files);
    setUploadForm({ client_id:"", client_name:"", case_number:"", doc_type:"" });
    setShowForm(true);
  }

  async function uploadFiles() {
    if (!uploadForm.client_name.trim()) {
      setUploadMsg({ text:"Client name is required.", ok:false });
      return;
    }
    setUploading(true);
    setUploadMsg(null);
    let successCount = 0;
    for (const file of pendingFiles) {
      const clientId = uploadForm.client_id.trim() || "MANUAL";
      const filePath = `${clientId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("documents").upload(filePath, file);
      if (upErr) { console.error(upErr); continue; }
      const { data: urlData } = supabase.storage
        .from("documents").getPublicUrl(filePath);
      const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
      await supabase.from("documents").insert([{
        client_id:   uploadForm.client_id.trim() || null,
        client_name: uploadForm.client_name.trim(),
        case_number: uploadForm.case_number.trim() || null,
        doc_type:    uploadForm.doc_type || ext,
        file_name:   file.name,
        file_url:    urlData.publicUrl,
        verified:    false,
        ai_parsed:   false,
        created_at:  new Date().toISOString(),
      }]);
      successCount++;
    }
    setUploading(false);
    if (successCount > 0) {
      setUploadMsg({ text:`${successCount} file(s) uploaded!`, ok:true });
      setShowForm(false);
      setPendingFiles([]);
      await loadDocs();
      setTimeout(() => setUploadMsg(null), 3000);
    } else {
      setUploadMsg({ text:"Upload failed. Check console (F12).", ok:false });
    }
  }

  const inputS: React.CSSProperties = {
    fontSize:12, padding:"7px 11px",
    borderRadius:7, border:"1px solid " + P.border,
    background:P.s1, color:P.text, outline:"none",
    fontFamily:"inherit",
  };
  const labelS: React.CSSProperties = {
    fontSize:10, color:P.dim, marginBottom:4,
    display:"block", textTransform:"uppercase",
    letterSpacing:"0.07em",
  };
  async function parseDocument(doc: any) {
  if (!doc.file_url) {
    alert("No file URL available for this document.");
    return;
  }
  setParsing(doc.id);
  try {
    const res  = await fetch("/api/parse-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document_id: doc.id,
        file_url:    doc.file_url,
        doc_type:    doc.doc_type,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    // Refresh docs list to show updated ai_parsed status
    await loadDocs();
    setExpanded(doc.id); // auto-expand to show results
  } catch (err: any) {
    alert("Parse failed: " + err.message);
  } finally {
    setParsing(null);
  }
}

// Add this helper to render extracted fields
function ExtractedFields({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div style={{
      marginTop: 10, padding: "12px 14px",
      background: P.accentL,
      border: "1px solid rgba(45,106,79,0.15)",
      borderRadius: 8,
    }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: P.accent,
        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
        ✨ AI Extracted Fields
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
        {Object.entries(data).map(([key, val]) => (
          <div key={key} style={{ padding: "4px 0",
            borderBottom: "1px solid rgba(45,106,79,0.1)", fontSize: 11.5 }}>
            <span style={{ color: P.dim, textTransform: "capitalize",
              fontSize: 10 }}>
              {key.replace(/_/g, " ")}
            </span>
            <div style={{ color: P.text, fontWeight: 600, marginTop: 1 }}>
              {typeof val === "object"
                ? JSON.stringify(val, null, 1)
                : String(val) || "—"}
            </div>
          </div>
        ))}
      </div>
      
    </div>
    
  );
}

  // ── small inline pill matching the screenshot style ──
  function StatusPill({ verified, aiParsed: ap }: {
    verified: boolean; aiParsed: boolean;
  }) {
    return (
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        {verified
          ? <span style={{
              fontSize:11, padding:"3px 10px", borderRadius:20,
              border:"1px solid rgba(45,106,79,0.3)",
              color:P.accent, background:P.accentL,
              fontWeight:600, whiteSpace:"nowrap" as const,
            }}>✓ Verified</span>
          : <span style={{
              fontSize:11, padding:"3px 10px", borderRadius:20,
              border:"1px solid rgba(139,105,20,0.3)",
              color:P.gold, background:P.goldL,
              fontWeight:600,
            }}>Pending</span>
        }
        {ap && (
          <span style={{
            fontSize:11, padding:"3px 10px", borderRadius:20,
            border:"1px solid rgba(26,100,112,0.3)",
            color:P.teal, background:P.tealL,
            fontWeight:600, whiteSpace:"nowrap" as const,
          }}>✨ AI Parsed</span>
        )}
      </div>
    );
  }

  return (
    <div>
      <SectionTitle sub="All uploaded documents · AI parsing enabled">
        Document Vault
      </SectionTitle>

      {/* ── Stat cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
        gap:12, marginBottom:20 }}>
        <StatBox label="Total Documents" value={String(totalDocs)}
          color={P.blue} sub="Across all cases" />
        <StatBox label="AI Parsed" value={String(aiParsed)}
          color={P.teal} sub="Key fields extracted" />
        <StatBox label="Pending Review" value={String(pendingReview)}
          color={P.gold} sub="Needs verification" />
      </div>

      {/* ── Filter bar ── */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap",
        alignItems:"flex-end", marginBottom:16 }}>
        <div>
          <label style={labelS}>Client ID or Name</label>
          <input value={filterClient}
            onChange={e => setFilterClient(e.target.value)}
            placeholder="e.g. CLT-001 or Suresh"
            style={{ ...inputS, width:180 }} />
        </div>
        <div>
          <label style={labelS}>Case Number</label>
          <input value={filterCase}
            onChange={e => setFilterCase(e.target.value)}
            placeholder="e.g. INT-041"
            style={{ ...inputS, width:150 }} />
        </div>
        <div>
          <label style={labelS}>Document Type</label>
          <select value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{ ...inputS, width:160, cursor:"pointer" }}>
            {docTypes.map(t => (
              <option key={t} value={t}>
                {t === "all" ? "All Types" : t}
              </option>
            ))}
          </select>
        </div>
        <button onClick={() => {
          setFilterClient(""); setFilterCase(""); setFilterType("all");
        }} style={{
          fontSize:11, padding:"7px 14px", borderRadius:7,
          border:"1px solid " + P.border,
          background:P.s2, color:P.muted,
          cursor:"pointer", fontFamily:"inherit",
        }}>✕ Clear</button>
      </div>

      {/* ── Upload message ── */}
      {uploadMsg && (
        <div style={{
          fontSize:12, fontWeight:600, padding:"10px 14px",
          borderRadius:8, marginBottom:12,
          background: uploadMsg.ok ? P.accentL : P.roseL,
          color: uploadMsg.ok ? P.accent : P.rose,
          border:"1px solid " + (uploadMsg.ok
            ? "rgba(45,106,79,0.2)" : "rgba(166,50,50,0.2)"),
        }}>{uploadMsg.text}</div>
      )}

      {/* ── Document list — clean rows like screenshot ── */}
      {loading && (
        <div style={{ textAlign:"center", padding:32,
          color:P.dim, fontSize:13 }}>
          Loading documents...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign:"center", padding:32, color:P.dim,
          fontSize:13, background:P.s1,
          border:"1px solid " + P.border, borderRadius:10,
        }}>
          No documents match your filters.
        </div>
      )}

      {/* Outer container — single bordered box like screenshot */}
      {filtered.length > 0 && (
        <div style={{
          background:P.s1,
          border:"1px solid " + P.border,
          borderRadius:10, overflow:"hidden",
          marginBottom:16,
        }}>
          {filtered.map((d, i) => (
            <div key={d.id || i} style={{
              display:"flex", justifyContent:"space-between",
              alignItems:"center",
              padding:"13px 18px",
              borderLeft: "3px solid " + P.accent,
              borderBottom: i < filtered.length - 1
                ? "1px solid " + P.border : "none",
              background: i % 2 === 0 ? P.s1 : P.s2,
              transition:"background 0.1s",
            }}
            onMouseEnter={e =>
              e.currentTarget.style.background = P.accentL}
            onMouseLeave={e =>
              e.currentTarget.style.background =
                i % 2 === 0 ? P.s1 : P.s2}
            >
              {/* Left: icon + name + meta */}
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                {/* File icon */}
                <div style={{
                  width:32, height:32, borderRadius:6,
                  background: P.accentL,
                  border:"1px solid rgba(45,106,79,0.15)",
                  display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:15, flexShrink:0,
                }}>📄</div>
                <div>
                  {/* Filename + DEMO badge */}
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ fontSize:13, fontWeight:700,
                      color:P.ink }}>
                      {d.file_name}
                    </span>
                    {d.is_mock && (
                      <span style={{
                        fontSize:9, fontWeight:700,
                        padding:"2px 6px", borderRadius:8,
                        background:P.goldL, color:P.gold,
                        border:"1px solid rgba(139,105,20,0.25)",
                        letterSpacing:"0.05em",
                      }}>DEMO</span>
                    )}
                  </div>
                  {/* Meta row — exactly like screenshot */}
                  <div style={{ fontSize:11, color:P.dim,
                    marginTop:2, letterSpacing:"0.01em" }}>
                    {d.doc_type}
                    {d.file_size && ` · ${d.file_size}`}
                    {` · ${fmtDate(d.created_at)}`}
                    {d.case_number && ` · ${d.case_number}`}
                  </div>
                </div>
              </div>

              {/* Right: status pills + buttons */}
                <div style={{ display: "flex", flexDirection: "column",
                  gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
                  
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <StatusPill verified={d.verified} aiParsed={d.ai_parsed} />
                    
                    {/* Parse button — only for real docs with a file_url */}
                    {!d.is_mock && d.file_url && !d.ai_parsed && (
                      <button
                        onClick={() => parseDocument(d)}
                        disabled={parsing === d.id}
                        style={{
                          fontSize: 11, padding: "5px 14px",
                          background: parsing === d.id ? P.border : P.blueL,
                          border: "1px solid rgba(30,77,140,0.25)",
                          borderRadius: 5, cursor: parsing === d.id ? "not-allowed" : "pointer",
                          fontFamily: "inherit", color: P.blue, fontWeight: 600,
                        }}>
                        {parsing === d.id ? "Parsing…" : "✨ Parse"}
                      </button>
                    )}

                    {/* Expand/collapse parsed data */}
                    {d.ai_parsed && d.ai_extracted && (
                      <button
                        onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                        style={{
                          fontSize: 11, padding: "5px 14px",
                          background: P.accentL,
                          border: "1px solid rgba(45,106,79,0.2)",
                          borderRadius: 5, cursor: "pointer",
                          fontFamily: "inherit", color: P.accent, fontWeight: 600,
                        }}>
                        {expanded === d.id ? "Hide ▲" : "View Fields ▼"}
                      </button>
                    )}
                    {/* Verify button — shows after AI parsing, before verification */}
                    {!d.is_mock && d.ai_parsed && !d.verified && (
                      <button
                        onClick={async () => {
                          await supabase
                            .from("documents")
                            .update({ verified: true })
                            .eq("id", d.id);
                          await loadDocs();
                        }}
                        style={{
                          fontSize: 11, padding: "5px 14px",
                          background: P.accentL,
                          border: "1px solid rgba(45,106,79,0.25)",
                          borderRadius: 5, cursor: "pointer",
                          fontFamily: "inherit", color: P.accent, fontWeight: 600,
                        }}>
                        ✓ Verify
                      </button>
                    )}

                    {/* View file */}
                    {d.file_url ? (
                      <a href={d.file_url} target="_blank" rel="noopener noreferrer"
                        style={{ textDecoration: "none" }}>
                        <button style={{
                          fontSize: 11, padding: "5px 14px",
                          background: P.s1, border: "1px solid " + P.border,
                          borderRadius: 5, cursor: "pointer",
                          fontFamily: "inherit", color: P.text,
                        }}>View</button>
                      </a>
                    ) : (
                      <button disabled style={{
                        fontSize: 11, padding: "5px 14px",
                        background: P.s2, border: "1px solid " + P.border,
                        borderRadius: 5, cursor: "not-allowed",
                        fontFamily: "inherit", color: P.dim,
                      }}>View</button>
                    )}
                  </div>

                  {/* Expanded extracted fields */}
                  {expanded === d.id && d.ai_extracted && (
                    <div style={{ width: "100%", maxWidth: 500 }}>
                      <ExtractedFields data={d.ai_extracted} />
                    </div>
                  )}
                </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Drop zone ── */}
      <input ref={fileRef} type="file" multiple
        style={{ display:"none" }} onChange={onFileSelect} />

      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{
          border:"2px dashed " + (dragging ? P.accent : P.border),
          borderRadius:10, padding:28, textAlign:"center",
          cursor:"pointer", transition:"all 0.15s",
          background: dragging ? P.accentL : "transparent",
        }}
      >
        <div style={{ fontSize:22, marginBottom:8 }}>📎</div>
        <div style={{ fontSize:14,
          color: dragging ? P.accent : P.muted,
          fontWeight: dragging ? 600 : 400 }}>
          {dragging
            ? "Drop to upload"
            : "Drop documents here or click to upload"}
        </div>
        <div style={{ fontSize:11, color:P.dim, marginTop:4 }}>
          PDF, JPG, PNG supported · AI will auto-extract key fields
        </div>
      </div>

      {/* ── Upload slide-in panel ── */}
      {showForm && (
        <div style={{
          position:"fixed", inset:0, zIndex:1000,
          background:"rgba(0,0,0,0.4)",
          display:"flex", alignItems:"center",
          justifyContent:"flex-end",
        }} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width:420, height:"100vh", background:P.s1,
            borderLeft:"1px solid " + P.border,
            display:"flex", flexDirection:"column",
            boxShadow:"-8px 0 32px rgba(0,0,0,0.12)",
          }}>
            <div style={{
              padding:"20px 24px 16px",
              borderBottom:"1px solid " + P.border,
              background:P.accentL,
              display:"flex", justifyContent:"space-between",
              alignItems:"center",
            }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:P.accent }}>
                  Upload Documents
                </div>
                <div style={{ fontSize:11, color:P.muted, marginTop:2 }}>
                  {pendingFiles.length} file
                  {pendingFiles.length !== 1 ? "s" : ""} selected
                </div>
              </div>
              <button onClick={() => setShowForm(false)} style={{
                background:"none", border:"none", fontSize:20,
                cursor:"pointer", color:P.muted, lineHeight:1,
              }}>×</button>
            </div>

            <div style={{
              padding:"12px 24px",
              borderBottom:"1px solid " + P.border,
              background:P.s2,
            }}>
              {pendingFiles.map((f, i) => (
                <div key={i} style={{
                  fontSize:11.5, color:P.text, padding:"4px 0",
                  borderBottom: i < pendingFiles.length - 1
                    ? "1px solid " + P.border : "none",
                }}>
                  📄 {f.name}
                  <span style={{ color:P.dim, marginLeft:8 }}>
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              ))}
            </div>

            <div style={{ padding:"20px 24px", flex:1, overflowY:"auto" }}>
              {[
                { label:"Client ID",     field:"client_id",
                  placeholder:"e.g. CLT-001" },
                { label:"Client Name *", field:"client_name",
                  placeholder:"e.g. Suresh Gowda" },
                { label:"Case Number",   field:"case_number",
                  placeholder:"e.g. OS 1241/2024" },
              ].map(({ label: lbl, field, placeholder }) => (
                <div key={field} style={{ marginBottom:14 }}>
                  <label style={labelS}>{lbl}</label>
                  <input
                    value={(uploadForm as any)[field]}
                    onChange={e => setUploadForm(prev =>
                      ({ ...prev, [field]: e.target.value }))}
                    placeholder={placeholder}
                    style={{ ...inputS, width:"100%" }}
                  />
                </div>
              ))}
              <div style={{ marginBottom:14 }}>
                <label style={labelS}>Document Type</label>
                <select
                  value={uploadForm.doc_type}
                  onChange={e => setUploadForm(prev =>
                    ({ ...prev, doc_type: e.target.value }))}
                  style={{ ...inputS, width:"100%", cursor:"pointer" }}>
                  <option value="">— Auto-detect from file —</option>
                  {["SALE DEED","GIFT DEED","ENCUMBRANCE","LEGAL NOTICE",
                    "CHEQUE","PLAINT","WRITTEN STATEMENT","AFFIDAVIT",
                    "VAKALATNAMA","ORDER","JUDGMENT","OTHER",
                  ].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ padding:"16px 24px",
              borderTop:"1px solid " + P.border,
              display:"flex", gap:10 }}>
              <button onClick={uploadFiles} disabled={uploading} style={{
                flex:1, padding:"10px",
                background: uploading ? P.border : P.accent,
                color: uploading ? P.muted : "#fff",
                border:"none", borderRadius:8,
                fontSize:13, fontWeight:700,
                cursor: uploading ? "not-allowed" : "pointer",
                fontFamily:"inherit",
              }}>
                {uploading ? "Uploading..." : "Upload Files"}
              </button>
              <button onClick={() => setShowForm(false)} style={{
                padding:"10px 20px", background:P.s2, color:P.text,
                border:"1px solid " + P.border, borderRadius:8,
                fontSize:13, cursor:"pointer", fontFamily:"inherit",
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AI DRAFTS SCREEN ──
 
function AIDrafts() {
  const [selected, setSelected] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
 
  const templates = [
    {name:"Legal Notice",icon:"⚖️",desc:"NI Act / Contract / Property notice",color:P.accent},
    {name:"Vakalatnama",icon:"📜",desc:"Power of attorney for court representation",color:P.teal},
    {name:"Plaint Draft",icon:"📋",desc:"Civil suit plaint with cause of action",color:P.blue},
    {name:"Reply to Notice",icon:"✉️",desc:"Structured reply to legal notice received",color:P.gold},
    {name:"Affidavit",icon:"📝",desc:"Sworn affidavit for court proceedings",color:P.rose},
    {name:"Title Opinion",icon:"🏠",desc:"Legal opinion on property title chain",color:P.accent},
  ];
 
  function generate() {
    setGenerating(true);
    setDraft(null);
    setTimeout(() => {
      setGenerating(false);
      setDraft("BEFORE THE HON'BLE JUDICIAL MAGISTRATE FIRST CLASS\nBANGALORE URBAN DISTRICT\n\nIN THE MATTER OF:\n[Client Name], residing at [Address] — COMPLAINANT\n\nVERSUS\n\n[Accused Name], residing at [Address] — ACCUSED\n\nCOMPLAINT UNDER SECTION 138 NI ACT, 1881\n\n1. That the complainant is a businessperson.\n2. That the accused issued Cheque No. [XXX] for Rs.[Amount].\n3. The cheque was dishonoured on [Date] — Insufficient Funds.\n4. Statutory notice was sent. Accused failed to pay.\n\nPRAYER: Take cognizance and punish the accused u/s 138.\n\nDate: " + new Date().toLocaleDateString("en-IN"));
    }, 1600);
  }
 
  return (
    <div>
      <SectionTitle sub="AI-assisted legal document drafting · Always review before use">
        AI Drafting Assistant
      </SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)",
        gap: 10, marginBottom: 20 }}>
        {templates.map((t, i) => (
          <div key={i} onClick={() => { setSelected(t.name); setDraft(null); }}
            style={{
              background: selected === t.name ? P.s2 : P.s1,
              border: selected === t.name
                ? "1.5px solid " + t.color : "1px solid " + P.border,
              borderRadius: 10, padding: 16, cursor: "pointer",
              transition: "all 0.12s",
            }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{t.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: P.ink }}>{t.name}</div>
            <div style={{ fontSize: 11, color: P.muted, marginTop: 3 }}>{t.desc}</div>
          </div>
        ))}
      </div>
      {selected && (
        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12,
            color: templates.find(t=>t.name===selected)?.color || P.accent }}>
            Generate: {selected}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 10, marginBottom: 12 }}>
            {["Client Name","Opposing Party","Case / Reference","Key Amount"].map(l => (
              <div key={l}>
                <div style={{ fontSize: 10, color: P.dim, marginBottom: 4,
                  textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</div>
                <input placeholder={"e.g. " + (l === "Key Amount" ? "Rs.4.2L" : "Enter " + l)}
                  style={{ width: "100%", fontSize: 12, padding: "8px 11px",
                    borderRadius: 7, border: "1px solid " + P.border,
                    background: P.s2, color: P.text, outline: "none",
                    fontFamily: "inherit" }} />
              </div>
            ))}
          </div>
          <button onClick={generate} disabled={generating} style={{
            padding: "8px 20px",
            background: generating ? P.border : (templates.find(t=>t.name===selected)?.color || P.accent),
            color: generating ? P.muted : "#fff",
            border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700,
            cursor: generating ? "not-allowed" : "pointer", fontFamily: "inherit",
          }}>{generating ? "Generating…" : "✨ Generate Draft"}</button>
        </Card>
      )}
      {draft && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between",
            marginBottom: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: P.accent }}>
              ✓ Draft Generated — Review before use
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ fontSize: 11, padding: "5px 12px",
                background: P.s2, border: "1px solid " + P.border,
                borderRadius: 5, cursor: "pointer", fontFamily: "inherit",
                color: P.text }}>📋 Copy</button>
              <button style={{ fontSize: 11, padding: "5px 12px",
                background: P.s2, border: "1px solid " + P.border,
                borderRadius: 5, cursor: "pointer", fontFamily: "inherit",
                color: P.text }}>📄 Export PDF</button>
            </div>
          </div>
          <pre style={{ fontFamily: "'Courier New', monospace", fontSize: 11.5,
            lineHeight: 1.8, whiteSpace: "pre-wrap", background: P.s2,
            padding: 14, borderRadius: 8, color: P.text,
            border: "1px solid " + P.border }}>{draft}</pre>
          <div style={{ padding: "10px 13px", borderRadius: 7, fontSize: 11,
            marginTop: 10, background: P.goldL,
            border: "1px solid rgba(139,105,20,0.2)", color: P.gold }}>
            ⚠ This is an AI-generated draft. Always review with the advocate before filing.
          </div>
        </Card>
      )}
    </div>
  );
}
 
// ── TOOLS SCREEN ──
 
function Tools() {
  const [sdType, setSdType] = useState("sale");
  const [stampVal, setStampVal] = useState("");
  const [stampResult, setStampResult] = useState<string | null>(null);
  const [ecourtInput, setEcourtInput] = useState("");
  const [ecourtResult, setEcourtResult] = useState<string | null>(null);
 
  function calcStamp(val: string) {
    setStampVal(val);
    const v = parseFloat(val);
    if (!v || isNaN(v)) { setStampResult(null); return; }
    const r = sdType === "sale" ? 0.055 : sdType === "gift" ? 0.045 : 0.04;
    setStampResult("Rs. " + Math.round(v * r).toLocaleString("en-IN"));
  }
 
  function checkEcourt() {
    if (!ecourtInput.trim()) return;
    setEcourtResult("Fetching...");
    setTimeout(() => {
      setEcourtResult("✓ " + ecourtInput + " — Next date: Apr 22, 2026 (Evidence) · City Civil Court Room 7");
    }, 900);
  }
 
  const inputS: React.CSSProperties = {
    width: "100%", fontSize: 12, padding: "8px 11px",
    borderRadius: 7, border: "1px solid " + P.border,
    background: P.s2, color: P.text, outline: "none", fontFamily: "inherit",
  };
  const limRows = [
    {title:"Property Title Dispute",sub:"3 years from right accrues",tag:"Art. 58",color:P.blue},
    {title:"Possession / Encroachment",sub:"12 years from dispossession",tag:"Art. 65",color:P.blue},
    {title:"Cheque Bounce (NI Act)",sub:"30 days from cause of action",tag:"S.142",color:P.rose},
    {title:"RERA Complaint",sub:"1 year from possession/defect",tag:"RERA S.31",color:P.gold},
    {title:"Contract Breach",sub:"3 years from breach date",tag:"Art. 55",color:P.blue},
  ];
  const courtFees = [
    ["Up to Rs.1,000","Rs.20 flat"],
    ["Rs.1,001 – Rs.10,000","3% of claim"],
    ["Rs.10,001 – Rs.1,00,000","2.5% of claim"],
    ["Rs.1,00,001 – Rs.5,00,000","2% of claim"],
    ["Above Rs.5,00,000","1.5% of claim"],
  ];
 
  return (
    <div>
      <SectionTitle sub="Calculators and quick-reference tools for Karnataka practice">
        Practice Tools
      </SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
 
        {/* Stamp Duty Calculator */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: P.ink, marginBottom: 4 }}>
            🧮 Stamp Duty Calculator
          </div>
          <div style={{ fontSize: 11, color: P.muted, marginBottom: 14 }}>
            Karnataka registration charges (2026 rates)
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: P.dim, marginBottom: 6,
              textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Transaction Type
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["sale","gift","lease"].map(t => (
                <button key={t} onClick={() => { setSdType(t); calcStamp(stampVal); }}
                  style={{
                    padding: "5px 14px", borderRadius: 20,
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                    background: sdType === t ? P.accent : P.s1,
                    color: sdType === t ? "#fff" : P.muted,
                    border: "1px solid " + (sdType === t ? P.accent : P.border),
                    fontFamily: "inherit",
                  }}>
                  {t === "sale" ? "Sale Deed" : t === "gift" ? "Gift Deed" : "Lease"}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: P.dim, marginBottom: 4,
              textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Property Value (Rs.)
            </div>
            <input type="number" placeholder="e.g. 5000000"
              value={stampVal}
              onChange={e => calcStamp(e.target.value)}
              style={inputS} />
          </div>
          {stampResult && (
            <div style={{ background: P.accentL, border: "1px solid rgba(45,106,79,0.2)",
              borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 9.5, color: P.dim, marginBottom: 4,
                textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Estimated Stamp Duty
              </div>
              <div style={{ fontFamily: "'Lora', Georgia, serif",
                fontSize: 28, fontWeight: 700, color: P.accent }}>
                {stampResult}
              </div>
              <div style={{ fontSize: 10, color: P.muted, marginTop: 4 }}>
                + 1% Registration fee · Consult for exact figures
              </div>
            </div>
          )}
        </Card>
 
        {/* Limitation Reference */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: P.ink, marginBottom: 4 }}>
            ⏳ Limitation Quick Reference
          </div>
          <div style={{ fontSize: 11, color: P.muted, marginBottom: 14 }}>
            Key periods under Limitation Act, 1963
          </div>
          {limRows.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "5px 0",
              borderBottom: i < limRows.length - 1 ? "1px solid " + P.border : "none" }}>
              <div>
                <div style={{ fontSize: 11.5, color: P.ink, fontWeight: 600 }}>
                  {r.title}
                </div>
                <div style={{ fontSize: 10, color: P.muted }}>{r.sub}</div>
              </div>
              <Pill label={r.tag} color={r.color} />
            </div>
          ))}
        </Card>

        {/* eCourts */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: P.ink, marginBottom: 4 }}>
            📡 eCourts Case Status
          </div>
          <div style={{ fontSize: 11, color: P.muted, marginBottom: 12 }}>
            Pull live status from eCourts API
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: P.dim, marginBottom: 4,
              textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Suit Number
            </div>
            <input placeholder="e.g. OS 1241/2024"
              value={ecourtInput}
              onChange={e => setEcourtInput(e.target.value)}
              style={inputS} />
          </div>
          <button onClick={checkEcourt} style={{
            padding: "7px 16px", background: P.teal, color: "#fff",
            border: "none", borderRadius: 7, fontSize: 12,
            cursor: "pointer", fontFamily: "inherit",
          }}>🔍 Check Status</button>
          {ecourtResult && (
            <div style={{ marginTop: 12, padding: "10px 12px",
              background: P.tealL, border: "1px solid rgba(26,100,112,0.2)",
              borderRadius: 6, fontSize: 11.5, color: P.teal }}>
              {ecourtResult}
            </div>
          )}
        </Card>
 
        {/* Court Fee Reference */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: P.ink, marginBottom: 4 }}>
            🏛 Court Fee Reference
          </div>
          <div style={{ fontSize: 11, color: P.muted, marginBottom: 14 }}>
            Karnataka Court Fees Act (ad valorem)
          </div>
          {courtFees.map(([range, fee], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between",
              padding: "5px 0",
              borderBottom: i < courtFees.length - 1 ? "1px solid " + P.border : "none",
              fontSize: 11.5 }}>
              <span style={{ color: P.muted }}>{range}</span>
              <span style={{ color: P.ink, fontWeight: 700 }}>{fee}</span>
            </div>
          ))}
        </Card>
 
        
      </div>
    </div>
  );
}

// ── SIDEBAR NAV ITEMS ──
 
const NAV_ITEMS: NavItem[] = [
  { key: "overview",    label: "Overview",        icon: "◉" },
  { key: "enquiries",   label: "New Enquiries",   icon: "🆕"},
  { key: "add-client",  label: "Add Client",      icon: "✍️" },
  { key: "intake",      label: "Intake Briefs",   icon: "📋", badge: 2 },
  { key: "cases",       label: "Cases",           icon: "⚖️" },
  { key: "deadlines",   label: "Deadlines",       icon: "⏰", badge: 2 },
  { key: "calendar",    label: "Calendar",        icon: "📅" },
  { key: "documents",   label: "Documents",       icon: "📂" },
  { key: "ai-drafts",   label: "AI Drafts",       icon: "✨" },
  { key: "tools",       label: "Tools",           icon: "🧮" },
];
 
const BREADCRUMB: Record<string,string> = {
  overview:      "Overview",
  enquiries:     "New Enquiries",
  "add-client":  "Add Client",
  intake:        "Intake Briefs",
  "intake-detail": "Intake Briefs › Detail",
  cases:         "Cases",
  "case-detail": "Cases › Detail",
  deadlines:     "Deadline Tracker",
  calendar:      "Hearing Calendar",
  documents:     "Document Vault",
  "ai-drafts":   "AI Drafts",
  tools:         "Practice Tools",
  "daily-cause-list":  "Calendar › Daily Cause List",   // ← ADD
  "calendar-hearings": "Calendar › Hearings",           // ← ADD

};
// ── MAIN APP — default export ──
 
export default function App() {
  const [screen, setScreen] = useState("overview");
  const [detail, setDetail] = useState<any>(null);
  const [entries, setEntries] = useState<IntakeBrief[]>([]);
 
  // Fetch live count from Supabase for the Overview stat card
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("intake_briefs")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setEntries(data as IntakeBrief[]);
    })();
  }, []);

  useEffect(() => {
    function handleBriefAction(e: MessageEvent) {
      if (e.data?.action === 'open_drafts')       nav('ai-drafts');
      if (e.data?.action === 'draft_notice')      nav('ai-drafts');
      if (e.data?.action === 'draft_application') nav('ai-drafts');
      if (e.data?.action === 'draft_execution')   nav('ai-drafts');
    }
    window.addEventListener('message', handleBriefAction);
    return () => window.removeEventListener('message', handleBriefAction);
  }, []);

 
  function nav(sc: string, data?: any) {
    setScreen(sc);
    setDetail(data || null);
    // Scroll content area back to top on navigation
    const el = document.getElementById("content-area");
    if (el) el.scrollTop = 0;
  }
 
  function renderScreen() {
    switch (screen) {
      case "overview":      return <Overview nav={nav} entries={entries} />;
      case "enquiries":     return <NewEnquiries nav={nav} />;
      case "add-client":    return <AddClient />;
      case "intake":        return <IntakeList nav={nav} />;
      case "intake-detail": return detail
        ? <IntakeDetail item={detail} nav={nav} />
        : <IntakeList nav={nav} />;
      case "cases":         return <CaseList nav={nav} />;
      case "case-detail":   return detail
        ? <CaseDetail item={detail} nav={nav} />
        : <CaseList nav={nav} />;
      case "deadlines":     return <Deadlines />;
      case "calendar":      return <CalendarView />;
      case "documents": return <Documents detail={detail} />;
      case "ai-drafts":     return <AIDrafts />;
      case "tools":         return <Tools />;
      default:              return <Overview nav={nav} entries={entries} />;
      case "daily-cause-list": return <DailyCauseList nav={nav} />;
      case "calendar-hearings": return <CalendarView />;  

    }
  }
 
  const activeBase = screen === "daily-cause-list" || screen === "calendar-hearings"
  ? "calendar"
  : screen.split("-")[0];

 
  return (
    <div style={{ display: "flex", height: "100vh",
      background: P.bg,
      fontFamily: "'Source Sans 3', 'Noto Sans', system-ui, sans-serif",
      color: P.text, overflow: "hidden" }}>
 
      
      
 
      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width: 200, minWidth: 200, background: P.s1,
        borderRight: "1px solid " + P.border,
        display: "flex", flexDirection: "column",
        height: "100vh", overflowY: "auto", flexShrink: 0 }}>
 
        <div style={{ padding: "20px 18px 16px",
          borderBottom: "1px solid " + P.border }}>
          <div style={{ fontFamily: "'Lora', Georgia, serif",
            fontSize: 17, fontWeight: 700, color: P.accent,
            letterSpacing: "-0.01em" }}>
            Aadya Law
          </div>
          <div style={{ fontSize: 9.5, color: P.dim,
            letterSpacing: "0.08em", marginTop: 3, textTransform: "uppercase" }}>
            Powered by AITurf
          </div>
        </div>
 
        <nav style={{ padding: "8px 0", flex: 1 }}>
  {NAV_ITEMS.map(item => {
    const isActive = activeBase === item.key || screen === item.key;
    const isCalendar = item.key === "calendar";
    const calendarOpen = screen === "calendar" || screen === "daily-cause-list"
                       || screen === "calendar-hearings";
    return (
      <div key={item.key}>
        {/* Main nav item */}
        <div onClick={() => nav(item.key)}
          style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "9px 16px", cursor: "pointer",
            background: isActive ? P.accentL : "transparent",
            borderLeft: isActive
              ? "2px solid " + P.accent : "2px solid transparent",
            transition: "all 0.13s",
          }}
          onMouseEnter={e => {
            if (!isActive) e.currentTarget.style.background = P.s2;
          }}
          onMouseLeave={e => {
            if (!isActive) e.currentTarget.style.background = "transparent";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 13, width: 16, textAlign: "center" }}>
              {item.icon}
            </span>
            <span style={{ fontSize: 12.5,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? P.accent : P.muted }}>
              {item.label}
              {isCalendar && (
                <span style={{ marginLeft: 4, fontSize: 10, color: P.dim }}>
                  {calendarOpen ? "▾" : "▸"}
                </span>
              )}
            </span>
          </div>
          {/* badges ... keep existing badge logic here */}
        </div>

        {/* Calendar sub-items — only show when calendar is active */}
        {isCalendar && calendarOpen && (
          <div style={{ paddingLeft: 32 }}>
            {[
              { key: "calendar",           label: "Monthly View",     dot: true },
              { key: "calendar-hearings",  label: "Hearings",         dot: false },
              { key: "daily-cause-list",   label: "Daily Cause List", dot: false },
            ].map(sub => (
              <div key={sub.key}
                onClick={() => nav(sub.key)}
                style={{
                  padding: "6px 12px", cursor: "pointer",
                  fontSize: 12, color: screen === sub.key ? P.accent : P.muted,
                  fontWeight: screen === sub.key ? 600 : 400,
                  display: "flex", alignItems: "center", gap: 6,
                  borderRadius: 5,
                  background: screen === sub.key ? P.accentL : "transparent",
                }}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: screen === sub.key ? P.accent : P.border,
                  display: "inline-block", flexShrink: 0,
                }} />
                {sub.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  })}
</nav>

 
        <div style={{ padding: "14px 18px",
          borderTop: "1px solid " + P.border }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: P.muted,
            marginBottom: 3 }}>Office Hours</div>
          <div style={{ fontSize: 10.5, color: P.dim, lineHeight: 1.6 }}>
            Mon–Sat · 9:00 AM–4:00 PM<br />Basavanagudi, Bangalore
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6,
            marginTop: 8, fontSize: 10.5, color: P.muted }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%",
              background: P.accent, display: "inline-block" }} />
            Bot active · 24/7
          </div>
        </div>
      </div>
 
      {/* ── RIGHT CONTENT AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column",
        overflow: "hidden" }}>
 
        {/* Top bar */}
        <div style={{ background: P.s1, borderBottom: "1px solid " + P.border,
          padding: "11px 28px", display: "flex", justifyContent: "space-between",
          alignItems: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 11.5, color: P.dim }}>
            {BREADCRUMB[screen] || "Overview"}
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ fontSize: 11.5, color: P.dim }}>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short", day: "numeric",
                month: "short", year: "numeric",
              })}
            </div>
            <div style={{ width: 1, height: 14, background: P.border }} />
            <div style={{ fontSize: 11.5, fontWeight: 600, color: P.accent,
              background: P.accentL, padding: "3px 12px",
              borderRadius: 20, border: "1px solid rgba(45,106,79,0.2)" }}>
              Aadya Law
            </div>
          </div>
        </div>
 
        {/* Scrollable content */}
        <div id="content-area" style={{ flex: 1, overflowY: "auto",
          padding: "28px 32px" }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            {renderScreen()}
          </div>
        </div>
      </div>
    </div>
  );
}
