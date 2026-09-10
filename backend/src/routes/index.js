import { Router } from 'express';
import authRoutes from './authRoutes.js';
import priceRoutes from './priceRoutes.js';
import walletRoutes from './walletRoutes.js';
import orderRoutes from './orderRoutes.js';
import { listAssetsController } from '../controllers/priceController.js';
import config from '../config/env.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

router.get('/health', (_req, res) =>
  sendSuccess(res, {
    status: 'ok',
    uptime: Math.round(process.uptime()),
    feeRate: config.tradingFeeRate,
    timestamp: new Date().toISOString(),
  }),
);

router.get('/assets', listAssetsController);
router.use('/auth', authRoutes);
router.use('/prices', priceRoutes);
router.use('/wallets', walletRoutes);
router.use('/orders', orderRoutes);

export default router;
