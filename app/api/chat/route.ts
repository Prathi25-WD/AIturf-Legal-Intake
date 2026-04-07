import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/professions/legal/systemPrompt";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function extractJSON(text: string): object | null {
  try {
    // Extract first JSON object from anywhere in the text
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) return null;

    const jsonString = match[0];

    return JSON.parse(jsonString);
  } catch (err) {
    console.error("JSON parse failed:", err);
    return null;
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
    
    console.log("RAW TEXT:", rawText);

    // Try to extract JSON from the response
    const parsed = extractJSON(rawText);

    if (parsed) {
      // Claude returned the intake brief JSON
      return Response.json({ type: "brief", data: parsed });
    } else {
      // Claude returned a regular chat message
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
