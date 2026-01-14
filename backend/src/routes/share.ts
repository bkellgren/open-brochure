import type { FastifyPluginAsync } from 'fastify';
import { nanoid } from 'nanoid';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validateUuid } from '../middleware/validate.js';
import { supabase } from '../lib/supabase.js';
import { Errors, SHARE_TOKEN_LENGTH, APP_DOMAIN, type GenerateShareLinkResponse } from '@open-brochure/shared';

const shareRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/v1/brochures/:id/share
   * Generate share link and QR code for a brochure
   */
  fastify.post<{
    Params: { id: string };
    Reply: GenerateShareLinkResponse;
  }>('/brochures/:id/share', { preHandler: requireAuth }, async (request) => {
    const { id } = request.params;
    const userId = request.user!.id;
    validateUuid(id);

    // Get brochure and verify ownership
    const { data: brochure, error } = await supabase
      .from('brochures')
      .select('id, user_id, share_token')
      .eq('id', id)
      .single();

    if (error || !brochure) {
      throw Errors.brochureNotFound();
    }

    if (brochure.user_id !== userId) {
      throw Errors.forbidden('You can only share your own brochures');
    }

    // Generate share token if not exists
    let shareToken = brochure.share_token;
    if (!shareToken) {
      shareToken = nanoid(SHARE_TOKEN_LENGTH);
      await supabase
        .from('brochures')
        .update({ share_token: shareToken })
        .eq('id', id);
    }

    const shareUrl = `https://${APP_DOMAIN}/view/${shareToken}`;

    // QR code is generated client-side for efficiency
    // Return a placeholder for the data URL format
    const qrCodeDataUrl = ''; // Client generates this

    return {
      shareUrl,
      shareToken,
      qrCodeDataUrl,
    };
  });

  /**
   * GET /api/v1/view/:shareToken
   * View a shared brochure (public endpoint)
   */
  fastify.get<{
    Params: { shareToken: string };
  }>('/view/:shareToken', { preHandler: optionalAuth }, async (request) => {
    const { shareToken } = request.params;

    const { data: brochure, error } = await supabase
      .from('brochures')
      .select(`
        *,
        panels (*)
      `)
      .eq('share_token', shareToken)
      .single();

    if (error || !brochure) {
      throw Errors.notFound('Brochure');
    }

    // Increment view count if viewer is not the owner
    const isOwner = request.user?.id === brochure.user_id;
    if (!isOwner) {
      await supabase
        .from('brochures')
        .update({ view_count: brochure.view_count + 1 })
        .eq('id', brochure.id);
    }

    return {
      id: brochure.id,
      userId: brochure.user_id,
      name: brochure.name,
      visibility: brochure.visibility,
      originalFileUrl: brochure.original_file_url,
      originalFileType: brochure.original_file_type,
      thumbnailUrl: brochure.thumbnail_url,
      shareToken: brochure.share_token,
      viewCount: brochure.view_count + (isOwner ? 0 : 1),
      createdAt: new Date(brochure.created_at),
      updatedAt: new Date(brochure.updated_at),
      panels: brochure.panels.map((p: any) => ({
        id: p.id,
        brochureId: p.brochure_id,
        position: p.position,
        imageUrl: p.image_url,
        sortOrder: p.sort_order,
      })),
    };
  });

  /**
   * GET /api/v1/brochures/:id/qr
   * Get QR code PNG for share link
   */
  fastify.get<{
    Params: { id: string };
    Querystring: { size?: number };
  }>('/brochures/:id/qr', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params;
    const size = Math.min(Math.max(request.query.size || 200, 100), 1000);
    validateUuid(id);

    const { data: brochure } = await supabase
      .from('brochures')
      .select('share_token, user_id')
      .eq('id', id)
      .single();

    if (!brochure?.share_token) {
      throw Errors.notFound('Share link not generated yet');
    }

    if (brochure.user_id !== request.user!.id) {
      throw Errors.forbidden('You can only get QR codes for your own brochures');
    }

    // QR code generation is handled client-side
    // This endpoint could generate server-side if needed
    // For now, return info for client to generate
    return {
      shareUrl: `https://${APP_DOMAIN}/view/${brochure.share_token}`,
      size,
    };
  });
};

export default shareRoutes;
