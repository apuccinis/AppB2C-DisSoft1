import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import { getWalletController, listWalletsController } from '../controllers/walletController.js';

const router = Router();

// Todas las rutas de wallets son privadas.
router.use(requireAuth);
router.get('/', listWalletsController);
router.get('/:asset', getWalletController);

export default router;
