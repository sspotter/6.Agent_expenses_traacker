import { Router } from 'express';
import {
  getExpensesByMonth,
  createExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expenses.controller';

const router = Router();

router.get('/:month', getExpensesByMonth);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
