import { writable, derived } from 'svelte/store';
import type { Panel, PanelPosition } from '@open-brochure/shared';

/**
 * The 4 fold states for the tri-fold brochure viewer
 * Each state represents a physical configuration of the folded brochure
 */
export type FoldState =
  | 'cover' // State 0: Cover visible (brochure fully folded)
  | 'partial_open' // State 1: Left + Center panels visible (2 panels)
  | 'fully_open' // State 2: All 3 inside panels visible
  | 'back'; // State 3: Back panel visible

export const FOLD_STATES: FoldState[] = [
  'cover',
  'partial_open',
  'fully_open',
  'back',
];

export const FOLD_STATE_LABELS: Record<FoldState, string> = {
  cover: 'Cover',
  partial_open: 'Partial Open',
  fully_open: 'Fully Open',
  back: 'Back',
};

interface ViewerState {
  foldState: FoldState;
  foldStateIndex: number;
  panels: Panel[];
  isAnimating: boolean;
  zoomLevel: number;
  isFullscreen: boolean;
  reducedMotion: boolean;
}

function createViewerStore() {
  const { subscribe, set, update } = writable<ViewerState>({
    foldState: 'cover',
    foldStateIndex: 0,
    panels: [],
    isAnimating: false,
    zoomLevel: 1,
    isFullscreen: false,
    reducedMotion: false,
  });

  return {
    subscribe,

    /**
     * Initialize the viewer with brochure panels
     */
    initialize(panels: Panel[]) {
      // Check for reduced motion preference
      const reducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      set({
        foldState: 'cover',
        foldStateIndex: 0,
        panels,
        isAnimating: false,
        zoomLevel: 1,
        isFullscreen: false,
        reducedMotion,
      });
    },

    /**
     * Set the fold state directly
     */
    setFoldState(state: FoldState) {
      const newIndex = FOLD_STATES.indexOf(state);
      if (newIndex === -1) return;

      update((s) => ({
        ...s,
        foldState: state,
        foldStateIndex: newIndex,
      }));
    },

    /**
     * Advance to the next fold state
     */
    nextState() {
      update((s) => {
        const nextIndex = s.foldStateIndex + 1;

        // Wrap around to beginning if at end
        if (nextIndex >= FOLD_STATES.length) {
          return {
            ...s,
            foldState: FOLD_STATES[0],
            foldStateIndex: 0,
            isAnimating: false,
          };
        }

        return {
          ...s,
          foldState: FOLD_STATES[nextIndex],
          foldStateIndex: nextIndex,
          isAnimating: false, // Don't block navigation
        };
      });
    },

    /**
     * Go to the previous fold state
     */
    previousState() {
      update((s) => {
        const prevIndex = s.foldStateIndex - 1;

        // Wrap around to end if at beginning
        if (prevIndex < 0) {
          return {
            ...s,
            foldState: FOLD_STATES[FOLD_STATES.length - 1],
            foldStateIndex: FOLD_STATES.length - 1,
            isAnimating: false,
          };
        }

        return {
          ...s,
          foldState: FOLD_STATES[prevIndex],
          foldStateIndex: prevIndex,
          isAnimating: false, // Don't block navigation
        };
      });
    },

    /**
     * Go to a specific fold state index
     */
    goToState(index: number) {
      if (index < 0 || index >= FOLD_STATES.length) return;

      update((s) => {
        if (s.isAnimating || index === s.foldStateIndex) return s;

        return {
          ...s,
          foldState: FOLD_STATES[index],
          foldStateIndex: index,
          isAnimating: !s.reducedMotion,
        };
      });
    },

    /**
     * Mark animation as complete
     */
    animationComplete() {
      update((s) => ({ ...s, isAnimating: false }));
    },

    /**
     * Set zoom level (for pinch-to-zoom)
     */
    setZoom(level: number) {
      update((s) => ({
        ...s,
        zoomLevel: Math.max(1, Math.min(3, level)),
      }));
    },

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
      update((s) => ({
        ...s,
        isFullscreen: !s.isFullscreen,
      }));
    },

    /**
     * Set fullscreen state directly
     */
    setFullscreen(isFullscreen: boolean) {
      update((s) => ({ ...s, isFullscreen }));
    },

    /**
     * Reset to initial state
     */
    reset() {
      update((s) => ({
        ...s,
        foldState: 'cover',
        foldStateIndex: 0,
        isAnimating: false,
        zoomLevel: 1,
        isFullscreen: false,
      }));
    },
  };
}

export const viewerState = createViewerStore();

// Derived stores for UI state
// Always allow navigation (with wrap-around)
export const canGoNext = derived(
  viewerState,
  () => true
);

export const canGoPrevious = derived(
  viewerState,
  () => true
);

export const currentStateLabel = derived(viewerState, ($state) =>
  FOLD_STATE_LABELS[$state.foldState]
);

export const stateProgress = derived(
  viewerState,
  ($state) => `${$state.foldStateIndex + 1} / ${FOLD_STATES.length}`
);

// Derived store for panels by position
export const panelsByPosition = derived(viewerState, ($state) => {
  const byPosition: Partial<Record<PanelPosition, Panel>> = {};
  for (const panel of $state.panels) {
    byPosition[panel.position] = panel;
  }
  return byPosition;
});
