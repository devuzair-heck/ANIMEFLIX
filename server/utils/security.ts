import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'animeflix_secure_jwt_secret_key_default_32_chars';

export async function hashValue(plainText: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(plainText, saltRounds);
}

export async function compareValue(plainText: string, hashedText: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainText, hashedText);
  } catch {
    return false;
  }
}

export function signAdminToken(payload: { id: string; username: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h',
  });
}

export function verifyAdminToken(token: string): { id: string; username: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; email: string };
    return decoded;
  } catch {
    return null;
  }
}
