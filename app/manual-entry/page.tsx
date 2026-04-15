"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CSSProperties } from "react";

export default function ManualEntryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    client_name: "",
    contact_phone: "",
    service_type: "",
    fact_summary: "",
    applicable_rules:"",
    deadline_date:"",
    deadline_status:"",
    urgency:"",
    recommended_forum: "",
  });

  const PALETTE = {
  bg: "#FAF8F5",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F1EB",
  border: "#E8E0D4",
  accent: "#8B6914",
  text: "#2C2418",
  textLight: "#9C8E7C",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: `1px solid ${PALETTE.border}`,
  background: PALETTE.surface,
  fontSize: 13,
  color: PALETTE.text,
  outline: "none",
  boxSizing: "border-box",
};

const btnPrimary: CSSProperties = {
  padding: "8px 14px",
  borderRadius: 6,
  border: "none",
  background: "var(--olive-dark)",
  color: "#F5F0E8",
  fontWeight: 600,
  cursor: "pointer",
};

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleSubmit = async () => {
  const cleanedForm = {
    client_name: form.client_name,
    contact_phone: form.contact_phone || null,
    service_type: form.service_type || null,
    fact_summary: form.fact_summary || null,

   
    applicable_rules: form.applicable_rules
      ? [form.applicable_rules]
      : null,

    deadline_date: form.deadline_date || null,
    deadline_status: form.deadline_status || null,
    urgency: form.urgency || null,
    recommended_forum: form.recommended_forum || null,
  };

  console.log("FORM DATA:", cleanedForm);

  const { data, error } = await supabase
    .from("intake_briefs")
    .insert([cleanedForm]);

  console.log("RESPONSE:", data, error);

  if (error) {
    alert(error.message);
  } else {
    alert("Saved successfully");
  }
};

  return (
    <div
  style={{
    background: PALETTE.bg,
    minHeight: "100vh",
    padding: 20,
    fontFamily: "'Source Sans 3', system-ui",
  }}
>
  <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
  <div
    style={{
      fontSize: 18,
      fontWeight: 700,
      color: PALETTE.text,
      fontFamily: "'Libre Baskerville', serif",
    }}
  >
    Add Client Details
  </div>
  <div style={{ fontSize: 12, color: PALETTE.textLight }}>
    Manual intake entry for walk-in client
  </div>
</div>
     <div
        style={{
            background: PALETTE.surface,
            border: `1px solid ${PALETTE.border}`,
            borderRadius: 8,
            padding: 16,
        }}
        >
     <div style={{ marginBottom: 10 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>
    CLIENT NAME
  </div>
  <input
    name="client_name"
    value={form.client_name}
    onChange={handleChange}
    style={{ ...inputStyle, marginTop: 4 }}
  />
</div>
<div style={{ marginBottom: 10 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>
    PHONE NUMBER
  </div>
  <input
    name="contact_phone"
    value={form.contact_phone}
    onChange={handleChange}
    style={{ ...inputStyle, marginTop: 4 }}
  />
</div>

      <div style={{ marginBottom: 10 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>
    CASE TYPE
  </div>
  <input
    name="service_type"
    value={form.service_type}
    onChange={handleChange}
    style={{ ...inputStyle, marginTop: 4 }}
  />
</div>
     <div style={{ marginBottom: 10 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>
    Fact Summary
  </div>
    <textarea
  name="fact_summary"
  value={form.fact_summary}
  onChange={handleChange}
  style={{ ...inputStyle, marginTop: 4, height: 80 }}
/>
</div>
      <div style={{ marginBottom: 10 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>
    DeadLine Date
  </div>
     <input
  type="date"
  name="deadline_date"
  value={form.deadline_date}
  onChange={handleChange}
  style={{ ...inputStyle, marginTop: 4 }}
/>
</div>
<div style={{ marginBottom: 10 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>
    Deadline Status
  </div>
       <select
  name="deadline_status"
  value={form.deadline_status}
  onChange={handleChange}
  style={{ ...inputStyle, marginTop: 4 }}
>
  <option value="">Select status</option>
  <option value="safe">Safe</option>
  <option value="warning">Warning</option>
  <option value="critical">Critical</option>
</select>
</div>
<div style={{ marginBottom: 10 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>
    Urgency
  </div>
       <select
  name="urgency"
  value={form.urgency}
  onChange={handleChange}
  style={{ ...inputStyle, marginTop: 4 }}
>
  <option value="">Select urgency</option>
  <option value="high">High</option>
  <option value="medium">Medium</option>
  <option value="low">Low</option>
</select>
</div>
<div style={{ marginBottom: 10 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>
    Applicable Rules
  </div>
      <input
  name="applicable_rules"
  value={form.applicable_rules}
  onChange={handleChange}
  style={{ ...inputStyle, marginTop: 4 }}
/>
</div>
<div style={{ marginBottom: 10 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>
    Recommended Forum
  </div>
<input
  name="recommended_forum"
  value={form.recommended_forum}
  onChange={handleChange}
  style={{ ...inputStyle, marginTop: 4 }}
/>
</div>
      <div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: 11, color: PALETTE.textLight }}>
    DOCUMENT 
  </div>

  <input
    type="file"
    onChange={(e) => setFile(e.target.files?.[0] || null)}
    style={{ marginTop: 6 }}
  />

  {file && (
    <div style={{ fontSize: 11, color: PALETTE.textLight, marginTop: 4 }}>
      Selected: {file.name}
    </div>
  )}
</div>
        </div>

     <button onClick={handleSubmit} style={btnPrimary}>
  Save Entry
</button>
    </div>
    </div>
  );
}