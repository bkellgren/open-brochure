<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { isAuthenticated } from '$lib/stores/auth';
  import LoginButtons from '$lib/components/LoginButtons.svelte';

  // Redirect if already authenticated
  $: if ($isAuthenticated) {
    goto('/library');
  }

  onMount(() => {
    // Store redirect URL for after auth
    const redirectTo = $page.url.searchParams.get('redirect');
    if (redirectTo) {
      sessionStorage.setItem('auth_redirect', redirectTo);
    }
  });
</script>

<svelte:head>
  <title>Sign In | Open Brochure</title>
</svelte:head>

<div class="login container fade-in">
  <div class="login-card card">
    <h1 class="login-title">Welcome back</h1>
    <p class="login-description">
      Sign in to save, share, and manage your brochures.
    </p>

    <LoginButtons />

    <p class="login-note">
      By signing in, you agree to our Terms of Service and Privacy Policy.
    </p>
  </div>
</div>

<style>
  .login {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
  }

  .login-card {
    text-align: center;
    max-width: 400px;
    width: 100%;
    padding: var(--space-10);
  }

  .login-title {
    margin-bottom: var(--space-2);
  }

  .login-description {
    margin-bottom: var(--space-8);
  }

  .login-note {
    margin-top: var(--space-6);
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
  }
</style>
