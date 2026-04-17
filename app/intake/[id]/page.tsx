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
const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState({
  client_name: "",
  contact_phone: "",
  service_type: "",
  recommended_forum: "",
  fact_summary: "",
});

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
        setFormData({
          client_name: data.client_name || "",
          contact_phone: data.contact_phone || "",
          service_type: data.service_type || "",
          recommended_forum: data.recommended_forum || "",
          fact_summary: data.fact_summary || "",
        });
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
  const handleSave = async () => {
  const { error } = await supabase
    .from("intake_briefs")
    .update(formData)
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Error saving");
  } else {
    alert("Updated successfully");

    // update UI instantly
    setData({ ...data, ...formData });

    setIsEditing(false);
  }
};

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
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            marginBottom: 12,
            padding: "6px 12px",
            borderRadius: 4,
            border: "none",
            background: "var(--olive-dark)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {isEditing ? "Cancel" : "Edit"}
    </button>
     <div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>CLIENT NAME</div>
  <div style={{ fontSize: 14, fontWeight: 600, color: PALETTE.text }}>
    {isEditing ? (
  <input
    value={formData.client_name}
    onChange={(e) =>
      setFormData({ ...formData, client_name: e.target.value })
    }
    style={{
      fontSize: 14,
      padding: "6px 8px",
      borderRadius: 4,
      border: "1px solid #E8E0D4",
      width: "100%",
    }}
  />
) : (
  data.client_name
)}
  </div>
</div>

<div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>PHONE</div>
  <div style={{ fontSize: 13 }}>{isEditing ? (
  <input
    value={formData.contact_phone}
    onChange={(e) =>
      setFormData({ ...formData, contact_phone: e.target.value })
    }
    style={{
      fontSize: 14,
      padding: "6px 8px",
      borderRadius: 4,
      border: "1px solid #E8E0D4",
      width: "100%",
    }} 
     />
) : (
  data.contact_phone
)}</div>
</div>

<div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>CASE TYPE</div>
  <div style={{ fontSize: 13 }}>{isEditing ? (
  <input
    value={formData.service_type}
    onChange={(e) =>
      setFormData({ ...formData, service_type: e.target.value })
    }
    style={{
      fontSize: 14,
      padding: "6px 8px",
      borderRadius: 4,
      border: "1px solid #E8E0D4",
      width: "100%",
    }} 
  />
) : (
  data.service_type
)}
</div>
</div>

<div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>RECOMMENDED COURT</div>
  <div style={{ fontSize: 13 }}>{isEditing ? (
  <input
    value={formData.recommended_forum}
    onChange={(e) =>
      setFormData({ ...formData, recommended_forum: e.target.value })
    }
    style={{
      fontSize: 14,
      padding: "6px 8px",
      borderRadius: 4,
      border: "1px solid #E8E0D4",
      width: "100%",
    }} 
  />
) : (
  data.recommended_forum
)}</div>
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
    {isEditing ? (
  <textarea
    value={formData.fact_summary}
    onChange={(e) =>
      setFormData({ ...formData, fact_summary: e.target.value })
    }
    style={{
     fontSize: 14,
      padding: "6px 8px",
      borderRadius: 4,
      border: "1px solid #E8E0D4",
      width: "100%",
      minHeight: 80,
          }}
        />
      ) : (
        data.fact_summary
      )}
  </div>
</div>

{isEditing && (
  <button
    onClick={handleSave}
    style={{
      marginTop: 12,
      padding: "8px 14px",
      borderRadius: 6,
      border: "none",
      background: PALETTE.accent,
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    Save Changes
  </button>
)}
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