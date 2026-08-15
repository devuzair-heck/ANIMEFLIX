import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public Admin Auth Endpoint (Strictly username + password, NO 2FA/OTP)
router.post('/login', loginRateLimiter, adminController.login);

// Protected Admin Endpoints
router.get('/me', requireAdmin, adminController.getMe);
router.post('/logout', requireAdmin, adminController.logout);

export default router;
