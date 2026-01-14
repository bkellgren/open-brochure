import type { FastifyPluginAsync } from 'fastify';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validateUuid, validatePagination, validateBrochureName } from '../middleware/validate.js';
import { supabase } from '../lib/supabase.js';
import { Errors, type ListBrochuresResponse, type GetBrochureResponse, type Visibility } from '@open-brochure/shared';

const brochuresRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/brochures
   * List user's brochure library
   */
  fastify.get<{
    Querystring: { limit?: number; offset?: number };
    Reply: ListBrochuresResponse;
  }>('/', { preHandler: requireAuth }, async (request) => {
    const userId = request.user!.id;
    const { limit, offset } = validatePagination(request.query.limit, request.query.offset);

    const { data: brochures, error, count } = await supabase
      .from('brochures')
      .select('id, name, visibility, thumbnail_url, view_count, created_at, updated_at', { count: 'exact' })
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw Errors.internal('Failed to fetch brochures');
    }

    return {
      brochures: brochures.map((b) => ({
        id: b.id,
        name: b.name,
        visibility: b.visibility as Visibility,
        thumbnailUrl: b.thumbnail_url,
        viewCount: b.view_count,
        createdAt: new Date(b.created_at),
        updatedAt: new Date(b.updated_at),
      })),
      total: count || 0,
    };
  });

  /**
   * GET /api/v1/brochures/:id
   * Get a brochure with all panels
   */
  fastify.get<{
    Params: { id: string };
    Reply: GetBrochureResponse;
  }>('/:id', { preHandler: optionalAuth }, async (request) => {
    const { id } = request.params;
    validateUuid(id);

    const { data: brochure, error } = await supabase
      .from('brochures')
      .select(`
        *,
        panels (*)
      `)
      .eq('id', id)
      .single();

    if (error || !brochure) {
      throw Errors.brochureNotFound();
    }

    // Check access: owner, public, or has share token
    const isOwner = request.user?.id === brochure.user_id;
    const isPublic = brochure.visibility === 'public';
    const hasShareToken = brochure.share_token !== null;

    if (!isOwner && !isPublic && !hasShareToken) {
      throw Errors.brochureNotFound();
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
      viewCount: brochure.view_count,
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
   * PATCH /api/v1/brochures/:id
   * Update brochure metadata (name, visibility)
   */
  fastify.patch<{
    Params: { id: string };
    Body: { name?: string; visibility?: Visibility };
  }>('/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params;
    const userId = request.user!.id;
    validateUuid(id);

    // Verify ownership
    const { data: existing } = await supabase
      .from('brochures')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== userId) {
      throw Errors.forbidden('You can only update your own brochures');
    }

    const updates: Record<string, any> = {};
    if (request.body.name !== undefined) {
      updates.name = validateBrochureName(request.body.name);
    }
    if (request.body.visibility !== undefined) {
      if (!['public', 'private'].includes(request.body.visibility)) {
        throw Errors.validation('Visibility must be "public" or "private"');
      }
      updates.visibility = request.body.visibility;
    }

    if (Object.keys(updates).length === 0) {
      throw Errors.validation('No valid fields to update');
    }

    const { data: updated, error } = await supabase
      .from('brochures')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw Errors.internal('Failed to update brochure');
    }

    return {
      id: updated.id,
      userId: updated.user_id,
      name: updated.name,
      visibility: updated.visibility,
      originalFileUrl: updated.original_file_url,
      originalFileType: updated.original_file_type,
      thumbnailUrl: updated.thumbnail_url,
      shareToken: updated.share_token,
      viewCount: updated.view_count,
      createdAt: new Date(updated.created_at),
      updatedAt: new Date(updated.updated_at),
    };
  });

  /**
   * DELETE /api/v1/brochures/:id
   * Delete a brochure (cascades to panels)
   */
  fastify.delete<{
    Params: { id: string };
  }>('/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params;
    const userId = request.user!.id;
    validateUuid(id);

    // Verify ownership
    const { data: existing } = await supabase
      .from('brochures')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== userId) {
      throw Errors.forbidden('You can only delete your own brochures');
    }

    const { error } = await supabase.from('brochures').delete().eq('id', id);

    if (error) {
      throw Errors.internal('Failed to delete brochure');
    }

    return reply.status(204).send();
  });
};

export default brochuresRoutes;
