import { Router } from 'express';
import { getMonthlySummary } from '../controllers/summary.controller';

const router = Router();

router.get('/:month', getMonthlySummary);

export default router;
