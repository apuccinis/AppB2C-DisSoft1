import { Router } from 'express';
import {
  getHistoryController,
  getPriceController,
  listPricesController,
} from '../controllers/priceController.js';

const router = Router();

router.get('/', listPricesController);
router.get('/:asset', getPriceController);
router.get('/:asset/history', getHistoryController);

export default router;
