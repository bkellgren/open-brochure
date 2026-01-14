import { MAX_FILE_SIZE_BYTES, ALLOWED_FILE_TYPES } from '@open-brochure/shared';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a file for upload
 */
export function validateFile(file: File): ValidationResult {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: 'Please upload a valid image (JPG, PNG) or PDF file',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large. Maximum size is 25 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Extract filename without extension
 */
export function getFileBasename(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return filename;
  return filename.substring(0, lastDot);
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot + 1).toLowerCase();
}

/**
 * Check if file is a PDF
 */
export function isPdf(file: File): boolean {
  return file.type === 'application/pdf';
}

/**
 * Check if file is an image
 */
export function isImage(file: File): boolean {
  return file.type === 'image/jpeg' || file.type === 'image/png';
}

/**
 * Generate a suggested name from filename
 */
export function suggestNameFromFile(filename: string): string {
  const basename = getFileBasename(filename);
  // Replace underscores and hyphens with spaces, title case
  return basename
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
