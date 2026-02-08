import express from 'express';
import { createRow, updateRow, deleteCell } from '../controllers/cells.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/rows/create', createRow);
router.post('/rows/update', updateRow);
router.delete('/:spreadsheetId/:cellId', deleteCell);

export default router;
