<script lang="ts">
  import { signInWithProvider } from '$lib/supabase';

  let loading = false;
  let error = '';

  async function handleSignIn(provider: 'google' | 'apple' | 'azure') {
    loading = true;
    error = '';

    try {
      await signInWithProvider(provider);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Sign in failed';
      loading = false;
    }
  }
</script>

<div class="login-buttons">
  {#if error}
    <p class="error">{error}</p>
  {/if}

  <button
    class="login-btn google"
    on:click={() => handleSignIn('google')}
    disabled={loading}
    aria-label="Sign in with Google"
  >
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
    Continue with Google
  </button>

  <button
    class="login-btn apple"
    on:click={() => handleSignIn('apple')}
    disabled={loading}
    aria-label="Sign in with Apple"
  >
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.52-3.74 4.25z"
      />
    </svg>
    Continue with Apple
  </button>

  <button
    class="login-btn microsoft"
    on:click={() => handleSignIn('azure')}
    disabled={loading}
    aria-label="Sign in with Microsoft"
  >
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M1 13h10v10H1z" />
      <path fill="#7fba00" d="M13 1h10v10H13z" />
      <path fill="#ffb900" d="M13 13h10v10H13z" />
    </svg>
    Continue with Microsoft
  </button>
</div>

<style>
  .login-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    width: 100%;
    max-width: 320px;
  }

  .error {
    color: var(--color-error);
    font-size: var(--text-sm);
    text-align: center;
    margin-bottom: var(--space-2);
  }

  .login-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    background: var(--color-background);
    color: var(--color-text);
    transition: all var(--transition-fast);
  }

  .login-btn:hover:not(:disabled) {
    border-color: var(--color-border-hover);
    background: var(--color-background-secondary);
  }

  .login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .login-btn svg {
    flex-shrink: 0;
  }
</style>
