import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..', '..');

dotenv.config({ path: path.join(backendRoot, '.env'), quiet: true });

const num = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET es obligatorio cuando NODE_ENV=production');
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: num(process.env.PORT, 5000),
  // Solo se usa un valor por defecto en desarrollo local, nunca en produccion.
  jwtSecret: process.env.JWT_SECRET || 'dev_only_insecure_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  tradingFeeRate: num(process.env.TRADING_FEE_RATE, 0.005),
  databasePath: path.resolve(backendRoot, process.env.DATABASE_PATH || './data/trading.db'),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  priceTickIntervalMs: num(process.env.PRICE_TICK_INTERVAL_MS, 3000),
  priceVolatility: num(process.env.PRICE_VOLATILITY, 0.0035),
};

export default config;
