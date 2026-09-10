import { ASSETS, QUOTE_ASSET } from '../config/assets.js';
import ApiError from '../utils/ApiError.js';
import { roundTo } from '../utils/numbers.js';
import {
  ensureWallet,
  findWallet,
  listWalletsByUser,
  toPublicWallet,
} from '../models/walletModel.js';
import { getPrice } from './priceService.js';

export const createDefaultWallets = (userId, balances = {}) => {
  for (const asset of ASSETS) {
    ensureWallet(userId, asset.symbol, balances[asset.symbol] ?? 0);
  }
  return listWalletsByUser(userId);
};

// Enriquece una wallet con su valoracion en USD segun el precio vigente.
const decorate = (wallet) => {
  const price = getPrice(wallet.asset);
  const asset = ASSETS.find((item) => item.symbol === wallet.asset);
  return {
    ...toPublicWallet(wallet),
    name: price.name,
    type: price.type,
    precision: asset ? asset.precision : 8,
    usdPrice: price.usdPrice,
    change24h: price.change24h,
    usdValue: roundTo(wallet.balance * price.usdPrice, 2),
  };
};

export const getPortfolio = (userId) => {
  // Garantiza que el usuario tenga una wallet por cada activo soportado.
  createDefaultWallets(userId);
  const wallets = listWalletsByUser(userId).map(decorate);
  const totalUsd = roundTo(
    wallets.reduce((sum, wallet) => sum + wallet.usdValue, 0),
    2,
  );
  return { wallets, totalUsd, quoteAsset: QUOTE_ASSET };
};

export const getWallet = (userId, asset) => {
  const wallet = findWallet(userId, asset);
  if (!wallet) throw ApiError.notFound(`Wallet not found for asset ${String(asset).toUpperCase()}`);
  return decorate(wallet);
};
