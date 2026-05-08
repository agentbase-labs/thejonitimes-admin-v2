import { db, articlesList, articleBySlug } from './db';

const DAY = 86400;

function startOfTodayUTC(): number {
  const d = new Date();
  const utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor(utc / 1000);
}

async function q<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const r = await db().query(sql, params);
  return r.rows as T[];
}

export async function kpis() {
  const now = Math.floor(Date.now() / 1000);
  const today0 = startOfTodayUTC();
  const [t, td, u, a] = await Promise.all([
    q<{ n: string }>('SELECT COUNT(*)::bigint AS n FROM pageviews'),
    q<{ n: string }>('SELECT COUNT(*)::bigint AS n FROM pageviews WHERE ts >= $1', [today0]),
    q<{ n: string }>("SELECT COUNT(DISTINCT session_id)::bigint AS n FROM pageviews WHERE ts >= $1 AND session_id <> ''", [today0]),
    q<{ n: string }>("SELECT COUNT(DISTINCT session_id)::bigint AS n FROM pageviews WHERE ts >= $1 AND session_id <> ''", [now - 900]),
  ]);
  const num = (rows: { n: string }[]) => Number(rows[0]?.n || 0);
  return { total: num(t), today: num(td), uniqueToday: num(u), active15: num(a) };
}

export async function pageviewsByDay(days = 30) {
  const now = Math.floor(Date.now() / 1000);
  const from = now - days * DAY;
  const rows = await q<{ day: string; n: string }>(
    `SELECT TO_CHAR(TO_TIMESTAMP(ts), 'YYYY-MM-DD') AS day, COUNT(*)::bigint AS n
     FROM pageviews WHERE ts >= $1
     GROUP BY day ORDER BY day ASC`,
    [from],
  );
  const map = new Map(rows.map((r) => [r.day, Number(r.n)]));
  const out: { day: string; n: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date((now - i * DAY) * 1000);
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key, n: map.get(key) || 0 });
  }
  return out;
}

export async function pageviewsByHourToday() {
  const today0 = startOfTodayUTC();
  const rows = await q<{ hour: number; n: string }>(
    `SELECT EXTRACT(HOUR FROM TO_TIMESTAMP(ts))::int AS hour, COUNT(*)::bigint AS n
     FROM pageviews WHERE ts >= $1
     GROUP BY hour ORDER BY hour ASC`,
    [today0],
  );
  const map = new Map(rows.map((r) => [r.hour, Number(r.n)]));
  return Array.from({ length: 24 }, (_, h) => ({ hour: h, n: map.get(h) || 0 }));
}

export async function topCountries(limit = 10) {
  const rows = await q<{ country: string; n: string }>(
    `SELECT country, COUNT(*)::bigint AS n FROM pageviews
     WHERE country IS NOT NULL AND country <> ''
     GROUP BY country ORDER BY n DESC LIMIT $1`,
    [limit],
  );
  return rows.map((r) => ({ country: r.country, n: Number(r.n) }));
}

export async function deviceSplit() {
  const rows = await q<{ device: string; n: string }>(
    `SELECT COALESCE(device, 'other') AS device, COUNT(*)::bigint AS n FROM pageviews
     GROUP BY device ORDER BY n DESC`,
  );
  return rows.map((r) => ({ device: r.device, n: Number(r.n) }));
}

export async function topArticlesSafe(limit = 10, sinceTs?: number) {
  let sql: string;
  let args: any[];
  if (sinceTs) {
    sql = `SELECT slug, COUNT(*)::bigint AS n FROM pageviews
           WHERE ts >= $1 AND slug IS NOT NULL AND slug <> ''
           GROUP BY slug ORDER BY n DESC LIMIT $2`;
    args = [sinceTs, limit];
  } else {
    sql = `SELECT slug, COUNT(*)::bigint AS n FROM pageviews
           WHERE slug IS NOT NULL AND slug <> ''
           GROUP BY slug ORDER BY n DESC LIMIT $1`;
    args = [limit];
  }
  const rows = await q<{ slug: string; n: string }>(sql, args);
  return rows.map((r) => {
    const a = articleBySlug(r.slug);
    return { slug: r.slug, n: Number(r.n), headline: a?.headline || r.slug, topic: a?.topic || '—' };
  });
}

export async function recentReferrers(limit = 20) {
  const rows = await q<{ referrer: string; n: string }>(
    `SELECT referrer, COUNT(*)::bigint AS n FROM pageviews
     WHERE referrer IS NOT NULL AND referrer <> ''
     GROUP BY referrer ORDER BY n DESC LIMIT $1`,
    [limit],
  );
  return rows.map((r) => {
    let host = r.referrer;
    try { host = new URL(r.referrer).hostname || r.referrer; } catch {}
    return { referrer: r.referrer, n: Number(r.n), host };
  });
}

export async function recentPageviews(limit = 30) {
  const rows = await q<any>(
    `SELECT id, ts, path, slug, country, device, browser, referrer, lang
     FROM pageviews ORDER BY id DESC LIMIT $1`,
    [limit],
  );
  return rows.map((r) => {
    if (r.slug) {
      const a = articleBySlug(r.slug);
      r.headline = a?.headline || r.slug;
    }
    return r;
  });
}

export type ArticleStat = {
  id: number;
  slug: string;
  headline: string;
  topic: string;
  published_at: string;
  author: string;
  language: string;
  hero_rank: number | null;
  views_total: number;
  views_today: number;
};

export async function articleStats(): Promise<ArticleStat[]> {
  const today0 = startOfTodayUTC();
  const [totalRows, todayRows] = await Promise.all([
    q<{ slug: string; n: string }>(
      `SELECT slug, COUNT(*)::bigint AS n FROM pageviews
       WHERE slug IS NOT NULL AND slug <> ''
       GROUP BY slug`,
    ),
    q<{ slug: string; n: string }>(
      `SELECT slug, COUNT(*)::bigint AS n FROM pageviews
       WHERE slug IS NOT NULL AND slug <> '' AND ts >= $1
       GROUP BY slug`,
      [today0],
    ),
  ]);
  const total = new Map(totalRows.map((r) => [r.slug, Number(r.n)]));
  const today = new Map(todayRows.map((r) => [r.slug, Number(r.n)]));
  const arts = articlesList();
  return arts
    .sort((a, b) => (a.published_at < b.published_at ? 1 : -1))
    .map((a) => ({
      id: a.id,
      slug: a.slug,
      headline: a.headline,
      topic: a.topic,
      published_at: a.published_at,
      author: a.author,
      language: a.language,
      hero_rank: a.hero_rank,
      views_total: total.get(a.slug) || 0,
      views_today: today.get(a.slug) || 0,
    }));
}
