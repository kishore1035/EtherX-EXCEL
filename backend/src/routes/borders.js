import express from 'express';
import { applyBorders } from '../controllers/borders.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply border preset to range
router.post('/:sheetId/borders/apply', authenticateToken, applyBorders);

export default router;
