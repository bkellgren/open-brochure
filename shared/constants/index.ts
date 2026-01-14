/**
 * Shared constants for Open Brochure
 */

// File upload limits
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_FILE_SIZE_MB = 25;

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const;
export const ALLOWED_PDF_TYPE = 'application/pdf' as const;
export const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, ALLOWED_PDF_TYPE] as const;

// Panel configuration
export const PANEL_COUNT = 6;
export const OUTSIDE_PANELS = ['cover', 'back', 'inside_flap'] as const;
export const INSIDE_PANELS = ['left_panel', 'center_panel', 'right_panel'] as const;

// Share token configuration
export const SHARE_TOKEN_LENGTH = 32;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

// QR code defaults
export const DEFAULT_QR_SIZE = 200;
export const MIN_QR_SIZE = 100;
export const MAX_QR_SIZE = 1000;

// Embed defaults
export const DEFAULT_EMBED_WIDTH = 800;
export const DEFAULT_EMBED_HEIGHT = 600;

// Performance budgets
export const BUNDLE_SIZE_BUDGET_KB = 200;
export const INITIAL_LOAD_BUDGET_MS = 3000;
export const INTERACTION_BUDGET_MS = 100;
export const ANIMATION_BUDGET_MS = 300;
export const TARGET_FPS = 30;

// App info
export const APP_NAME = 'Open Brochure';
export const APP_DOMAIN = 'openbrochure.com';
