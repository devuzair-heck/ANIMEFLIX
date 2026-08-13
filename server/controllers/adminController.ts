import { Request, Response } from 'express';
import { Admin, IAdmin } from '../models/Admin.js';
import { OtpChallenge, IOtpChallenge } from '../models/OtpChallenge.js';
import {
  hashValue,
  compareValue,
  generateOtpCode,
  generateChallengeId,
  signAdminToken,
} from '../utils/security.js';
import { emailService } from '../services/emailService.js';
import { smsService } from '../services/smsService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// In-Memory Fallback Stores for development when MongoDB server is offline
const inMemoryAdmins: Map<string, IAdmin> = new Map();
const inMemoryChallenges: Map<string, IOtpChallenge> = new Map();

/**
 * Ensures a default seeded admin exists in DB or in-memory fallback
 */
export async function seedInitialAdmin(): Promise<IAdmin | null> {
  const adminUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
  const rawPassword = process.env.ADMIN_PASSWORD || 'SuperSecretAdminPassword123!';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@animeflix.com';
  const adminPhone = process.env.ADMIN_PHONE || '+15550192834';

  const passwordHash = await hashValue(rawPassword);

  try {
    let existing = await (Admin as any).findOne({ username: adminUsername });
    if (!existing) {
      existing = await Admin.create({
        username: adminUsername,
        passwordHash,
        email: adminEmail,
        phone: adminPhone,
      });
      console.log(`[Admin Seed] Admin account '${adminUsername}' bootstrapped in MongoDB.`);
    }
    return existing;
  } catch {
    // In-memory fallback
    const mockAdmin = {
      _id: 'seeded-admin-id-123',
      username: adminUsername,
      passwordHash,
      email: adminEmail,
      phone: adminPhone,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as IAdmin;

    inMemoryAdmins.set(adminUsername, mockAdmin);
    return mockAdmin;
  }
}

/**
 * Helper to find admin by username
 */
async function findAdminByUsername(username: string): Promise<IAdmin | null> {
  const normUsername = username.trim().toLowerCase();
  try {
    const doc = await (Admin as any).findOne({ username: normUsername });
    if (doc) return doc;
  } catch {
    // Fallback to in-memory store
  }

  return inMemoryAdmins.get(normUsername) || null;
}

/**
 * Helper to save/get challenge
 */
async function createChallengeRecord(data: {
  challengeId: string;
  adminId: string;
  username: string;
  emailOtpHash: string;
  smsOtpHash: string;
  expiresAt: Date;
  resendCooldownUntil: Date;
}): Promise<void> {
  try {
    await OtpChallenge.create({
      ...data,
      attempts: 0,
    });
  } catch {
    // Fallback in-memory
    const mockChallenge = {
      ...data,
      attempts: 0,
    } as unknown as IOtpChallenge;
    inMemoryChallenges.set(data.challengeId, mockChallenge);
  }
}

async function findChallengeById(challengeId: string): Promise<IOtpChallenge | null> {
  try {
    const doc = await (OtpChallenge as any).findOne({ challengeId });
    if (doc) return doc;
  } catch {
    // Fallback in-memory
  }
  return inMemoryChallenges.get(challengeId) || null;
}

async function updateChallengeRecord(challenge: IOtpChallenge): Promise<void> {
  try {
    if (typeof challenge.save === 'function') {
      await challenge.save();
      return;
    }
  } catch {
    // Fallback in-memory
  }
  inMemoryChallenges.set(challenge.challengeId, challenge);
}

async function deleteChallengeRecord(challengeId: string): Promise<void> {
  try {
    await (OtpChallenge as any).deleteOne({ challengeId });
  } catch {
    // Fallback in-memory
  }
  inMemoryChallenges.delete(challengeId);
}

export const adminController = {
  /**
   * POST /api/admin/login
   */
  async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body || {};

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Please enter both username and password.',
      });
      return;
    }

    const admin = await findAdminByUsername(username);

    if (!admin) {
      res.status(401).json({
        success: false,
        error: 'Invalid username or password.',
      });
      return;
    }

    const isPasswordValid = await compareValue(password, admin.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid username or password.',
      });
      return;
    }

    // Generate separate OTPs for Email and SMS
    const emailOtp = generateOtpCode();
    const smsOtp = generateOtpCode();

    const emailOtpHash = await hashValue(emailOtp);
    const smsOtpHash = await hashValue(smsOtp);

    const challengeId = generateChallengeId();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL
    const resendCooldownUntil = new Date(Date.now() + 60 * 1000); // 60s cooldown

    await createChallengeRecord({
      challengeId,
      adminId: String(admin._id),
      username: admin.username,
      emailOtpHash,
      smsOtpHash,
      expiresAt,
      resendCooldownUntil,
    });

    // Dispatch codes via services
    await emailService.sendEmailOtp(admin.email, emailOtp);
    await smsService.sendSmsOtp(admin.phone, smsOtp);

    res.status(200).json({
      success: true,
      requireOtp: true,
      challengeId,
      message: 'Credentials verified. Verification codes sent to email and SMS.',
    });
  },

  /**
   * POST /api/admin/verify-otp
   */
  async verifyOtp(req: Request, res: Response): Promise<void> {
    const { challengeId, emailOtp, smsOtp } = req.body || {};

    if (!challengeId || !emailOtp || !smsOtp) {
      res.status(400).json({
        success: false,
        error: 'Missing required verification fields.',
      });
      return;
    }

    const challenge = await findChallengeById(challengeId);

    if (!challenge) {
      res.status(400).json({
        success: false,
        error: 'Verification session invalid or expired. Please log in again.',
      });
      return;
    }

    // Check expiration
    if (new Date() > new Date(challenge.expiresAt)) {
      await deleteChallengeRecord(challengeId);
      res.status(400).json({
        success: false,
        error: 'Verification code expired. Please log in again.',
      });
      return;
    }

    // Check attempt limit (max 5)
    if (challenge.attempts >= 5) {
      await deleteChallengeRecord(challengeId);
      res.status(429).json({
        success: false,
        error: 'Too many failed attempts. Verification invalidated. Please log in again.',
      });
      return;
    }

    const isEmailValid = await compareValue(emailOtp, challenge.emailOtpHash);
    const isSmsValid = await compareValue(smsOtp, challenge.smsOtpHash);

    if (!isEmailValid || !isSmsValid) {
      challenge.attempts += 1;

      if (challenge.attempts >= 5) {
        await deleteChallengeRecord(challengeId);
        res.status(429).json({
          success: false,
          error: 'Too many failed attempts. Verification invalidated. Please log in again.',
        });
        return;
      }

      await updateChallengeRecord(challenge);

      res.status(400).json({
        success: false,
        error: 'Invalid verification codes. Please check both email and SMS codes.',
      });
      return;
    }

    // Both OTPs are valid!
    const admin = await findAdminByUsername(challenge.username);
    await deleteChallengeRecord(challengeId);

    const adminPayload = {
      id: admin ? String(admin._id) : 'admin-id',
      username: challenge.username,
      email: admin ? admin.email : 'admin@animeflix.com',
    };

    const token = signAdminToken(adminPayload);

    // Set secure HTTP-only cookie
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).json({
      success: true,
      message: 'Admin authenticated successfully.',
      token,
      admin: adminPayload,
    });
  },

  /**
   * POST /api/admin/resend-otp
   */
  async resendOtp(req: Request, res: Response): Promise<void> {
    const { challengeId } = req.body || {};

    if (!challengeId) {
      res.status(400).json({
        success: false,
        error: 'Missing challenge ID.',
      });
      return;
    }

    const challenge = await findChallengeById(challengeId);

    if (!challenge) {
      res.status(400).json({
        success: false,
        error: 'Verification session expired. Please log in again.',
      });
      return;
    }

    // Enforce 60-second cooldown
    if (new Date() < new Date(challenge.resendCooldownUntil)) {
      const waitSecs = Math.ceil((new Date(challenge.resendCooldownUntil).getTime() - Date.now()) / 1000);
      res.status(429).json({
        success: false,
        error: `Please wait ${waitSecs} seconds before requesting new codes.`,
      });
      return;
    }

    // Generate new codes
    const newEmailOtp = generateOtpCode();
    const newSmsOtp = generateOtpCode();

    challenge.emailOtpHash = await hashValue(newEmailOtp);
    challenge.smsOtpHash = await hashValue(newSmsOtp);
    challenge.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Reset 5 min TTL
    challenge.resendCooldownUntil = new Date(Date.now() + 60 * 1000); // Reset 60s cooldown
    challenge.attempts = 0; // Reset attempts for new codes

    await updateChallengeRecord(challenge);

    const admin = await findAdminByUsername(challenge.username);
    const targetEmail = admin ? admin.email : 'admin@animeflix.com';
    const targetPhone = admin ? admin.phone : '+15550192834';

    await emailService.sendEmailOtp(targetEmail, newEmailOtp);
    await smsService.sendSmsOtp(targetPhone, newSmsOtp);

    res.status(200).json({
      success: true,
      message: 'New verification codes sent to email and SMS.',
    });
  },

  /**
   * GET /api/admin/me
   */
  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      admin: req.admin,
    });
  },

  /**
   * POST /api/admin/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('admin_token');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  },
};
