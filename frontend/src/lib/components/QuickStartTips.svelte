<script lang="ts">
  import { fade } from 'svelte/transition';
  import { browser } from '$app/environment';

  export let show = true;

  const STORAGE_KEY = 'openbrochure_tips_dismissed';

  // Check if tips have been dismissed before
  let dismissed = false;
  if (browser) {
    dismissed = localStorage.getItem(STORAGE_KEY) === 'true';
  }

  $: visible = show && !dismissed;

  function dismiss() {
    dismissed = true;
    if (browser) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }

  const tips = [
    {
      icon: '📤',
      title: 'Upload your brochure',
      description: 'Drag and drop an image or PDF of your tri-fold brochure',
    },
    {
      icon: '🎯',
      title: 'Arrange the panels',
      description: 'Match each panel to its position on the tri-fold',
    },
    {
      icon: '📱',
      title: 'View in 3D',
      description: 'Experience realistic unfold animations',
    },
  ];
</script>

{#if visible}
  <div class="tips-overlay" transition:fade={{ duration: 200 }}>
    <div class="tips-container">
      <button class="tips-close" on:click={dismiss} aria-label="Dismiss tips">
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
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <h3 class="tips-title">Quick Start</h3>

      <div class="tips-list">
        {#each tips as tip, index}
          <div class="tip">
            <span class="tip-number">{index + 1}</span>
            <div class="tip-content">
              <span class="tip-icon">{tip.icon}</span>
              <h4 class="tip-title">{tip.title}</h4>
              <p class="tip-description">{tip.description}</p>
            </div>
          </div>
        {/each}
      </div>

      <button class="btn btn-primary" on:click={dismiss}>
        Got it!
      </button>
    </div>
  </div>
{/if}

<style>
  .tips-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-modal);
    padding: var(--space-4);
  }

  .tips-container {
    position: relative;
    background: var(--color-background);
    border-radius: var(--radius-xl);
    padding: var(--space-8);
    max-width: 480px;
    width: 100%;
    box-shadow: var(--shadow-xl);
  }

  .tips-close {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    color: var(--color-text-tertiary);
    padding: var(--space-1);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .tips-close:hover {
    color: var(--color-text);
    background: var(--color-background-secondary);
  }

  .tips-title {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    margin-bottom: var(--space-6);
    text-align: center;
  }

  .tips-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .tip {
    display: flex;
    gap: var(--space-4);
    align-items: flex-start;
  }

  .tip-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--color-primary-light);
    color: var(--color-primary);
    font-weight: var(--font-bold);
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }

  .tip-content {
    flex: 1;
  }

  .tip-icon {
    font-size: 1.5rem;
    display: block;
    margin-bottom: var(--space-1);
  }

  .tip-title {
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    margin-bottom: var(--space-1);
  }

  .tip-description {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .tips-container .btn {
    width: 100%;
  }
</style>
