import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { getPortfolio, getWallet } from '../services/walletService.js';

export const listWalletsController = asyncHandler(async (req, res) => {
  // req.user.id proviene del JWT: un usuario solo ve sus propias wallets.
  sendSuccess(res, getPortfolio(req.user.id));
});

export const getWalletController = asyncHandler(async (req, res) => {
  sendSuccess(res, { wallet: getWallet(req.user.id, req.params.asset) });
});
