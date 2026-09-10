import bcrypt from 'bcryptjs';
import db, { initDatabase } from './db.js';
import { findUserByEmail } from '../models/userModel.js';
import { ensureWallet, setWalletBalance } from '../models/walletModel.js';
import { createDefaultWallets } from '../services/walletService.js';

// Usuario de demostracion SOLO para desarrollo local.
// La contrasena puede sobrescribirse con DEMO_PASSWORD en el .env.
const DEMO_USER = {
  name: 'Demo Trader',
  email: process.env.DEMO_EMAIL || 'demo@example.com',
  password: process.env.DEMO_PASSWORD || 'demo123',
};

const DEMO_BALANCES = {
  USD: 10000,
  EUR: 5000,
  BTC: 0.25,
  ETH: 2,
};

const seed = async () => {
  initDatabase();

  const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);
  const existing = findUserByEmail(DEMO_USER.email);

  let userId;
  if (existing) {
    db.prepare('UPDATE users SET name = ?, password_hash = ? WHERE id = ?').run(
      DEMO_USER.name,
      passwordHash,
      existing.id,
    );
    userId = existing.id;
    console.log(`  Usuario demo ya existia (id ${userId}): balances reiniciados.`);
  } else {
    const info = db
      .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run(DEMO_USER.name, DEMO_USER.email, passwordHash);
    userId = Number(info.lastInsertRowid);
    console.log(`  Usuario demo creado (id ${userId}).`);
  }

  createDefaultWallets(userId);
  for (const [asset, balance] of Object.entries(DEMO_BALANCES)) {
    ensureWallet(userId, asset);
    setWalletBalance(userId, asset, balance);
  }

  console.log('\n  Seed completado.');
  console.log(`  Email:    ${DEMO_USER.email}`);
  console.log(`  Password: ${DEMO_USER.password}`);
  console.log('  Balances:', DEMO_BALANCES);
  console.log('  El historial de ordenes arranca vacio a proposito.\n');
};

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed fallido:', error);
    process.exit(1);
  });
