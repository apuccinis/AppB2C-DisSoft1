import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { ASSETS } from '../config/assets.js';
import { getHistory, getPrice, getPrices } from '../services/priceService.js';

export const listAssetsController = asyncHandler(async (_req, res) => {
  const prices = getPrices();
  const assets = ASSETS.map((asset) => {
    const price = prices.find((item) => item.asset === asset.symbol);
    return {
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      precision: asset.precision,
      usdPrice: price.usdPrice,
      change24h: price.change24h,
    };
  });
  sendSuccess(res, { assets });
});

export const listPricesController = asyncHandler(async (_req, res) => {
  sendSuccess(res, { prices: getPrices(), updatedAt: new Date().toISOString() });
});

export const getPriceController = asyncHandler(async (req, res) => {
  sendSuccess(res, { price: getPrice(req.params.asset) });
});

export const getHistoryController = asyncHandler(async (req, res) => {
  sendSuccess(res, getHistory(req.params.asset, req.query.range || '24H'));
});
