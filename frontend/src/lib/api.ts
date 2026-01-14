import { getAccessToken } from './supabase';
import type {
  ListBrochuresResponse,
  GetBrochureResponse,
  GetPresignedUrlRequest,
  GetPresignedUrlResponse,
  GenerateShareLinkResponse,
  GetEmbedCodeResponse,
  GetCurrentUserResponse,
  UpdateBrochureRequest,
  Visibility,
} from '@open-brochure/shared';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api/v1';

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ============================================================================
// Auth API
// ============================================================================

export async function getCurrentUser(): Promise<GetCurrentUserResponse> {
  return apiRequest('/auth/me');
}

// ============================================================================
// Brochures API
// ============================================================================

export async function listBrochures(
  limit = 50,
  offset = 0
): Promise<ListBrochuresResponse> {
  return apiRequest(`/brochures?limit=${limit}&offset=${offset}`);
}

export async function getBrochure(id: string): Promise<GetBrochureResponse> {
  return apiRequest(`/brochures/${id}`);
}

export async function updateBrochure(
  id: string,
  data: UpdateBrochureRequest
): Promise<void> {
  await apiRequest(`/brochures/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteBrochure(id: string): Promise<void> {
  await apiRequest(`/brochures/${id}`, { method: 'DELETE' });
}

// ============================================================================
// Panels API
// ============================================================================

import type { Panel, PanelPosition, UpdatePanelsRequest } from '@open-brochure/shared';

export async function updatePanels(
  brochureId: string,
  panels: Array<{ id: string; position: PanelPosition }>
): Promise<Panel[]> {
  return apiRequest(`/brochures/${brochureId}/panels`, {
    method: 'PUT',
    body: JSON.stringify({ panels }),
  });
}

// ============================================================================
// Upload API
// ============================================================================

export async function getPresignedUrl(
  data: GetPresignedUrlRequest
): Promise<GetPresignedUrlResponse> {
  return apiRequest('/upload/presigned', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Upload a file directly to R2 using presigned URL
 */
export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ fileKey: string; fileUrl: string }> {
  // Get presigned URL
  const { uploadUrl, fileKey } = await getPresignedUrl({
    filename: file.name,
    contentType: file.type as 'image/jpeg' | 'image/png' | 'application/pdf',
  });

  // Upload directly to R2
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress((e.loaded / e.total) * 100);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });

  // Construct public URL (this depends on R2 configuration)
  const fileUrl = uploadUrl.split('?')[0];

  return { fileKey, fileUrl };
}

// ============================================================================
// Share API
// ============================================================================

export async function generateShareLink(
  brochureId: string
): Promise<GenerateShareLinkResponse> {
  return apiRequest(`/brochures/${brochureId}/share`, { method: 'POST' });
}

export async function getSharedBrochure(
  shareToken: string
): Promise<GetBrochureResponse> {
  return apiRequest(`/view/${shareToken}`);
}

// ============================================================================
// Embed API
// ============================================================================

export async function getEmbedCode(
  brochureId: string,
  width?: number,
  height?: number
): Promise<GetEmbedCodeResponse> {
  const params = new URLSearchParams();
  if (width) params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  const query = params.toString() ? `?${params}` : '';
  return apiRequest(`/brochures/${brochureId}/embed${query}`);
}
