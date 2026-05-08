import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { caseData } = await req.json();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: `You output ONLY plain text legal documents. 
NEVER use: # headings, --- dividers, * bullets, numbered lists, bold **, italic *, or ANY markdown.
NEVER start a line with #, -, *, 1., 2., 3., or ...
Write section headings in PLAIN UPPERCASE only.
Separate sections with a single blank line.`,

      messages: [{
        role: 'user',
        content: `Generate a Vakalatnama for Karnataka court using ONLY plain text.

Client: ${caseData.client}
Party Role: ${caseData.party_designation || 'Plaintiff'}
Opposite Party: ${caseData.opposite_party || '[Opposite Party]'}
Opposite Role: ${caseData.opposite_designation || 'Defendant'}
Case Number: ${caseData.suit}
Court: ${caseData.court}
Advocate: ${caseData.advocate || '[Advocate Name]'}
Roll No: ${caseData.advocate_roll || '[Roll No.]'}
Client Address: ${caseData.client_address || '[Address]'}
Advocate Address: ${caseData.advocate_address || '[Advocate Address]'}
Date: ${caseData.filing_date || new Date().toLocaleDateString('en-IN')}

Write in this exact order as plain text paragraphs:

COURT HEADER
Write the court name and case number in plain uppercase.

PARTIES
Write petitioner name, then V/S. on its own line, then respondent name.
After each party designation write (Strike out if not applicable) in the same line.

APPOINTMENT CLAUSE
Start with: I, [client name], the [party role] do hereby appoint...

AUTHORIZATION
Write three plain paragraphs of standard Karnataka authorization text.

EXECUTION
Executed this [date] at [place]. Signature line for client.

ADVOCATE ACCEPTANCE
Name: [advocate name]  Roll No: [roll no]
ACCEPTED.

ADDRESS FOR SERVICE
Write the advocate address.

PRACTICAL NOTES
One short paragraph about Karnataka court fee stamp requirements.`,
      }],
    });

    const raw = response.content[0].type === 'text' ? response.content[0].text : '';

    const draft = raw
      .replace(/^#{1,6}\s*/gm, '')
      .replace(/^---+\s*$/gm, '')
      .replace(/^\*\*\*\s*$/gm, '')
      .replace(/^\.{3}\s*/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/^[-*]\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_{2}(.*?)_{2}/g, '$1')
      .trim();

    console.log('[vakalatnama] first 300 chars:', draft.substring(0, 300));

    return NextResponse.json({ draft });

  } catch (err: any) {
    console.error('[vakalatnama] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}