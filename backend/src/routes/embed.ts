import type { FastifyPluginAsync } from 'fastify';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validateUuid } from '../middleware/validate.js';
import { supabase } from '../lib/supabase.js';
import {
  Errors,
  APP_DOMAIN,
  DEFAULT_EMBED_WIDTH,
  DEFAULT_EMBED_HEIGHT,
  type GetEmbedCodeResponse,
} from '@open-brochure/shared';

const embedRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/brochures/:id/embed
   * Get embed code for a public brochure
   */
  fastify.get<{
    Params: { id: string };
    Querystring: { width?: number; height?: number };
    Reply: GetEmbedCodeResponse;
  }>('/brochures/:id/embed', { preHandler: requireAuth }, async (request) => {
    const { id } = request.params;
    const width = request.query.width || DEFAULT_EMBED_WIDTH;
    const height = request.query.height || DEFAULT_EMBED_HEIGHT;
    validateUuid(id);

    const { data: brochure, error } = await supabase
      .from('brochures')
      .select('id, visibility, user_id')
      .eq('id', id)
      .single();

    if (error || !brochure) {
      throw Errors.brochureNotFound();
    }

    if (brochure.user_id !== request.user!.id) {
      throw Errors.forbidden('You can only get embed codes for your own brochures');
    }

    if (brochure.visibility !== 'public') {
      throw Errors.brochurePrivate();
    }

    const embedUrl = `https://${APP_DOMAIN}/embed/${id}`;
    const embedCode = `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;

    return {
      embedCode,
      embedUrl,
    };
  });

  /**
   * GET /api/v1/embed/:brochureId
   * Serve embedded viewer HTML page
   */
  fastify.get<{
    Params: { brochureId: string };
  }>('/embed/:brochureId', { preHandler: optionalAuth }, async (request, reply) => {
    const { brochureId } = request.params;
    validateUuid(brochureId);

    const { data: brochure, error } = await supabase
      .from('brochures')
      .select('id, visibility')
      .eq('id', brochureId)
      .single();

    if (error || !brochure) {
      return reply.type('text/html').send(`
        <!DOCTYPE html>
        <html>
          <head><title>Open Brochure</title></head>
          <body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <p>This brochure is no longer available.</p>
          </body>
        </html>
      `);
    }

    if (brochure.visibility !== 'public') {
      return reply.type('text/html').send(`
        <!DOCTYPE html>
        <html>
          <head><title>Open Brochure</title></head>
          <body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <p>This brochure is no longer available.</p>
          </body>
        </html>
      `);
    }

    // Increment view count
    await supabase
      .from('brochures')
      .update({ view_count: supabase.rpc('increment_view_count', { brochure_id: brochureId }) })
      .eq('id', brochureId);

    // Redirect to embedded viewer route on frontend
    return reply.redirect(`https://${APP_DOMAIN}/embed/${brochureId}`);
  });
};

export default embedRoutes;
