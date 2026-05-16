import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const articles = await req.json();
    if (!Array.isArray(articles)) return NextResponse.json({ error: 'expected array' }, { status: 400 });
    const p = path.join(process.cwd(), 'data', 'articles.json');
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(articles, null, 2));
    return NextResponse.json({ ok: true, count: articles.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
