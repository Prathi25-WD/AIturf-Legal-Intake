import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/professions/legal/systemPrompt";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return Response.json({ message: text });
  } catch (error) {
    console.error("Claude API error:", error);
    return Response.json(
      { message: "Sorry, I encountered an error. Please try again." },
      { status: 500 }
    );
  }
}
