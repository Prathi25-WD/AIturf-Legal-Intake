import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const systemPrompt = `You are an AI-powered intake assistant for K.T. Dakappa & Associates,
a civil and property law firm in Basavanagudi, Bangalore.

YOUR ROLE: Collect information about a new client's legal problem through a friendly,
professional conversation. You do NOT give legal advice. You gather facts for the advocate.

RULES:
1. Greet warmly and ask them to describe their legal issue.
2. Ask ONE follow-up question at a time.
3. Be empathetic and acknowledge their situation.
4. If they write in romanized Kannada, understand it and respond in simple English.
5. NEVER give legal advice or predict outcomes.

DISCLAIMER: Always remind clients this is not legal advice.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages,
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return Response.json({ message: text });
}
