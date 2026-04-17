"use client";
import { useRef } from "react";



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

interface Props {
  brief: BriefData;
  onBack: () => void;
}

const urgencyStyle: Record<string, { bg: string; color: string; label: string }> = {
  low:      { bg: "#F1EFE8", color: "#5F5E5A", label: "Low urgency" },
  medium:   { bg: "#FFF3DC", color: "#854F0B", label: "Medium urgency" },
  high:     { bg: "#FAECE7", color: "#712B13", label: "High urgency" },
  critical: { bg: "#FCEBEB", color: "#791F1F", label: "CRITICAL — Act immediately" },
};

const deadlineStyle: Record<string, { bg: string; color: string; label: string }> = {
  safe:    { bg: "#EAF3DE", color: "#3B6D11", label: "Within limitation period" },
  warning: { bg: "#FFF3DC", color: "#854F0B", label: "Approaching deadline — act soon" },
  expired: { bg: "#FCEBEB", color: "#791F1F", label: "Limitation period may have expired" },
};

export default function IntakeBrief({ brief, onBack }: Props) {
  const briefRef = useRef<HTMLDivElement>(null);
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

 const isGeneratingRef = useRef(false);
async function downloadPDF() {
  if (typeof window === "undefined") return;

  const html2pdf = (await import("html2pdf.js")).default;

  const element = document.getElementById("pdf-content");

  if (!element) {
    console.error("PDF element not found");
    return;
  }

  const options = {
    margin: 10,
    filename: "intake-brief.pdf",
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
  };

  html2pdf().from(element).set(options).save();
}
  const urg = urgencyStyle[brief.urgency?.toLowerCase()] ?? urgencyStyle.medium;
  const dl  = deadlineStyle[brief.deadlineStatus?.toLowerCase()] ?? deadlineStyle.safe;

  const S = {
    page: { background: "#FAF8F3", minHeight: "100vh" } as React.CSSProperties,
    actionBar: {
      display: "flex", alignItems: "center", gap: "8px",
      padding: "12px 20px", background: "#FDFAF4",
      borderBottom: "0.5px solid #E2DAC8",
      position: "sticky" as const, top: 0, zIndex: 10,
    },
    btnBack: {
      background: "none", border: "0.5px solid #C8BFA8", borderRadius: "8px",
      padding: "7px 14px", fontSize: "12px", color: "#4A4A2A",
      cursor: "pointer", fontFamily: "inherit",
    },
    btnPDF: {
      background: "#4A4A2A", border: "none", borderRadius: "8px",
      padding: "7px 16px", fontSize: "12px", color: "#F5F0E8",
      cursor: "pointer", fontWeight: 500, fontFamily: "inherit", marginLeft: "auto",
    },
    wrap: { maxWidth: "640px", margin: "0 auto", padding: "24px 16px" },
    card: {
      background: "#fff", border: "0.5px solid #E2DAC8",
      borderRadius: "14px", overflow: "hidden",
    },
    hdr: { background: "#4A4A2A", color: "#F5F0E8", padding: "20px 24px",
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    },
    hdrSub: { fontSize: "10px", color: "#B8B88A", letterSpacing: ".08em",
      textTransform: "uppercase" as const, marginBottom: "4px",
    },
    hdrH1: { fontSize: "17px", fontWeight: 500, color: "#F5F0E8", margin: "0 0 2px" },
    hdrAddr: { fontSize: "11px", color: "#B8B88A", margin: 0 },
    hdrRight: { textAlign: "right" as const, flexShrink: 0 },
    hdrLbl: { fontSize: "10px", color: "#B8B88A", margin: "0 0 2px" },
    hdrVal: { fontSize: "12px", fontWeight: 500, color: "#F5F0E8", margin: "0 0 6px" },
    hdrBadge: { fontSize: "10px", color: "#B8B88A",
      background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "10px",
    },
    body: { padding: "20px 24px", display: "flex", flexDirection: "column" as const, gap: "18px" },
    secLbl: { fontSize: "10px", fontWeight: 500, color: "#8A8A6A",
      textTransform: "uppercase" as const, letterSpacing: ".07em", marginBottom: "8px",
    },
    infoCard: { background: "#FAF8F3", borderRadius: "10px", padding: "12px 14px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
    fieldLbl: { fontSize: "10px", color: "#8A8A6A", margin: "0 0 2px" },
    fieldVal: { fontSize: "13px", fontWeight: 500, color: "#2C2C1A", margin: 0 },
    rowItem: { display: "flex", justifyContent: "space-between",
      alignItems: "flex-start", padding: "7px 0",
      borderBottom: "0.5px solid #E8E2D4",
    },
    rowLbl: { fontSize: "11px", color: "#8A8A6A" },
    rowVal: { fontSize: "12px", fontWeight: 500, color: "#2C2C1A",
      textAlign: "right" as const, maxWidth: "60%",
    },
    factText: { fontSize: "13px", color: "#2C2C1A", lineHeight: "1.65", margin: 0 },
    pill: { display: "inline-block", fontSize: "11px", padding: "3px 10px",
      borderRadius: "20px", border: "0.5px solid #C8BFA8",
      background: "#FAF8F3", color: "#4A4A2A", margin: "2px",
    },
    qBox: { background: "#FFFBF2", border: "0.5px solid #E8D8A0",
      borderRadius: "10px", padding: "12px 14px",
      display: "flex", flexDirection: "column" as const, gap: "8px",
    },
    qItem: { display: "flex", gap: "8px", fontSize: "12px",
      color: "#5A4A1A", lineHeight: "1.5",
    },
    qNum: { fontWeight: 500, flexShrink: 0, color: "#4A4A2A" },
    disc: { borderTop: "0.5px solid #E2DAC8", paddingTop: "14px",
      fontSize: "10px", color: "#9A9A7A", lineHeight: "1.6",
    },
  };

  return (
    <div style={S.page}>
      <div style={S.actionBar}>
        <button onClick={onBack} style={S.btnBack}>← Back to chat</button>
        <button
  onClick={(e) => {
    e.stopPropagation(); // 👈 prevents double trigger
    downloadPDF();
  }}
  style={S.btnPDF}
>
  Download PDF
</button>
      </div>

      <div style={S.wrap}>
        <div ref={briefRef} style={S.card}>

          {/* Header */}
          <div style={S.hdr}>
            <div>
              <p style={S.hdrSub}>Client Intake Brief</p>
              <h1 style={S.hdrH1}>K.T. Dakappa &amp; Associates</h1>
              <p style={S.hdrAddr}>DVG Road, Basavanagudi, Bangalore — 560004</p>
            </div>
            <div style={S.hdrRight}>
              <p style={S.hdrLbl}>Date</p>
              <p style={S.hdrVal}>{today}</p>
              <span style={S.hdrBadge}>Powered by AITurf</span>
            </div>
          </div>

          <div style={S.body}>

            {/* Badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              <span style={{ ...S.pill, background: urg.bg, color: urg.color, border: "none", fontWeight: 500 }}>
                {urg.label}
              </span>
              <span style={{ ...S.pill, background: dl.bg, color: dl.color, border: "none", fontWeight: 500 }}>
                {dl.label}
              </span>
            </div>

            {/* Client details */}
            <div>
              <p style={S.secLbl}>Client details</p>
              <div style={{ ...S.infoCard, ...S.grid2 }}>
                <div>
                  <p style={S.fieldLbl}>Name</p>
                  <p style={S.fieldVal}>{brief.clientName || "Not provided"}</p>
                </div>
                <div>
                  <p style={S.fieldLbl}>Phone</p>
                  <p style={S.fieldVal}>{brief.contactPhone || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Classification */}
            <div>
              <p style={S.secLbl}>Case classification</p>
              <div style={S.infoCard}>
                <div style={S.rowItem}>
                  <span style={S.rowLbl}>Type</span>
                  <span style={S.rowVal}>{brief.serviceType}</span>
                </div>
                <div style={{ ...S.rowItem, borderBottom: "none" }}>
                  <span style={S.rowLbl}>Sub-type</span>
                  <span style={S.rowVal}>{brief.serviceSubType}</span>
                </div>
              </div>
            </div>

            {/* Fact summary */}
            <div>
              <p style={S.secLbl}>Fact summary</p>
              <div style={S.infoCard}>
                <p style={S.factText}>{brief.factSummary}</p>
              </div>
            </div>

            {/* Deadline + Forum */}
            <div style={S.grid2}>
              <div>
                <p style={S.secLbl}>Deadline analysis</p>
                <div style={S.infoCard}>
                  <p style={S.fieldLbl}>Limitation period</p>
                  <p style={{ ...S.fieldVal, marginBottom: "8px" }}>
                    {brief.deadlineDate || "See advocate"}
                  </p>
                  <span style={{ ...S.pill, background: dl.bg, color: dl.color, border: "none", fontSize: "10px" }}>
                    {brief.deadlineStatus}
                  </span>
                </div>
              </div>
              <div>
                <p style={S.secLbl}>Recommended forum</p>
                <div style={S.infoCard}>
                  <p style={S.factText}>{brief.recommendedForum}</p>
                </div>
              </div>
            </div>

            {/* Laws */}
            {brief.applicableRules?.length > 0 && (
              <div>
                <p style={S.secLbl}>Applicable laws / rules</p>
                <div>
                  {brief.applicableRules.map((rule, i) => (
                    <span key={i} style={S.pill}>{rule}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Questions */}
            {brief.questionsForProfessional?.length > 0 && (
              <div>
                <p style={S.secLbl}>Questions for the advocate</p>
                <div style={S.qBox}>
                  {brief.questionsForProfessional.map((q, i) => (
                    <div key={i} style={S.qItem}>
                      <span style={S.qNum}>{i + 1}.</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div style={S.disc}>
              DISCLAIMER: This intake brief was generated by AITurf, an AI-assisted client intake tool. It does not constitute legal advice. The information collected is for the exclusive use of the advocate to prepare for a client consultation. All details should be verified with the client directly.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}