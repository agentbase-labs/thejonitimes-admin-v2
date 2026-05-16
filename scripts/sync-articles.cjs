#!/usr/bin/env node
/**
 * Sync articles from SQLite DB to data/articles.json
 * Run: node scripts/sync-articles.cjs
 */
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = '/home/node/.joni/workspace/projects/thejonitimes/data/articles.db';
const OUT_PATH = path.join(__dirname, '..', 'data', 'articles.json');

const db = new Database(DB_PATH, { readonly: true });
const articles = db.prepare('SELECT id, slug, headline, topic, published_at, author, language, hero_rank, subject_name FROM articles ORDER BY id DESC').all();
db.close();

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(articles, null, 2));
console.log(`[sync-articles] wrote ${articles.length} articles → ${OUT_PATH}`);
