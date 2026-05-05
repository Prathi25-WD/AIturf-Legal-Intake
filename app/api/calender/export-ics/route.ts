import { createEvents } from 'ics';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { events } = await req.json();

  const icsEvents = events.map((e: any) => {
    const d = new Date(e.event_date);
    return {
      start: [d.getFullYear(), d.getMonth()+1, d.getDate()],
      end:   [d.getFullYear(), d.getMonth()+1, d.getDate()],
      title: `${e.title} — ${e.client_name || ''}`,
      description: `CNR: ${e.cnr_number || ''}\n${e.notes || ''}`,
      location: e.court || '',
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
    };
  });

  const { error, value } = createEvents(icsEvents);
  if (error) return NextResponse.json({ error }, { status: 500 });

  return new NextResponse(value, {
    headers: {
      'Content-Type': 'text/calendar;charset=utf-8',
      'Content-Disposition': 'attachment; filename=aadya-hearings.ics',
    },
  });
}
