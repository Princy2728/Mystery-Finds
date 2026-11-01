import crypto from 'node:crypto';

export const SESSION_COOKIE_NAME = 'mr_session';

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
