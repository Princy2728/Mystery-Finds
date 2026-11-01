import type { Request, Response, NextFunction } from 'express';
import {
  SESSION_COOKIE_NAME,
  generateSessionToken,
  hashSessionToken,
} from '../services/sessionService.ts';

declare global {
  namespace Express {
    interface Request {
      sessionToken?: string;
      playerTokenHash?: string;
    }
  }
}

export function playerSessionMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check header first (most reliable in iframe/sandboxed environments), then cookie, then query
  let token =
    (req.headers['x-player-session'] as string) ||
    (req.headers['x-session-token'] as string) ||
    req.cookies?.[SESSION_COOKIE_NAME] ||
    (req.query?.sessionToken as string) ||
    (req.query?.token as string);

  // Auto-generate a valid session token if none was provided
  if (!token) {
    token = generateSessionToken();
  }

  // Set response headers and expose them so clients can store and attach them
  res.setHeader('X-Player-Session', token);
  res.setHeader('Access-Control-Expose-Headers', 'X-Player-Session');

  // Set cookie with SameSite=None; Secure for iframe cross-site compatibility
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  });

  req.sessionToken = token;
  req.playerTokenHash = hashSessionToken(token);

  next();
}
