import { writable, derived } from 'svelte/store';
import type { PanelPosition, Panel } from '@open-brochure/shared';
import { PANEL_POSITIONS } from '@open-brochure/shared';
import type { DetectedPanel } from '../services/panelDetection';

export interface ArrangementPanel {
  id: string;
  position: PanelPosition;
  imageUrl: string;
  originalPosition: PanelPosition;
}

interface ArrangementState {
  panels: ArrangementPanel[];
  selectedPanelId: string | null;
  isDragging: boolean;
  hasChanges: boolean;
  brochureId: string | null; // For edit mode
}

function createArrangementStore() {
  const { subscribe, set, update } = writable<ArrangementState>({
    panels: [],
    selectedPanelId: null,
    isDragging: false,
    hasChanges: false,
    brochureId: null,
  });

  return {
    subscribe,

    /**
     * Initialize arrangement from detected panels (new brochure)
     */
    initialize(detectedPanels: DetectedPanel[]) {
      const panels: ArrangementPanel[] = detectedPanels.map((panel, index) => ({
        id: `panel-${index}`,
        position: panel.position,
        imageUrl: panel.imageDataUrl,
        originalPosition: panel.position,
      }));

      set({
        panels,
        selectedPanelId: null,
        isDragging: false,
        hasChanges: false,
        brochureId: null,
      });
    },

    /**
     * Initialize arrangement from existing brochure panels (edit mode)
     */
    initializeFromBrochure(brochureId: string, existingPanels: Panel[]) {
      const panels: ArrangementPanel[] = existingPanels.map((panel) => ({
        id: panel.id,
        position: panel.position,
        imageUrl: panel.imageUrl,
        originalPosition: panel.position,
      }));

      set({
        panels,
        selectedPanelId: null,
        isDragging: false,
        hasChanges: false,
        brochureId,
      });
    },

    /**
     * Select a panel for swap (touch-friendly mode)
     */
    selectPanel(panelId: string) {
      update((state) => {
        if (state.selectedPanelId === panelId) {
          // Deselect if clicking the same panel
          return { ...state, selectedPanelId: null };
        }

        if (state.selectedPanelId) {
          // Swap with previously selected panel
          const panels = swapPanels(state.panels, state.selectedPanelId, panelId);
          return {
            ...state,
            panels,
            selectedPanelId: null,
            hasChanges: true,
          };
        }

        // Select this panel
        return { ...state, selectedPanelId: panelId };
      });
    },

    /**
     * Swap two panels by their positions
     */
    swapByPosition(position1: PanelPosition, position2: PanelPosition) {
      update((state) => {
        const panel1 = state.panels.find((p) => p.position === position1);
        const panel2 = state.panels.find((p) => p.position === position2);

        if (!panel1 || !panel2) return state;

        const panels = state.panels.map((panel) => {
          if (panel.id === panel1.id) {
            return { ...panel, position: position2 };
          }
          if (panel.id === panel2.id) {
            return { ...panel, position: position1 };
          }
          return panel;
        });

        return {
          ...state,
          panels,
          selectedPanelId: null,
          hasChanges: true,
        };
      });
    },

    /**
     * Move a panel to a new position (for drag-drop)
     */
    moveToPosition(panelId: string, targetPosition: PanelPosition) {
      update((state) => {
        const draggedPanel = state.panels.find((p) => p.id === panelId);
        const targetPanel = state.panels.find((p) => p.position === targetPosition);

        if (!draggedPanel || draggedPanel.position === targetPosition) {
          return { ...state, isDragging: false };
        }

        // Swap positions
        const panels = state.panels.map((panel) => {
          if (panel.id === draggedPanel.id) {
            return { ...panel, position: targetPosition };
          }
          if (targetPanel && panel.id === targetPanel.id) {
            return { ...panel, position: draggedPanel.position };
          }
          return panel;
        });

        return {
          ...state,
          panels,
          isDragging: false,
          hasChanges: true,
        };
      });
    },

    /**
     * Set dragging state
     */
    setDragging(isDragging: boolean) {
      update((state) => ({ ...state, isDragging }));
    },

    /**
     * Clear selection
     */
    clearSelection() {
      update((state) => ({ ...state, selectedPanelId: null }));
    },

    /**
     * Reset to original arrangement
     */
    reset() {
      update((state) => ({
        ...state,
        panels: state.panels.map((panel) => ({
          ...panel,
          position: panel.originalPosition,
        })),
        selectedPanelId: null,
        hasChanges: false,
      }));
    },

    /**
     * Mark as saved (clear hasChanges)
     */
    markSaved() {
      update((state) => ({
        ...state,
        panels: state.panels.map((panel) => ({
          ...panel,
          originalPosition: panel.position,
        })),
        hasChanges: false,
      }));
    },
  };
}

/**
 * Helper to swap two panels by ID
 */
function swapPanels(
  panels: ArrangementPanel[],
  id1: string,
  id2: string
): ArrangementPanel[] {
  const panel1 = panels.find((p) => p.id === id1);
  const panel2 = panels.find((p) => p.id === id2);

  if (!panel1 || !panel2) return panels;

  return panels.map((panel) => {
    if (panel.id === id1) {
      return { ...panel, position: panel2.position };
    }
    if (panel.id === id2) {
      return { ...panel, position: panel1.position };
    }
    return panel;
  });
}

export const arrangement = createArrangementStore();

// Derived store for panels by position
export const panelsByPosition = derived(arrangement, ($arrangement) => {
  const byPosition: Partial<Record<PanelPosition, ArrangementPanel>> = {};
  for (const panel of $arrangement.panels) {
    byPosition[panel.position] = panel;
  }
  return byPosition;
});

// Derived store for outside panels (front)
export const outsidePanels = derived(panelsByPosition, ($byPosition) => [
  $byPosition.cover,
  $byPosition.back,
  $byPosition.inside_flap,
]);

// Derived store for inside panels
export const insidePanels = derived(panelsByPosition, ($byPosition) => [
  $byPosition.left_panel,
  $byPosition.center_panel,
  $byPosition.right_panel,
]);
