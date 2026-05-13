import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase  = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // service role bypasses RLS
);

export async function POST(req: NextRequest) {
  const { document_id, file_url, doc_type } = await req.json();

  try {
    // 1. Fetch the file
    const fileRes  = await fetch(file_url);
    const buffer   = await fileRes.arrayBuffer();
    const base64   = Buffer.from(buffer).toString("base64");
    const mimeType = fileRes.headers.get("content-type") || "application/pdf";

    // 2. Build prompt based on doc type
    const prompt = buildPrompt(doc_type);

    // 3. Call Claude
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          {
            type: mimeType.includes("pdf") ? "document" : "image",
            source: { type: "base64", media_type: mimeType as any, data: base64 },
          } as any,
          { type: "text", text: prompt },
        ],
      }],
    });

    // 4. Parse response
    const raw     = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const extracted = JSON.parse(cleaned);

    // 5. Save to Supabase
    const { error } = await supabase
      .from("documents")
      .update({ ai_extracted: extracted, ai_parsed: true })
      .eq("id", document_id);

    if (error) throw error;

    return NextResponse.json({ success: true, extracted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function buildPrompt(docType: string): string {
  const base = `Extract key legal details from this document. 
Return ONLY a JSON object, no markdown, no explanation.`;

  const prompts: Record<string, string> = {
    CHEQUE: `${base}
Return: { "amount": "", "date": "", "payee": "", "drawer": "", 
"bank": "", "account_number": "", "cheque_number": "", "status": "" }`,

    "SALE DEED": `${base}
Return: { "parties": { "seller": "", "buyer": "" }, "property_description": "",
"survey_number": "", "area": "", "consideration": "", "registration_date": "", 
"document_number": "", "sub_registrar_office": "" }`,

    "LEGAL NOTICE": `${base}
Return: { "sender": "", "recipient": "", "demand": "", "deadline": "",
"subject": "", "notice_date": "", "lawyer_name": "", "cause_of_action": "" }`,

    ENCUMBRANCE: `${base}
Return: { "property_description": "", "survey_number": "", "period": "",
"transactions": [], "encumbrances": [], "office": "" }`,

    AFFIDAVIT: `${base}
Return: { "deponent": "", "date": "", "subject": "", "key_statements": [],
"notary": "", "court": "" }`,

    PLAINT: `${base}
Return: { "plaintiff": "", "defendant": "", "court": "", "relief_sought": "",
"cause_of_action": "", "valuation": "", "facts_summary": "" }`,
  };

  return prompts[docType] || `${base}
Return: { "document_type": "", "parties": [], "dates": [], 
"key_terms": [], "amounts": [], "summary": "" }`;
}