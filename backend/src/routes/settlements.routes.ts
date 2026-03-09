import { Router } from 'express';
import {
  getSettlementsByMonth,
  createSettlement
} from '../controllers/settlements.controller';

const router = Router();

router.get('/:month', getSettlementsByMonth);
router.post('/', createSettlement);

export default router;
