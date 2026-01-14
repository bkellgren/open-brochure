import { writable, derived } from 'svelte/store';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { browser } from '$app/environment';

// Auth state store
interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    loading: true,
    initialized: false,
  });

  // Initialize auth state
  async function init() {
    if (!browser) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({
        user: session?.user || null,
        loading: false,
        initialized: true,
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        update((state) => ({
          ...state,
          user: session?.user || null,
          loading: false,
        }));
      });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      set({
        user: null,
        loading: false,
        initialized: true,
      });
    }
  }

  return {
    subscribe,
    init,
    signOut: async () => {
      await supabase.auth.signOut();
      update((state) => ({ ...state, user: null }));
    },
  };
}

export const auth = createAuthStore();

// Derived stores for convenience
export const user = derived(auth, ($auth) => $auth.user);
export const isAuthenticated = derived(auth, ($auth) => !!$auth.user);
export const isLoading = derived(auth, ($auth) => $auth.loading);

// Combined store with derived values for convenience
export const authStore = derived(auth, ($auth) => ({
  user: $auth.user,
  loading: $auth.loading,
  initialized: $auth.initialized,
  isAuthenticated: !!$auth.user,
}));
