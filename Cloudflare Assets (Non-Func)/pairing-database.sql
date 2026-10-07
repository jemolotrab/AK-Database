-- Cloudflare: Storage & databases -> D1 -> your database -> Console
-- (tohle bylo zkopírované na Cloudflare pro vytvoření databáze)

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
