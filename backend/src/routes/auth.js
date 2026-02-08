import express from 'express';
import { sendOtp, verifyOtp, signup, getMe, logout, deactivateAccount, deleteAccount } from '../controllers/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/signup', signup);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);
router.post('/deactivate', authenticateToken, deactivateAccount);
router.delete('/delete', authenticateToken, deleteAccount);

export default router;
