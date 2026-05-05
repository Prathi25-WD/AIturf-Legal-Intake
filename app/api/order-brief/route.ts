import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const PARTNER_BASE = 'https://webapi.ecourtsindia.com/api/partner';

export async function POST(req: NextRequest) {
  try {
    const { filename, cnr, purpose } = await req.json();

    if (!filename || !cnr) {
      return NextResponse.json({ error: 'filename and cnr required' }, { status: 400 });
    }

    // ── Step 1: Fetch PDF from eCourts partner API ──
    const pdfRes = await fetch(`${PARTNER_BASE}/case/${cnr}/order/${filename}`, {
      headers: {
        Authorization: `Bearer ${process.env.ECOURTS_API_TOKEN}`,
        Accept: 'application/pdf',
      },
    });

    if (!pdfRes.ok) {
      return NextResponse.json({ error: `PDF fetch failed: ${pdfRes.status}` }, { status: 502 });
    }

    const pdfBuffer = await pdfRes.arrayBuffer();
    const base64PDF = Buffer.from(pdfBuffer).toString('base64');

    // ── Step 2: Send to Claude for analysis ──
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64PDF,
              },
            },
            {
              type: 'text',
              text: `You are a senior legal assistant for an Indian advocate. Analyse this court order (${purpose || 'Court Order'}) and produce a structured brief in STRICT JSON format.

Return ONLY valid JSON, no markdown, no preamble. Schema:

{
  "whatHappened": "One paragraph summary of what the court decided.",
  "keyDirections": [
    {
      "direction": "Specific direction text with numbers/dates",
      "citation": "Order dated DD.MM.YYYY, para N"
    }
  ],
  "nextSteps": [
    {
      "step": "What the advocate must do",
      "action": "draft_notice | draft_application | draft_execution | open_drafts | none",
      "actionLabel": "Button label e.g. Draft Application"
    }
  ],
  "riskFlags": [
    {
      "flag": "Risk or observation text",
      "citation": "Order dated DD.MM.YYYY, para N or 'Inferred from absence'",
      "confidence": "high | medium | low",
      "confidenceReason": "One sentence explaining confidence level"
    }
  ],
  "citedAuthorities": [
    {
      "name": "Case name or statute section",
      "reference": "Citation string e.g. AIR 2001 SC 123 or Section 106 TPA"
    }
  ],
  "generatedAt": "${new Date().toISOString()}",
  "modelNote": "claude-sonnet-4-20250514"
}

Rules:
- Every keyDirection MUST have a citation to a paragraph or date in the order
- Every riskFlag MUST have a confidence level and a reason
- If a risk flag is inferred from absence (something missing), set confidence to "medium" or "low"
- citedAuthorities: extract every case, statute, or section the order references
- nextSteps action must be one of the enum values above
- Keep whatHappened under 80 words
- Keep each direction/flag under 25 words
- If a field has no data, return an empty array []`
            },
            
          ],
        },
      ],
    });

    // In order-brief/route.ts — replace the return statement:

const raw = response.content[0].type === 'text' ? response.content[0].text : '';

// Strip any accidental markdown fences
const clean = raw.replace(/```json|```/g, '').trim();

let brief;
try {
  brief = JSON.parse(clean);
} catch {
  // Fallback if Claude returns non-JSON
  return NextResponse.json({ brief: raw, isLegacy: true });
}

return NextResponse.json({ brief, isLegacy: false });

  } catch (err: any) {
    console.error('[order-brief] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}