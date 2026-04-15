"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function IntakeDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedAdvocate, setSelectedAdvocate] = useState("");
  const advocates = [
    "K.T. Dakappa",
    "Bhoomika Y.S.",
    "Suresh M."
  ];
  const PALETTE = {
  bg: "#FAF8F5",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F1EB",
  border: "#E8E0D4",
  accent: "#8B6914",
  text: "#2C2418",
  textLight: "#9C8E7C",
  green: "#3D7A45",
};

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("intake_briefs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setData(data);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (!data) {
    return <div
  style={{
    background: PALETTE.bg,
    minHeight: "100vh",
    padding: 20,
    fontFamily: "'Source Sans 3', system-ui",
  }}
>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
  
  {/* Header */}
  <div style={{ marginBottom: 16 }}>
    <div style={{
      fontSize: 18,
      fontWeight: 700,
      color: PALETTE.text,
      fontFamily: "'Libre Baskerville', serif"
    }}>
      Client Intake Details
    </div>
  </div>

  {/* Card */}
  <div
    style={{
      background: PALETTE.surface,
      border: `1px solid ${PALETTE.border}`,
      borderRadius: 8,
      padding: 16,
    }}
  >
     <div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>CLIENT NAME</div>
  <div style={{ fontSize: 14, fontWeight: 600, color: PALETTE.text }}>
    {data.client_name}
  </div>
</div>

<div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>PHONE</div>
  <div style={{ fontSize: 13 }}>{data.contact_phone}</div>
</div>

<div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>CASE TYPE</div>
  <div style={{ fontSize: 13 }}>{data.service_type}</div>
</div>

<div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>RECOMMENDED COURT</div>
  <div style={{ fontSize: 13 }}>{data.recommended_forum}</div>
</div>

<div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>SUMMARY</div>
  <div
    style={{
      fontSize: 13,
      background: PALETTE.surfaceAlt,
      padding: 10,
      borderRadius: 6,
    }}
  >
    {data.fact_summary}
  </div>
</div>
      <div style={{ marginTop: 20 }}>
  
  {/* Assign Button */}
  <button
  onClick={() => setShowAssign(!showAssign)}
  style={{
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    background: "var(--olive-dark)",
    color: "#F5F0E8",
    fontWeight: 600,
    cursor: "pointer",
  }}
>
  Assign to Advocate
</button>

  {/* Advocate List */}
  {showAssign && (
    <div style={{
  padding: "8px 12px",
  borderRadius: 6,
  border: `1px solid ${PALETTE.border}`,
  background: PALETTE.surface,
  cursor: "pointer",
  textAlign: "left",
}}>
      {advocates.map((adv) => (
        <button
          key={adv}
          onClick={() => setSelectedAdvocate(adv)}   // 👈 for now only select
          style={{
            padding: "6px 10px",
            borderRadius: 4,
            border: "1px solid #E8E0D4",
            background: "#fff",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          {adv}
        </button>
      ))}
    </div>
  )}

  {/* Show selected */}
  {selectedAdvocate && (
    <div style={{ marginTop: 10, fontSize: 12, color: "#3D7A45" }}>
      Selected: {selectedAdvocate}
    </div>
  )}
</div>
</div>
    </div>
    
  );
}