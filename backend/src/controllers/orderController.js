import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';
import { requirePositiveNumber, requireString } from '../utils/validation.js';
import { executeTrade, getOrder, listOrders, quoteTrade } from '../services/tradeService.js';

const parseTradeBody = (body) => ({
  fromAsset: requireString(body?.fromAsset, 'fromAsset', { max: 10 }).toUpperCase(),
  toAsset: requireString(body?.toAsset, 'toAsset', { max: 10 }).toUpperCase(),
  amount: requirePositiveNumber(body?.amount, 'amount'),
});

export const createOrderController = asyncHandler(async (req, res) => {
  const result = executeTrade(req.user.id, parseTradeBody(req.body));
  sendSuccess(res, result, 201);
});

export const previewOrderController = asyncHandler(async (req, res) => {
  sendSuccess(res, { preview: quoteTrade(parseTradeBody(req.body)) });
});

export const listOrdersController = asyncHandler(async (req, res) => {
  const { type, asset } = req.query;
  if (type && !['BUY', 'SELL'].includes(String(type).toUpperCase())) {
    throw ApiError.badRequest('Filter "type" must be BUY or SELL');
  }
  sendSuccess(res, { orders: listOrders(req.user.id, { type, asset }) });
});

export const getOrderController = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw ApiError.badRequest('Invalid order id');
  sendSuccess(res, { order: getOrder(req.user.id, id) });
});
