-- Do konzole v Cloudflare: Storage & databases -> D1 -> your database -> Console

-- ── Telefon <-> párování s počitačem ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS pair_sessions (
  code TEXT PRIMARY KEY,
  created INTEGER NOT NULL,
  connected INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pair_scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL,
  isbn TEXT NOT NULL,
  ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pair_scans_code ON pair_scans (code, id);

-- ── Historie změn (přidání / úprava / smazání) ───────────────────────
CREATE TABLE IF NOT EXISTS book_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  action TEXT NOT NULL,
  book_key TEXT NOT NULL,
  stk TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT
);

CREATE INDEX IF NOT EXISTS idx_book_log_key ON book_log (book_key, id);
