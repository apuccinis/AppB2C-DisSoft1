import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import config from '../config/env.js';

// Conexion unica a SQLite reutilizada por toda la aplicacion.
fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

export const db = new Database(config.databasePath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export const initDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wallets (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      asset   TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 0 CHECK (balance >= 0),
      UNIQUE (user_id, asset)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type        TEXT NOT NULL CHECK (type IN ('BUY', 'SELL')),
      base_asset  TEXT NOT NULL,
      quote_asset TEXT NOT NULL,
      amount      REAL NOT NULL CHECK (amount > 0),
      price       REAL NOT NULL CHECK (price > 0),
      fee         REAL NOT NULL DEFAULT 0 CHECK (fee >= 0),
      total       REAL NOT NULL CHECK (total > 0),
      status      TEXT NOT NULL DEFAULT 'COMPLETED',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets (user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user  ON orders (user_id, created_at DESC);
  `);

  return db;
};

export default db;
