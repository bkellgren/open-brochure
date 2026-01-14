import type { FastifyPluginAsync } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { validateUuid } from '../middleware/validate.js';
import { supabase } from '../lib/supabase.js';
import { getDownloadPresignedUrl } from '../lib/storage.js';
import { Errors } from '@open-brochure/shared';

const downloadsRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/brochures/:id/download/original
   * Get presigned URL for downloading the original brochure file
   */
  fastify.get<{
    Params: { id: string };
    Reply: { downloadUrl: string; filename: string; contentType: string };
  }>('/brochures/:id/download/original', { preHandler: requireAuth }, async (request) => {
    const { id } = request.params;
    const userId = request.user!.id;
    validateUuid(id);

    // Get brochure and verify ownership
    const { data: brochure, error } = await supabase
      .from('brochures')
      .select('id, user_id, name, original_file_url, original_file_type')
      .eq('id', id)
      .single();

    if (error || !brochure) {
      throw Errors.brochureNotFound();
    }

    if (brochure.user_id !== userId) {
      throw Errors.forbidden('You can only download your own brochures');
    }

    // Extract file key from URL
    // The URL format is typically: https://bucket.domain.com/users/{userId}/{timestamp}-{random}-{filename}
    // or for Supabase: https://project.supabase.co/storage/v1/object/public/brochures/{key}
    const url = new URL(brochure.original_file_url);
    let fileKey = url.pathname;

    // Remove leading slash and bucket name if present
    if (fileKey.startsWith('/')) {
      fileKey = fileKey.substring(1);
    }

    // For Supabase storage URLs, extract the key after the bucket name
    if (fileKey.includes('/object/public/')) {
      const parts = fileKey.split('/object/public/');
      if (parts.length > 1) {
        // Format: storage/v1/object/public/brochures/key
        const afterPublic = parts[1];
        const bucketAndKey = afterPublic.split('/');
        if (bucketAndKey.length > 1) {
          fileKey = bucketAndKey.slice(1).join('/');
        }
      }
    }

    // Generate presigned download URL
    const downloadUrl = await getDownloadPresignedUrl(fileKey, 3600);

    // Determine content type and filename
    const contentType = brochure.original_file_type === 'pdf'
      ? 'application/pdf'
      : 'image/jpeg';

    const extension = brochure.original_file_type === 'pdf' ? '.pdf' : '.jpg';
    const filename = `${brochure.name.replace(/[^a-zA-Z0-9 .-]/g, '_')}${extension}`;

    return {
      downloadUrl,
      filename,
      contentType,
    };
  });
};

export default downloadsRoutes;
