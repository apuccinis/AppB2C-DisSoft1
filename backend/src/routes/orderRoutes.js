import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import {
  createOrderController,
  getOrderController,
  listOrdersController,
  previewOrderController,
} from '../controllers/orderController.js';

const router = Router();

// El modulo de trading requiere JWT en todos sus endpoints.
router.use(requireAuth);
router.post('/', createOrderController);
router.post('/preview', previewOrderController);
router.get('/', listOrdersController);
router.get('/:id', getOrderController);

export default router;
