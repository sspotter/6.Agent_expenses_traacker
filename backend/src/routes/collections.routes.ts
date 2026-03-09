import { Router } from 'express';
import {
  getCollectionsByMonth,
  createOrUpdateCollection,
  updateCollection
} from '../controllers/collections.controller';

const router = Router();

router.get('/:month', getCollectionsByMonth);
router.post('/', createOrUpdateCollection);
router.put('/:id', updateCollection);

export default router;
