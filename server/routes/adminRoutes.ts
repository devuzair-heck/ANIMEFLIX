import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import {
  loginRateLimiter,
  verifyOtpRateLimiter,
  resendRateLimiter,
} from '../middleware/rateLimiter.js';

const router = Router();

// Public Auth Endpoints
router.post('/login', loginRateLimiter, adminController.login);
router.post('/verify-otp', verifyOtpRateLimiter, adminController.verifyOtp);
router.post('/resend-otp', resendRateLimiter, adminController.resendOtp);

// Protected Admin Endpoints
router.get('/me', requireAdmin, adminController.getMe);
router.post('/logout', requireAdmin, adminController.logout);

export default router;
