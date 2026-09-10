import config from '../config/env.js';
import { assetBySymbol, isValidAsset, resolvePair } from '../config/assets.js';
import db from '../database/db.js';
import ApiError from '../utils/ApiError.js';
import { EPSILON, roundForAsset, roundTo } from '../utils/numbers.js';
import { createOrder, findUserOrder, listOrdersByUser, toPublicOrder } from '../models/orderModel.js';
import { ensureWallet, findWallet, setWalletBalance } from '../models/walletModel.js';
import { getPairPrice } from './priceService.js';
import { getPortfolio } from './walletService.js';

/**
 * Calcula una operacion sin tocar la base de datos.
 *
 * Convencion usada en todo el prototipo:
 *  - `amount` de la orden es siempre la cantidad del activo BASE.
 *  - `price` es el precio de 1 BASE expresado en QUOTE.
 *  - `fee` se cobra siempre en el activo QUOTE.
 *  - `total` es la cantidad de QUOTE que entra o sale de la wallet del usuario.
 *
 * BUY  (se gasta QUOTE para recibir BASE): total = importe gastado = subtotal + fee.
 * SELL (se vende BASE para recibir QUOTE): total = importe recibido = subtotal - fee.
 */
export const quoteTrade = ({ fromAsset, toAsset, amount }) => {
  const from = String(fromAsset || '').toUpperCase();
  const to = String(toAsset || '').toUpperCase();

  if (!isValidAsset(from) || !isValidAsset(to)) {
    throw ApiError.badRequest('Both fromAsset and toAsset must be supported assets');
  }
  if (from === to) {
    throw ApiError.badRequest('fromAsset and toAsset must be different');
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw ApiError.badRequest('Amount must be greater than zero');
  }

  const { base, quote } = resolvePair(from, to);
  const price = getPairPrice(base, quote);
  const feeRate = config.tradingFeeRate;
  const type = from === quote ? 'BUY' : 'SELL';

  let spendAmount;
  let receiveAmount;
  let fee;
  let subtotal;
  let baseAmount;

  if (type === 'BUY') {
    // Se gasta QUOTE: la comision se descuenta del importe indicado.
    spendAmount = roundForAsset(amount, quote);
    fee = roundForAsset(spendAmount * feeRate, quote);
    subtotal = roundForAsset(spendAmount - fee, quote);
    baseAmount = roundForAsset(subtotal / price, base);
    receiveAmount = baseAmount;
  } else {
    // Se vende BASE: la comision se descuenta del importe recibido en QUOTE.
    spendAmount = roundForAsset(amount, base);
    baseAmount = spendAmount;
    subtotal = roundForAsset(spendAmount * price, quote);
    fee = roundForAsset(subtotal * feeRate, quote);
    receiveAmount = roundForAsset(subtotal - fee, quote);
  }

  if (!(baseAmount > 0) || !(receiveAmount > 0) || !(subtotal > 0)) {
    throw ApiError.unprocessable('Amount is too small to execute this trade');
  }

  return {
    type,
    fromAsset: from,
    toAsset: to,
    baseAsset: base,
    quoteAsset: quote,
    pair: `${base}/${quote}`,
    price: roundTo(price, assetBySymbol(quote).type === 'FIAT' ? 4 : 8),
    feeRate,
    fee,
    feeAsset: quote,
    subtotal,
    amount: baseAmount,
    spendAmount,
    receiveAmount,
    total: type === 'BUY' ? spendAmount : receiveAmount,
  };
};

const assertSufficientBalance = (userId, asset, required) => {
  const wallet = ensureWallet(userId, asset);
  if (wallet.balance + EPSILON < required) {
    throw ApiError.unprocessable(
      `Insufficient ${asset} balance. Available ${wallet.balance}, required ${required}`,
    );
  }
  return wallet;
};

export const executeTrade = (userId, payload) => {
  // El backend recalcula todo con el precio vigente: nunca confia en el frontend.
  const preview = quoteTrade(payload);

  const run = db.transaction(() => {
    assertSufficientBalance(userId, preview.fromAsset, preview.spendAmount);
    ensureWallet(userId, preview.toAsset);

    const fromWallet = findWallet(userId, preview.fromAsset);
    const toWallet = findWallet(userId, preview.toAsset);

    const nextFrom = fromWallet.balance - preview.spendAmount;
    if (nextFrom < -EPSILON) {
      throw ApiError.unprocessable(`Insufficient ${preview.fromAsset} balance`);
    }

    setWalletBalance(userId, preview.fromAsset, Math.max(nextFrom, 0));
    setWalletBalance(userId, preview.toAsset, toWallet.balance + preview.receiveAmount);

    return createOrder({
      userId,
      type: preview.type,
      baseAsset: preview.baseAsset,
      quoteAsset: preview.quoteAsset,
      amount: preview.amount,
      price: preview.price,
      fee: preview.fee,
      total: preview.total,
      status: 'COMPLETED',
    });
  });

  const order = run();

  return {
    order: toPublicOrder(order),
    execution: preview,
    portfolio: getPortfolio(userId),
  };
};

export const listOrders = (userId, filters) =>
  listOrdersByUser(userId, filters).map(toPublicOrder);

export const getOrder = (userId, id) => {
  const order = findUserOrder(userId, id);
  // Ownership: una orden de otro usuario se trata como inexistente.
  if (!order) throw ApiError.notFound('Order not found');
  return toPublicOrder(order);
};
