<script lang="ts">
  import { onMount } from 'svelte';
  import { auth, isAuthenticated, user } from '$lib/stores/auth';
  import { signOut } from '$lib/supabase';
  import '../app.css';

  onMount(() => {
    auth.init();
  });

  async function handleSignOut() {
    await signOut();
  }
</script>

<div class="app">
  <header class="header">
    <div class="container flex-between">
      <a href="/" class="logo">
        <span class="logo-text">Open Brochure</span>
      </a>

      <nav class="nav">
        {#if $isAuthenticated}
          <a href="/library" class="nav-link">My Library</a>
          <a href="/upload" class="btn btn-primary">Upload</a>
          <button on:click={handleSignOut} class="btn btn-ghost">Sign Out</button>
        {:else}
          <a href="/upload" class="nav-link">Upload</a>
          <a href="/login" class="btn btn-primary">Sign In</a>
        {/if}
      </nav>
    </div>
  </header>

  <main class="main">
    <slot />
  </main>

  <footer class="footer">
    <div class="container">
      <p class="footer-text">Open Brochure - Free forever</p>
    </div>
  </footer>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .header {
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-4) 0;
    position: sticky;
    top: 0;
    z-index: var(--z-dropdown);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    text-decoration: none;
  }

  .logo-text {
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    color: var(--color-text);
  }

  .nav {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .nav-link {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    transition: color var(--transition-fast);
  }

  .nav-link:hover {
    color: var(--color-text);
  }

  .main {
    flex: 1;
    padding: var(--space-8) 0;
  }

  .footer {
    background-color: var(--color-background-secondary);
    border-top: 1px solid var(--color-border);
    padding: var(--space-8) 0;
    margin-top: auto;
  }

  .footer-text {
    font-size: var(--text-sm);
    color: var(--color-text-tertiary);
    text-align: center;
  }
</style>
