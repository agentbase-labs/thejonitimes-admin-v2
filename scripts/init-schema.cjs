#!/usr/bin/env node
/**
 * Postgres schema setup. Runs as postinstall.
 * Tolerates missing DATABASE_URL (e.g. during build-without-db).
 */
const url = process.env.DATABASE_URL;
if (!url) {
  console.log('• No DATABASE_URL — skipping schema init (build-only mode).');
  process.exit(0);
}

(async () => {
  const { Client } = require('pg');
  const client = new Client({
    connectionString: url,
    ssl: url.includes('localhost') ? false : { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS pageviews (
        id BIGSERIAL PRIMARY KEY,
        ts BIGINT NOT NULL,
        path TEXT NOT NULL,
        referrer TEXT,
        country TEXT,
        user_agent TEXT,
        device TEXT,
        browser TEXT,
        session_id TEXT,
        slug TEXT,
        lang TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_pageviews_ts ON pageviews(ts DESC);
      CREATE INDEX IF NOT EXISTS idx_pageviews_slug ON pageviews(slug);
      CREATE INDEX IF NOT EXISTS idx_pageviews_country ON pageviews(country);
    `);
    console.log('✓ Postgres schema ready (pageviews + indexes)');
  } catch (e) {
    console.warn('! Schema init failed (not fatal during build):', e.message);
  } finally {
    try { await client.end(); } catch {}
  }
})();
