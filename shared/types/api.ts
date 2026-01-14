/**
 * API request/response types for Open Brochure
 */

import type {
  Brochure,
  BrochureWithPanels,
  LibraryBrochure,
  Panel,
  PanelPosition,
  User,
  Visibility,
} from './models.js';

// ============================================================================
// Auth
// ============================================================================

export interface GetCurrentUserResponse extends User {}

// ============================================================================
// Brochures
// ============================================================================

export interface ListBrochuresParams {
  limit?: number;
  offset?: number;
}

export interface ListBrochuresResponse {
  brochures: LibraryBrochure[];
  total: number;
}

export interface CreateBrochureRequest {
  file: File;
  name?: string;
}

export interface CreateBrochureResponse extends BrochureWithPanels {}

export interface GetBrochureResponse extends BrochureWithPanels {}

export interface UpdateBrochureRequest {
  name?: string;
  visibility?: Visibility;
}

export interface UpdateBrochureResponse extends Brochure {}

// ============================================================================
// Panels
// ============================================================================

export interface UpdatePanelsRequest {
  panels: Array<{
    id: string;
    position: PanelPosition;
  }>;
}

export interface UpdatePanelsResponse extends Array<Panel> {}

// ============================================================================
// Share
// ============================================================================

export interface GenerateShareLinkResponse {
  shareUrl: string;
  shareToken: string;
  qrCodeDataUrl: string;
}

export interface GetQRCodeParams {
  size?: number;
}

export interface GetEmbedCodeParams {
  width?: number;
  height?: number;
}

export interface GetEmbedCodeResponse {
  embedCode: string;
  embedUrl: string;
}

// ============================================================================
// Upload
// ============================================================================

export interface GetPresignedUrlRequest {
  filename: string;
  contentType: 'image/jpeg' | 'image/png' | 'application/pdf';
}

export interface GetPresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  expiresAt: string;
}

// ============================================================================
// Downloads
// ============================================================================

export interface DownloadOriginalResponse {
  downloadUrl: string;
}
