import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken } from '../utils/security.js';

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
    username: string;
    email: string;
  };
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
  const cookieToken = req.cookies?.admin_token;

  const candidateTokens = [headerToken, cookieToken].filter(Boolean) as string[];

  if (candidateTokens.length === 0) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized access. Session invalid or expired.',
      message: 'Unauthorized access.',
    });
    return;
  }

  let decoded: { id: string; username: string; email: string } | null = null;

  for (const token of candidateTokens) {
    const res = verifyAdminToken(token);
    if (res) {
      decoded = res;
      break;
    }
  }

  if (!decoded) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized access. Session invalid or expired.',
      message: 'Unauthorized access.',
    });
    return;
  }

  req.admin = decoded;
  next();
}
