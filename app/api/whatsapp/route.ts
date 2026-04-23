import { NextRequest } from "next/server";
import twilio from "twilio";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/professions/legal/systemPrompt";
import { supabase } from "@/lib/supabase";

// ── Twilio client (uses env vars) ──
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// ── Anthropic client ──
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ── In-memory conversation store ──
// Key = client WhatsApp number, Value = message history
const conversations = new Map<string, { role: "user" | "assistant"; content: string }[]>();

const userState = new Map<string, string>();

// ── JSON extractor (same as your web chat) ──
function extractJSON(text: string): Record<string, unknown> | null {
  try {
    const first = text.indexOf("{");
    const last  = text.lastIndexOf("}");
    if (first === -1 || last === -1 || last <= first) return null;
    return JSON.parse(text.slice(first, last + 1));
  } catch {
    return null;
  }
}

// ── Save brief to Supabase ──
async function saveBrief(brief: Record<string, unknown>, phone: string) {
  try {
    const { error } = await supabase.from("intake_briefs").insert({
      profession:    process.env.PROFESSION ?? "legal",
      client_name:   brief.clientName as string,
      contact_phone: phone,
      service_type:  brief.serviceType as string,
      service_subtype:  brief.serviceSubType as string,
      fact_summary:  brief.factSummary as string,
      applicable_rules: brief.applicableRules as string[],
      deadline_date: brief.deadlineDate as string,
      deadline_status:  brief.deadlineStatus as string,
      recommended_forum: brief.recommendedForum as string,
      urgency:       brief.urgency as string,
      questions_for_professional: brief.questionsForProfessional as string[],
      raw_brief:     brief,
    });
    if (error) console.error("Supabase save error:", error.message);
    else console.log("WhatsApp brief saved for:", phone);
  } catch (err) {
    console.error("Failed to save WhatsApp brief:", err);
  }
}

// ── Format brief as readable WhatsApp message ──
function formatBriefForWhatsApp(brief: Record<string, unknown>): string {
  const lines = [
    "✅ *Intake Brief Ready*",
    "",
    `*Client:* ${brief.clientName || "—"}`,
    `*Case type:* ${String(brief.serviceType || "—").replace(/_/g, " ")}`,
    `*Summary:* ${brief.factSummary || "—"}`,
    "",
    `*Recommended forum:* ${brief.recommendedForum || "—"}`,
    `*Deadline status:* ${brief.deadlineStatus || "—"}`,
    `*Urgency:* ${brief.urgency || "—"}`,
    "",
    "Your intake brief has been submitted to Aadya Law.",
    "The advocate will review it before your consultation.",
    "",
    "_This does not constitute legal advice._",
  ];
  return lines.join("\n");
}

// ── Main webhook handler ──
export async function POST(req: NextRequest) {
  try {
    // Parse the form data Twilio sends
    const formData = await req.formData();
    const from    = formData.get("From") as string;   // e.g. "whatsapp:+919845012345"
    const body    = formData.get("Body") as string;   // the client's message text
    const buttonPayload =
  (formData.get("ButtonPayload") as string) ||
  (formData.get("ButtonText") as string) ||
  body;
    const listReply = formData.get("ListResponse") as string;

    if (!from || !body) {
      return new Response("Missing From or Body", { status: 400 });
    }
    
    
    if (!conversations.has(from)) {
  conversations.set(from, []);
}

const history = conversations.get(from)!;

// ✅ THEN check greeting
const isGreeting = ["hi", "hello", "hey"].includes(
  body.toLowerCase().trim()
);

if (isGreeting) {
  await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: from,
    contentSid: "HXff10a484029f9b1be2d4e85cb2f5e0a3"
  });

  return new Response("", { status: 200 });
}

    console.log(`WhatsApp from ${from}: ${body}`);

    // ── Handle button clicks ──
// When button clicked
if (buttonPayload === "📄 Check Case Status") {
  await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: from,
    body: "Please enter your 10-digit phone number."
  });

  return new Response("", { status: 200 });
}

// When user sends phone number
if (/^\d{10}$/.test(body)) {
 const cleanPhone = body.replace(/\D/g, "");

const { data } = await supabase
  .from("intake_briefs")
  .select("*")
  .ilike("contact_phone", `%${cleanPhone}%`);

  if (!data || data.length === 0) {
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: from,
      body: "❌ No cases found."
    });
  } else {
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: from,
      body: `📄 Case Status:\n\nStatus: ${data[0].status}`
    });
  }

  return new Response("", { status: 200 });
}

if (buttonPayload === "🧠 New Consultation") {
  userState.set(from, "choose_category");

  await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: from,
    body: "Select your case type:\n\n1. Civil\n2. Criminal\n3. Corporate\n\nReply with a number."
  });

  return new Response("", { status: 200 });
}

if (buttonPayload === "📞 Contact Office") {
  await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: from,
    body: "📞 Call us at: +91XXXXXXXXXX"
  });

  return new Response("", { status: 200 });
}

if (userState.get(from) === "choose_category") {
  userState.set(from, "ai_intake");

  conversations.set(from, []);

  await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: from,
    body: "Please describe your issue in detail."
  });

  return new Response("", { status: 200 });
}
if (userState.get(from) === "case_status") {
  const { data } = await supabase
    .from("cases")
    .select("*")
    .eq("contact_phone", body);

  if (!data || data.length === 0) {
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: from,
      body: "❌ No cases found. Please try again or contact office."
    });
  } else {
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: from,
      body: `📄 Case Status:\n\nStatus: ${data[0].status}`
    });
  }

  return new Response("", { status: 200 });
}

    // Get or create conversation history for this phone number
    

    // Add user message to history
    history.push({ role: "user", content: body });

    // Call Claude with full conversation history
    const systemPrompt = buildSystemPrompt();
    const response = await anthropic.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system:     systemPrompt,
      messages:   history,
    });

    const replyText = response.content[0].type === "text"
      ? response.content[0].text
      : "";

    // Add assistant reply to history
    history.push({ role: "assistant", content: replyText });

    // Check if Claude returned a brief JSON
    const briefData = extractJSON(replyText);
    let messageToSend: string;

    if (briefData && briefData.clientName) {
      // Save brief to Supabase
      await saveBrief(briefData, from.replace("whatsapp:", ""));
      // Format a human-readable summary for WhatsApp
      messageToSend = formatBriefForWhatsApp(briefData);
      // Clear the conversation after brief is complete
      conversations.delete(from);
    } else {
      // Regular follow-up question — send as-is
      messageToSend = replyText;
    }

    // Send reply via Twilio
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to:   from,
      body: messageToSend,
    });

    // Twilio expects an empty 200 response — do NOT return the message text
    return new Response("", { status: 200 });

  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    // Still return 200 so Twilio does not keep retrying
    return new Response("", { status: 200 });
  }
}
