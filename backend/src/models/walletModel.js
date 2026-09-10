import db from '../database/db.js';
import { roundAmount } from '../utils/numbers.js';

export const toPublicWallet = (wallet) =>
  wallet ? { id: wallet.id, asset: wallet.asset, balance: wallet.balance } : null;

export const listWalletsByUser = (userId) =>
  db.prepare('SELECT * FROM wallets WHERE user_id = ? ORDER BY asset ASC').all(userId);

export const findWallet = (userId, asset) =>
  db
    .prepare('SELECT * FROM wallets WHERE user_id = ? AND asset = ?')
    .get(userId, String(asset).toUpperCase());

// Crea la wallet si no existe (una unica wallet por usuario + activo).
export const ensureWallet = (userId, asset, initialBalance = 0) => {
  const symbol = String(asset).toUpperCase();
  db.prepare(
    'INSERT INTO wallets (user_id, asset, balance) VALUES (?, ?, ?) ON CONFLICT (user_id, asset) DO NOTHING',
  ).run(userId, symbol, roundAmount(initialBalance));
  return findWallet(userId, symbol);
};

export const setWalletBalance = (userId, asset, balance) => {
  const symbol = String(asset).toUpperCase();
  const safeBalance = roundAmount(balance);
  if (safeBalance < 0) {
    // Defensa adicional al CHECK de la tabla: nunca guardar saldos negativos.
    throw new Error(`Negative balance rejected for ${symbol}`);
  }
  db.prepare('UPDATE wallets SET balance = ? WHERE user_id = ? AND asset = ?').run(
    safeBalance,
    userId,
    symbol,
  );
  return findWallet(userId, symbol);
};
