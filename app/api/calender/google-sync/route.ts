import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function POST(req: NextRequest) {
  const { event, accessToken } = await req.json();

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth });

  const gEvent = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: `${event.title} — ${event.client_name}`,
      location: event.court,
      description: `CNR: ${event.cnr_number}\n${event.notes || ''}`,
      start: { date: event.event_date },
      end:   { date: event.event_date },
      reminders: { useDefault: false, overrides: [
        { method: 'email',  minutes: 24 * 60 },
        { method: 'popup',  minutes: 60 },
      ]},
    },
  });

  // Save google event ID back to Supabase
  await supabase.from('calendar_events').update({
    google_event_id: gEvent.data.id,
    synced_to_google: true,
  }).eq('id', event.id);

  return NextResponse.json({ googleEventId: gEvent.data.id });
}
