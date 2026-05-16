import { NextRequest, NextResponse } from 'next/server';
import { analytics } from '../../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Temporary debug endpoint - shows raw DB row
export async function GET(req: NextRequest) {
  const rows = await analytics().query(
    'SELECT id, ts, path, country, user_agent, device, browser FROM pageviews ORDER BY id DESC LIMIT 3'
  );
  return NextResponse.json({ rows: rows.rows }, { headers: { 'Access-Control-Allow-Origin': '*' } });
}
