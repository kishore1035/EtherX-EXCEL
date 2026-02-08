import express from 'express';
import {
  listSpreadsheets,
  createSpreadsheet,
  getSpreadsheet,
  updateSpreadsheet,
  deleteSpreadsheet,
} from '../controllers/spreadsheets.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', listSpreadsheets);
router.post('/', createSpreadsheet);
router.get('/:id', getSpreadsheet);
router.put('/:id', updateSpreadsheet);
router.delete('/:id', deleteSpreadsheet);

export default router;
