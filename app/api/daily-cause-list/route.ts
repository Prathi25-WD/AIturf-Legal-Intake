import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PARTNER = "https://webapi.ecourtsindia.com/api/partner";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date")
    || new Date().toISOString().split("T")[0];

  // 1 — Get all active cases from Supabase
  const { data: dbCases } = await supabase
    .from("cases")
    .select("cnr_number, client_name, court_name, suit_number, case_type, judge_name, stage")
    .eq("status", "active");

  const results = [];

  // 2 — For each case, check if next_hearing_date matches selected date
  for (const c of dbCases ?? []) {
    if (!c.cnr_number) continue;

    // Use cached ecourts_data if available (avoids hitting API every time)
    const { data: row } = await supabase
      .from("cases")
      .select("ecourts_data, next_hearing_date")
      .eq("cnr_number", c.cnr_number)
      .single();

    const nextDate = row?.next_hearing_date?.split("T")[0];
    if (nextDate !== date) continue;

    // Get purpose from cached ecourts_data
    const purpose = row?.ecourts_data?.data?.courtCaseData?.purpose
      || c.stage || "Hearing";

    results.push({
      suit:        c.suit_number  || "—",
      case_type:   c.case_type    || "—",
      client_name: c.client_name  || "—",
      court:       c.court_name   || "—",
      judge:       c.judge_name   || "—",
      purpose,
      cnr_number:  c.cnr_number,
      item_number: null,   // eCourts does not expose item numbers via API
      time:        null,   // eCourts does not expose time via API
    });
  }

  return NextResponse.json({ cases: results, date });
}
