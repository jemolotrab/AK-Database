-- Run these in Cloudflare: Storage & databases -> D1 -> your database -> Console
-- (paste and run them one at a time if the console complains).
-- Safe to run again: nothing is deleted or overwritten.

-- ── Phone <-> computer pairing ─────────────────────────────────────
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

-- ── History of changes (add / edit / delete) ───────────────────────
CREATE TABLE IF NOT EXISTS book_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,          -- when (milliseconds)
  action TEXT NOT NULL,         -- add | edit | delete
  book_key TEXT NOT NULL,       -- last 4 letters of the STK, the same for the whole life of the book
  stk TEXT NOT NULL,            -- full STK at that moment
  title TEXT NOT NULL,
  details TEXT                  -- JSON with the list of changes (for edits)
);

CREATE INDEX IF NOT EXISTS idx_book_log_key ON book_log (book_key, id);
