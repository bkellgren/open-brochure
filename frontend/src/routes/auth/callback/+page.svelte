<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';

  let error = '';

  onMount(async () => {
    try {
      const { error: authError } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (authError) {
        error = authError.message;
        return;
      }

      // Redirect to library or previous page
      const redirectTo = sessionStorage.getItem('auth_redirect') || '/library';
      sessionStorage.removeItem('auth_redirect');
      goto(redirectTo);
    } catch (e) {
      error = 'Authentication failed. Please try again.';
    }
  });
</script>

<svelte:head>
  <title>Signing in... | Open Brochure</title>
</svelte:head>

<div class="callback container">
  {#if error}
    <div class="error card">
      <h2>Sign in failed</h2>
      <p>{error}</p>
      <a href="/login" class="btn btn-primary">Try Again</a>
    </div>
  {:else}
    <div class="loading">
      <div class="spinner"></div>
      <p>Signing you in...</p>
    </div>
  {/if}
</div>

<style>
  .callback {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
  }

  .loading {
    text-align: center;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--space-4);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error {
    text-align: center;
    max-width: 400px;
  }

  .error h2 {
    margin-bottom: var(--space-4);
    color: var(--color-error);
  }

  .error p {
    margin-bottom: var(--space-6);
  }
</style>
