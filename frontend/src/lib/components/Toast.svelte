<script lang="ts">
  import { fade } from 'svelte/transition';
  import { createEventDispatcher, onMount } from 'svelte';

  export let message: string;
  export let type: 'success' | 'error' | 'info' = 'info';
  export let duration = 4000;
  export let dismissible = true;

  const dispatch = createEventDispatcher<{ dismiss: void }>();

  onMount(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        dispatch('dismiss');
      }, duration);

      return () => clearTimeout(timer);
    }
  });

  function dismiss() {
    dispatch('dismiss');
  }
</script>

<div
  class="toast toast-{type}"
  role="alert"
  aria-live="polite"
  transition:fade={{ duration: 200 }}
>
  <div class="toast-icon">
    {#if type === 'success'}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    {:else if type === 'error'}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    {/if}
  </div>

  <span class="toast-message">{message}</span>

  {#if dismissible}
    <button class="toast-dismiss" on:click={dismiss} aria-label="Dismiss">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  {/if}
</div>

<style>
  .toast {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--color-background);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-border);
    max-width: 400px;
  }

  .toast-success {
    border-color: var(--color-success);
  }

  .toast-error {
    border-color: var(--color-error);
  }

  .toast-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toast-success .toast-icon {
    color: var(--color-success);
  }

  .toast-error .toast-icon {
    color: var(--color-error);
  }

  .toast-info .toast-icon {
    color: var(--color-primary);
  }

  .toast-message {
    flex: 1;
    font-size: var(--text-sm);
    color: var(--color-text);
  }

  .toast-dismiss {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-sm);
    color: var(--color-text-tertiary);
    transition: all var(--transition-fast);
  }

  .toast-dismiss:hover {
    background: var(--color-background-secondary);
    color: var(--color-text);
  }
</style>
