export type ApiErrorCode =
  | 'INVALID_REQUEST'
  | 'INVALID_ID'
  | 'NO_SESSION'
  | 'FORBIDDEN'
  | 'CASE_NOT_FOUND'
  | 'CLUE_NOT_FOUND'
  | 'SUSPECT_NOT_FOUND'
  | 'CASE_COMPLETED'
  | 'CASE_NOT_COMPLETED'
  | 'NO_HINTS_REMAINING'
  | 'UNPROCESSABLE_CONTENT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'AI_INVALID_RESPONSE'
  | 'AI_UNAVAILABLE'
  | 'DB_UNAVAILABLE';

export class ApiError extends Error {
  public status: number;
  public code: ApiErrorCode;

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }

  static badRequest(message: string, code: ApiErrorCode = 'INVALID_REQUEST') {
    return new ApiError(400, code, message);
  }

  static invalidId(message: string = 'Invalid ID provided') {
    return new ApiError(400, 'INVALID_ID', message);
  }

  static unauthorized(message: string = 'Session token required') {
    return new ApiError(401, 'NO_SESSION', message);
  }

  static forbidden(message: string = 'This case belongs to another session') {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(code: 'CASE_NOT_FOUND' | 'CLUE_NOT_FOUND' | 'SUSPECT_NOT_FOUND', message: string) {
    return new ApiError(404, code, message);
  }

  static conflict(code: 'CASE_COMPLETED' | 'CASE_NOT_COMPLETED' | 'NO_HINTS_REMAINING', message: string) {
    return new ApiError(409, code, message);
  }

  static rateLimited(message: string = 'Too many requests, try again shortly') {
    return new ApiError(429, 'RATE_LIMITED', message);
  }

  static aiInvalid(message: string = 'AI generated response failed validation') {
    return new ApiError(502, 'AI_INVALID_RESPONSE', message);
  }

  static aiUnavailable(message: string = 'AI service temporarily unavailable') {
    return new ApiError(503, 'AI_UNAVAILABLE', message);
  }

  static internal(message: string = 'An unexpected internal error occurred') {
    return new ApiError(500, 'INTERNAL_ERROR', message);
  }
}
