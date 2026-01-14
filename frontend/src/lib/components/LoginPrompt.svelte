<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import LoginButtons from './LoginButtons.svelte';

  export let title = 'Sign in to save';
  export let description = 'Create a free account to save your brochures and access them from any device.';

  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  function handleClose() {
    dispatch('close');
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }
</script>

<div class="login-prompt-overlay" on:click={handleBackdropClick} role="dialog" aria-modal="true">
  <div class="login-prompt">
    <button class="close-btn" on:click={handleClose} aria-label="Close">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>

    <h2>{title}</h2>
    <p>{description}</p>

    <LoginButtons />

    <p class="privacy-note">
      We only use your email to identify your account. Your brochures are private by default.
    </p>
  </div>
</div>

<style>
  .login-prompt-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-modal);
    padding: var(--space-4);
  }

  .login-prompt {
    position: relative;
    background: var(--color-background);
    border-radius: var(--radius-xl);
    padding: var(--space-8);
    max-width: 400px;
    width: 100%;
    text-align: center;
    box-shadow: var(--shadow-xl);
  }

  .close-btn {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    background: none;
    border: none;
    padding: var(--space-2);
    color: var(--color-text-tertiary);
    cursor: pointer;
    border-radius: var(--radius-full);
    transition: all var(--transition-fast);
  }

  .close-btn:hover {
    background: var(--color-background-secondary);
    color: var(--color-text);
  }

  h2 {
    margin-bottom: var(--space-2);
  }

  p {
    color: var(--color-text-secondary);
    margin-bottom: var(--space-6);
  }

  .privacy-note {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    margin-top: var(--space-6);
    margin-bottom: 0;
  }
</style>
