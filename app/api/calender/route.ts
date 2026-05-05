import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const PARTNER = 'https://webapi.ecourtsindia.com/api/partner';

export async function GET() {
  // 1 — Get all active CNR numbers from cases table
  const { data: cases } = await supabase
    .from('cases')
    .select('cnr_number, client_name, court_name')
    .eq('status', 'active');

  // 2 — Fetch next_hearing_date for each CNR from eCourts
  const ecourtsEvents = [];
  for (const c of cases ?? []) {
    if (!c.cnr_number) continue;
    const res = await fetch(`${PARTNER}/case/${c.cnr_number}`, {
      headers: { Authorization: `Bearer ${process.env.ECOURTS_API_TOKEN}` }
    });
    if (!res.ok) continue;
    const json = await res.json();
    const nextDate = json?.data?.courtCaseData?.nextHearingDate;
    const purpose = json?.data?.courtCaseData?.purpose;
    if (nextDate) ecourtsEvents.push({
      id: `ecourts-${c.cnr_number}`,
      cnr_number: c.cnr_number,
      client_name: c.client_name,
      title: purpose || 'Hearing',
      event_date: nextDate,
      event_type: 'hearing',
      court: c.court_name,
      source: 'ecourts',
    });
  }

  // 3 — Get manual events from Supabase
  const { data: manual } = await supabase
    .from('calendar_events')
    .select('*')
    .order('event_date', { ascending: true });

  // 4 — Merge and sort
  const all = [
    ...ecourtsEvents,
    ...(manual ?? []).map(e => ({ ...e, source: 'manual' })),
  ].sort((a, b) =>
    new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );

  return NextResponse.json({ events: all });
}
