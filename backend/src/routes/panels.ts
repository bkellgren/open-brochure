import type { FastifyPluginAsync } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { validateUuid } from '../middleware/validate.js';
import { supabase } from '../lib/supabase.js';
import {
  Errors,
  PANEL_POSITIONS,
  type PanelPosition,
  type UpdatePanelsRequest,
  type Panel,
} from '@open-brochure/shared';

const panelsRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * PUT /api/v1/brochures/:id/panels
   * Update panel arrangement (reorder/reassign positions)
   */
  fastify.put<{
    Params: { id: string };
    Body: UpdatePanelsRequest;
    Reply: Panel[];
  }>('/:id/panels', { preHandler: requireAuth }, async (request) => {
    const brochureId = request.params.id;
    const userId = request.user!.id;
    validateUuid(brochureId);

    // Verify ownership
    const { data: brochure, error: brochureError } = await supabase
      .from('brochures')
      .select('user_id')
      .eq('id', brochureId)
      .single();

    if (brochureError || !brochure) {
      throw Errors.brochureNotFound();
    }

    if (brochure.user_id !== userId) {
      throw Errors.forbidden('You can only edit your own brochures');
    }

    // Validate request body
    const { panels } = request.body;
    if (!panels || !Array.isArray(panels) || panels.length === 0) {
      throw Errors.validation('Panels array is required');
    }

    if (panels.length > 6) {
      throw Errors.validation('Cannot have more than 6 panels');
    }

    // Validate each panel update
    const validPositions = Object.keys(PANEL_POSITIONS);
    const usedPositions = new Set<string>();

    for (const panel of panels) {
      if (!panel.id) {
        throw Errors.validation('Each panel must have an id');
      }
      validateUuid(panel.id);

      if (!panel.position || !validPositions.includes(panel.position)) {
        throw Errors.validation(
          `Invalid position: ${panel.position}. Valid positions are: ${validPositions.join(', ')}`
        );
      }

      if (usedPositions.has(panel.position)) {
        throw Errors.validation(`Duplicate position: ${panel.position}`);
      }
      usedPositions.add(panel.position);
    }

    // Verify all panels belong to this brochure
    const panelIds = panels.map((p) => p.id);
    const { data: existingPanels, error: panelsError } = await supabase
      .from('panels')
      .select('id')
      .eq('brochure_id', brochureId)
      .in('id', panelIds);

    if (panelsError) {
      throw Errors.internal('Failed to verify panels');
    }

    if (!existingPanels || existingPanels.length !== panels.length) {
      throw Errors.validation('One or more panels do not belong to this brochure');
    }

    // Update each panel's position and sort_order
    const updates = panels.map((panel) => ({
      id: panel.id,
      position: panel.position,
      sort_order: PANEL_POSITIONS[panel.position as PanelPosition].sortOrder,
    }));

    // Use a transaction-like approach: update all panels
    const updatedPanels: Panel[] = [];

    for (const update of updates) {
      const { data: updated, error: updateError } = await supabase
        .from('panels')
        .update({
          position: update.position,
          sort_order: update.sort_order,
        })
        .eq('id', update.id)
        .eq('brochure_id', brochureId)
        .select()
        .single();

      if (updateError || !updated) {
        throw Errors.internal(`Failed to update panel ${update.id}`);
      }

      updatedPanels.push({
        id: updated.id,
        brochureId: updated.brochure_id,
        position: updated.position,
        imageUrl: updated.image_url,
        sortOrder: updated.sort_order,
      });
    }

    // Also update the brochure's updated_at timestamp
    await supabase
      .from('brochures')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', brochureId);

    // Return panels sorted by sort_order
    return updatedPanels.sort((a, b) => a.sortOrder - b.sortOrder);
  });
};

export default panelsRoutes;
