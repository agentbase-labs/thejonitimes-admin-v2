/**
 * Postgres client for TheJoniTimes admin analytics.
 * Connection string comes from DATABASE_URL env (auto-injected by AgentBase/Render).
 */
import { Pool } from 'pg';

let _pool: Pool | null = null;

export function db(): Pool {
  if (_pool) return _pool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL env var is not set');
  }
  _pool = new Pool({
    connectionString: url,
    ssl: url.includes('localhost') ? false : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
  });
  return _pool;
}

// Alias for backwards compatibility with code that imported `analytics()`.
export function analytics(): Pool {
  return db();
}

/**
 * Read articles metadata. Historically read from a separate articles.db (SQLite).
 * In this v2 build we expose a JSON snapshot committed to the repo at data/articles.json.
 * It's refreshed periodically by a sync script.
 */
import fs from 'fs';
import path from 'path';

export type ArticleMeta = {
  id: number;
  slug: string;
  headline: string;
  topic: string;
  published_at: string;
  author: string;
  language: string;
  hero_rank: number | null;
};

let _articlesCache: ArticleMeta[] | null = null;

export function articlesList(): ArticleMeta[] {
  if (_articlesCache) return _articlesCache;
  try {
    const p = path.join(process.cwd(), 'data', 'articles.json');
    if (!fs.existsSync(p)) { _articlesCache = []; return _articlesCache; }
    _articlesCache = JSON.parse(fs.readFileSync(p, 'utf8')) as ArticleMeta[];
  } catch {
    _articlesCache = [];
  }
  return _articlesCache;
}

export function articleBySlug(slug: string): ArticleMeta | null {
  return articlesList().find((a) => a.slug === slug) || null;
}
