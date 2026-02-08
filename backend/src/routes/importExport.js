import express from 'express';
import { importData, exportData } from '../controllers/importExport.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/import', importData);
router.get('/export', exportData);

export default router;
