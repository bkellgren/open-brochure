import type { FastifyPluginAsync } from 'fastify';
import { optionalAuth } from '../middleware/auth.js';
import { validateFile } from '../middleware/validate.js';
import { getUploadPresignedUrl, generateFileKey } from '../lib/storage.js';
import type { GetPresignedUrlRequest, GetPresignedUrlResponse } from '@open-brochure/shared';

const uploadRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/v1/upload/presigned
   * Get a presigned URL for direct upload to R2
   */
  fastify.post<{
    Body: GetPresignedUrlRequest;
    Reply: GetPresignedUrlResponse;
  }>('/presigned', { preHandler: optionalAuth }, async (request) => {
    const { filename, contentType } = request.body;

    // Validate content type
    validateFile(contentType, undefined);

    // Generate unique file key
    const userId = request.user?.id || null;
    const fileKey = generateFileKey(userId, filename);

    // Get presigned upload URL (valid for 1 hour)
    const uploadUrl = await getUploadPresignedUrl(fileKey, contentType, 3600);

    // Calculate expiration
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    return {
      uploadUrl,
      fileKey,
      expiresAt,
    };
  });
};

export default uploadRoutes;
