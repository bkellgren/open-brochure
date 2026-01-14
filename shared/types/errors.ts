/**
 * Error types and codes for Open Brochure API
 */

export type ErrorCode =
  // Auth errors
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_TOKEN'
  // Validation errors
  | 'VALIDATION_ERROR'
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'INVALID_PANEL_POSITION'
  // Resource errors
  | 'NOT_FOUND'
  | 'BROCHURE_NOT_FOUND'
  | 'PANEL_NOT_FOUND'
  // Business logic errors
  | 'BROCHURE_PRIVATE'
  | 'EMBED_NOT_AVAILABLE'
  | 'SHARE_TOKEN_MISSING'
  // Server errors
  | 'INTERNAL_ERROR'
  | 'STORAGE_ERROR'
  | 'DATABASE_ERROR';

export interface ApiError {
  error: string;
  message: string;
  code: ErrorCode;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }

  toJSON(): ApiError {
    return {
      error: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

// Convenience factory functions
export const Errors = {
  unauthorized: (message = 'Authentication required') =>
    new AppError('UNAUTHORIZED', message, 401),

  forbidden: (message = 'Permission denied') => new AppError('FORBIDDEN', message, 403),

  notFound: (resource = 'Resource') => new AppError('NOT_FOUND', `${resource} not found`, 404),

  brochureNotFound: () => new AppError('BROCHURE_NOT_FOUND', 'Brochure not found', 404),

  validation: (message: string, details?: Record<string, unknown>) =>
    new AppError('VALIDATION_ERROR', message, 400, details),

  invalidFileType: () =>
    new AppError('INVALID_FILE_TYPE', 'Please upload a valid image (JPG, PNG) or PDF file', 400),

  fileTooLarge: () => new AppError('FILE_TOO_LARGE', 'File too large. Maximum size is 25 MB.', 413),

  brochurePrivate: () =>
    new AppError('BROCHURE_PRIVATE', 'This brochure is private and cannot be embedded', 403),

  internal: (message = 'Internal server error') =>
    new AppError('INTERNAL_ERROR', message, 500),
};
