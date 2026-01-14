import type { FastifyRequest } from 'fastify';
import { Errors, MAX_FILE_SIZE_BYTES, ALLOWED_FILE_TYPES } from '@open-brochure/shared';

/**
 * Validate uploaded file type and size
 */
export function validateFile(
  contentType: string | undefined,
  size: number | undefined
): void {
  // Check content type
  if (!contentType || !ALLOWED_FILE_TYPES.includes(contentType as any)) {
    throw Errors.invalidFileType();
  }

  // Check file size
  if (size && size > MAX_FILE_SIZE_BYTES) {
    throw Errors.fileTooLarge();
  }
}

/**
 * Validate UUID format
 */
export function validateUuid(id: string, fieldName = 'id'): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw Errors.validation(`Invalid ${fieldName} format`);
  }
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  limit?: number,
  offset?: number
): { limit: number; offset: number } {
  const validLimit = Math.min(Math.max(1, limit || 50), 100);
  const validOffset = Math.max(0, offset || 0);
  return { limit: validLimit, offset: validOffset };
}

/**
 * Validate brochure name
 */
export function validateBrochureName(name: string | undefined): string {
  if (!name || name.trim().length === 0) {
    throw Errors.validation('Brochure name is required');
  }
  if (name.length > 200) {
    throw Errors.validation('Brochure name must be 200 characters or less');
  }
  return name.trim();
}
