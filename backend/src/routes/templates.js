import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import * as templatesController from '../controllers/templatesController.js';

const router = express.Router();

// Get all available templates - public access (no auth required)
router.get('/', templatesController.getAllTemplates);

// Get a specific template by ID - public access (no auth required)
router.get('/:templateId', templatesController.getTemplateById);

// Generate template data (creates spreadsheet data from template) - public access (no auth required)
router.post('/:templateId/generate', templatesController.generateTemplate);

// Create custom template (admin only - future feature)
// router.post('/custom', authenticateToken, templatesController.createCustomTemplate);

export default router;
