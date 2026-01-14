import { writable, derived } from 'svelte/store';
import type { LibraryBrochure } from '@open-brochure/shared';
import { listBrochures, deleteBrochure as apiDeleteBrochure, updateBrochure as apiUpdateBrochure } from '../api';

interface BrochuresState {
  items: LibraryBrochure[];
  total: number;
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
}

function createBrochuresStore() {
  const { subscribe, set, update } = writable<BrochuresState>({
    items: [],
    total: 0,
    isLoading: false,
    error: null,
    hasLoaded: false,
  });

  return {
    subscribe,

    /**
     * Load brochures from API
     */
    async load(limit = 50, offset = 0) {
      update((state) => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await listBrochures(limit, offset);
        update((state) => ({
          ...state,
          items: offset === 0 ? response.brochures : [...state.items, ...response.brochures],
          total: response.total,
          isLoading: false,
          hasLoaded: true,
        }));
      } catch (err) {
        update((state) => ({
          ...state,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load brochures',
        }));
      }
    },

    /**
     * Refresh brochures list
     */
    async refresh() {
      update((state) => ({ ...state, items: [], hasLoaded: false }));
      await this.load();
    },

    /**
     * Add a new brochure to the store (after save)
     */
    addBrochure(brochure: LibraryBrochure) {
      update((state) => ({
        ...state,
        items: [brochure, ...state.items],
        total: state.total + 1,
      }));
    },

    /**
     * Update a brochure in the store
     */
    updateBrochure(id: string, updates: Partial<LibraryBrochure>) {
      update((state) => ({
        ...state,
        items: state.items.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      }));
    },

    /**
     * Delete a brochure from the store
     */
    async deleteBrochure(id: string) {
      try {
        await apiDeleteBrochure(id);
        update((state) => ({
          ...state,
          items: state.items.filter((b) => b.id !== id),
          total: state.total - 1,
        }));
        return true;
      } catch (err) {
        throw err;
      }
    },

    /**
     * Rename a brochure
     */
    async renameBrochure(id: string, name: string) {
      try {
        await apiUpdateBrochure(id, { name });
        update((state) => ({
          ...state,
          items: state.items.map((b) =>
            b.id === id ? { ...b, name, updatedAt: new Date() } : b
          ),
        }));
        return true;
      } catch (err) {
        throw err;
      }
    },

    /**
     * Toggle visibility
     */
    async toggleVisibility(id: string) {
      let currentVisibility: 'public' | 'private' = 'private';

      // Get current visibility
      update((state) => {
        const brochure = state.items.find((b) => b.id === id);
        if (brochure) {
          currentVisibility = brochure.visibility;
        }
        return state;
      });

      const newVisibility = currentVisibility === 'public' ? 'private' : 'public';

      try {
        await apiUpdateBrochure(id, { visibility: newVisibility });
        update((state) => ({
          ...state,
          items: state.items.map((b) =>
            b.id === id ? { ...b, visibility: newVisibility, updatedAt: new Date() } : b
          ),
        }));
        return newVisibility;
      } catch (err) {
        throw err;
      }
    },

    /**
     * Clear store
     */
    clear() {
      set({
        items: [],
        total: 0,
        isLoading: false,
        error: null,
        hasLoaded: false,
      });
    },
  };
}

export const brochuresStore = createBrochuresStore();

// Derived store for checking if user has brochures
export const hasBrochures = derived(brochuresStore, ($store) => $store.items.length > 0);

// Derived store for public brochures count
export const publicBrochuresCount = derived(
  brochuresStore,
  ($store) => $store.items.filter((b) => b.visibility === 'public').length
);
