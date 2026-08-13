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
  let token: string | undefined = req.cookies?.admin_token;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized access. Session invalid or expired.',
    });
    return;
  }

  const decoded = verifyAdminToken(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized access. Session invalid or expired.',
    });
    return;
  }

  req.admin = decoded;
  next();
}
