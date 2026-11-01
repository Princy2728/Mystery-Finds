import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.ts';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Handle SyntaxError (e.g. malformed JSON in request body)
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Malformed JSON payload provided.',
      },
    });
  }

  const message =
    process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : (err as Error)?.message || 'An unexpected error occurred.';

  console.error('[Internal Error]:', err);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
}
