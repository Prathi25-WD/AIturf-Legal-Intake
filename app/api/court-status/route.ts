import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
 
const ECOURTS_BASE = 'https://webapi.ecourtsindia.com/api/partner/case';
const CACHE_MS = 60 * 60 * 1000; // 1 hour
 
// ── NORMALIZER ──────────────────────────────────────────────────────────────
// Maps the raw eCourts API response to the shape the dashboard expects.
// Raw shape: response.data.data.courtCaseData
function normalizeEcourtsData(raw: any) {
  const c = raw?.data?.courtCaseData ?? raw?.courtCaseData ?? raw;
 
  // Format a date string like "2018-02-03" → "3 Feb 2018"
  function fmtDate(d: string | undefined) {
    if (!d) return null;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }
 
  // Hearing history — newest first
  const hearings: any[] = (c.historyOfCaseHearings ?? [])
    .slice()
    .reverse()
    .map((h: any) => ({
      date: fmtDate(h.businessOnDate),
      hearing_date: fmtDate(h.hearingDate),
      purpose: h.purposeOfListing ?? 'Hearing',
      judge: h.judge,
      pdf_url: h.orderPdfPath ?? h.orderUrl ?? h.pdfUrl ?? null,
    }));
 
  // Petitioner + advocate string
  const petitioners: string[] = c.petitioners ?? [];
  const petAdvocates: string[] = c.petitionerAdvocates ?? [];
  const petStr = [
    petitioners.join(', '),
    petAdvocates.length ? `(Adv. ${petAdvocates.join(', ')})` : '',
  ].filter(Boolean).join(' ');
 
  // Respondent + advocate string
  const respondents: string[] = c.respondents ?? [];
  const resAdvocates: string[] = c.respondentAdvocates ?? [];
  const resStr = [
    respondents.join(', '),
    resAdvocates.length ? `(Adv. ${resAdvocates.join(', ')})` : '',
  ].filter(Boolean).join(' ') || '—';
 
  // Status label
  const statusRaw = c.caseStatus ?? 'UNKNOWN';           // e.g. "DISPOSED"
  const disposalRaw = c.disposalTypeRaw ?? '';           // e.g. "DECREED EX-PARTE"
  const caseStatusLabel = disposalRaw
    ? `${statusRaw} — ${disposalRaw}`
    : statusRaw;
 
  // Latest order summary (from judgmentOrders or interimOrders)
  const allOrders = [
    ...(c.judgmentOrders ?? []).map((o: any) => ({ ...o, _type: 'Judgment' })),
    ...(c.interimOrders  ?? []).map((o: any) => ({ ...o, _type: 'Order'   })),
  ].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

 const timelineOrders = [
  ...(c.interimOrders ?? []).map((o: any) => ({
     
    date: fmtDate(o.orderDate),
    raw_date: o.orderDate, // ✅ ADD THIS
    purpose: o.orderType || o.description || 'Interim Order',
    judge: o.judgeName || null,
    pdf_url: o.orderUrl ?? null,
      type: 'interim',
      
    })),

  ...(c.judgmentOrders ?? []).map((o: any) => ({
    date: fmtDate(o.orderDate),
    raw_date: o.orderDate, // ✅ ADD THIS
    purpose: o.orderType || 'Final Judgment',
    judge: o.judgeName || null,
    pdf_url: o.orderUrl ?? null,
      type: 'judgment',
    })),
].sort(
  (a, b) =>
    new Date(b.raw_date || '').getTime() -
    new Date(a.raw_date || '').getTime()
);
 
  const latestOrder = allOrders[0];
  const latestOrderSummary = latestOrder
    ? `${latestOrder._type} dated ${fmtDate(latestOrder.orderDate)}` +
      (latestOrder.description ? ` — ${latestOrder.description}` : '') +
      (c.disposalTypeRaw ? `. Case ${c.disposalTypeRaw}.` : '.')
    : null;
 
  // Next hearing — for disposed cases this is the decision date
  const nextHearing = c.caseStatus === 'DISPOSED'
    ? null
    : fmtDate(c.nextHearingDate);
 
  return {
    // ── fields consumed by CaseDetail › eCourts tab ──
    case_status:              caseStatusLabel,
    next_hearing_date:        nextHearing,
    court_name:               c.courtName   ?? null,
    judge:                    (c.judges ?? []).join(', ') || null,
    petitioner_and_advocate:  petStr  || '—',
    respondent_and_advocate:  resStr,
    latest_order_summary:     latestOrderSummary,
 
    // hearing_dates → used in "Recent Orders & Updates" panel
    hearing_dates:            hearings,
 
    // ── extra fields (useful for future UI) ──
    filing_number:            c.filingNumber        ?? null,
    registration_number:      c.registrationNumber  ?? null,
    registration_date:        fmtDate(c.registrationDate),
    first_hearing_date:       fmtDate(c.firstHearingDate),
    last_hearing_date:        fmtDate(c.lastHearingDate),
    decision_date:            fmtDate(c.decisionDate),
    case_duration_days:       c.caseDurationDays    ?? null,
    disposal_type:            c.disposalType        ?? null,
    disposal_type_raw:        c.disposalTypeRaw     ?? null,
    contested_status:         c.contestedStatus     ?? null,
    hearing_count:            c.hearingCount        ?? 0,
    order_count:              c.orderCount          ?? 0,
    has_judgment:             c.hasJudgments        ?? false,
    judgment_orders:          c.judgmentOrders      ?? [],
    interim_orders:           c.interimOrders       ?? [],
    case_type_raw:            c.caseTypeRaw         ?? null,
    case_type_sub:            c.caseTypeSub         ?? null,
    timeline_orders: timelineOrders,
  };
}
 
// ── ROUTE HANDLER ────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const cnr = request.nextUrl.searchParams.get('cnr');
 
  if (!cnr) {
    return NextResponse.json({ error: 'CNR number is required' }, { status: 400 });
  }
 
  try {
    // 1 — Check Supabase cache
    const { data: row } = await supabase
      .from('cases')
      .select('ecourts_data, ecourts_last_fetched')
      .eq('cnr_number', cnr)
      .single();
 
    const lastFetched = row?.ecourts_last_fetched
      ? new Date(row.ecourts_last_fetched).getTime() : 0;
    const isStale = Date.now() - lastFetched > CACHE_MS;
 
    // 2 — Return normalized cached data if fresh
    if (row?.ecourts_data && !isStale) {
      return NextResponse.json({
        source: 'cache',
        data: normalizeEcourtsData(row.ecourts_data),
      });
    }
 
    // 3 — Call eCourts API
    const apiRes = await fetch(`${ECOURTS_BASE}/${cnr}`, {
      headers: {
        Authorization: `Bearer ${process.env.ECOURTS_API_TOKEN}`,
        Accept: 'application/json',
      },
    });
 
    if (!apiRes.ok) {
      if (row?.ecourts_data) {
        return NextResponse.json({
          source: 'stale_cache',
          data: normalizeEcourtsData(row.ecourts_data),
          warning: 'eCourts API unavailable — showing last known data',
        });
      }
      throw new Error(`eCourts API error: ${apiRes.status}`);
    }
 
    const ecourtsRaw = await apiRes.json();
 
    // 4 — Persist raw response to Supabase
    // In Step 4, replace the existing .update() with:
        await supabase
        .from('cases')
        .update({
            ecourts_data:         ecourtsRaw,
            ecourts_last_fetched: new Date().toISOString(),
            // Keep the DB column in sync with live data
            next_hearing_date:    ecourtsRaw?.data?.courtCaseData?.nextHearingDate ?? null,
            judge_name:           (ecourtsRaw?.data?.courtCaseData?.judges ?? []).join(', ') || null,
            stage:                ecourtsRaw?.data?.courtCaseData?.purpose ?? null,
        })
        .eq('cnr_number', cnr);
        
    // 5 — Return normalized fresh data
    return NextResponse.json({
      source: 'live',
      data: normalizeEcourtsData(ecourtsRaw),
    });
 
  } catch (err: any) {
    console.error('court-status error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch court status' },
      { status: 500 }
    );
  }
}