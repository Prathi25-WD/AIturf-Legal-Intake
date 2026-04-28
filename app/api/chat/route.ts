import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/professions/legal/systemPrompt";
import { supabase } from "@/lib/supabase";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function extractJSON(text: string): object | null {
  try {
    const firstBrace = text.indexOf("{");
    const lastBrace  = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }
    const jsonStr = text.slice(firstBrace, lastBrace + 1);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

async function saveBrief(brief: Record<string, unknown>) {
  try {
    const { error } = await supabase
      .from("intake_briefs")
      .insert({
        profession:    process.env.PROFESSION ?? "legal",
        client_name:   brief.clientName as string,
        contact_phone: brief.contactPhone as string,
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
        status:     'web_chat',   
      });

    if (error) {
      console.error("Supabase save error:", error.message);
    } else {
      console.log("Brief saved to Supabase for client:", brief.clientName);
    }
  } catch (err) {
    console.error("Failed to save brief:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const systemPrompt = buildSystemPrompt();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "";

    const parsed = extractJSON(rawText);

    if (parsed) {
      await saveBrief(parsed as Record<string, unknown>);
      return Response.json({ type: "brief", data: parsed });
    } else {
      return Response.json({ type: "message", message: rawText });
    }
  } catch (error) {
    console.error("Claude API error:", error);
    return Response.json(
      { type: "message", message: "Sorry, I encountered an error. Please try again." },
      { status: 500 }
    );
  }
}
