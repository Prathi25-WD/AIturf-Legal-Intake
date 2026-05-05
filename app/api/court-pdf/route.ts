import { NextRequest, NextResponse } from 'next/server';

const PARTNER_BASE = 'https://webapi.ecourtsindia.com/api/partner';

export async function GET(request: NextRequest) {
  const filename = request.nextUrl.searchParams.get('file');
  const cnr      = request.nextUrl.searchParams.get('cnr');

  if (!filename || !cnr) {
    return NextResponse.json({ error: 'file and cnr required' }, { status: 400 });
  }

  const url = `${PARTNER_BASE}/case/${cnr}/order/${filename}`;
  console.log('[court-pdf] fetching:', url);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.ECOURTS_API_TOKEN}`,
      Accept: 'application/pdf',
    },
  });

  console.log('[court-pdf] status:', res.status, 'content-type:', res.headers.get('content-type'));

  if (!res.ok) {
    return NextResponse.json({ error: `eCourts returned ${res.status}` }, { status: res.status });
  }

  const buffer = await res.arrayBuffer();
  const downloadFilename = `ecourts-${cnr}-${filename}`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `inline; filename="${downloadFilename}"`,
      'Cache-Control':       'private, max-age=3600',
    },
  });
}