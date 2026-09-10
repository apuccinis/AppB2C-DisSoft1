import { assetBySymbol } from '../config/assets.js';

// Tolerancia para comparaciones de saldo (evita falsos negativos por coma flotante).
export const EPSILON = 1e-9;

export const roundTo = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

// Redondeo interno de saldos: 8 decimales cubren cripto y fiat sin perder precision.
export const roundAmount = (value) => roundTo(value, 8);

// Redondeo para presentar/almacenar segun el activo (USD 2, BTC 8, ...).
export const roundForAsset = (value, symbol) => {
  const asset = assetBySymbol(symbol);
  return roundTo(value, asset ? asset.precision : 8);
};

export const isPositiveNumber = (value) => Number.isFinite(value) && value > 0;
