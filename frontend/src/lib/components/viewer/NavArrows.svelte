<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // Props kept for backwards compatibility but not used
  export let canGoNext = true;
  export let canGoPrevious = true;

  const dispatch = createEventDispatcher<{
    next: void;
    previous: void;
  }>();
</script>

<div class="nav-arrows" role="navigation" aria-label="Brochure navigation">
  <button
    class="nav-btn prev"
    on:click|stopPropagation={() => dispatch('previous')}
    aria-label="Previous fold state"
    title="Previous (Left Arrow)"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  </button>

  <button
    class="nav-btn next"
    on:click|stopPropagation={() => dispatch('next')}
    aria-label="Next fold state"
    title="Next (Right Arrow)"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </button>
</div>

<style>
  .nav-arrows {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    pointer-events: none;
    z-index: 30;
  }

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.9);
    border: none;
    color: var(--color-text);
    cursor: pointer;
    pointer-events: auto;
    transition:
      transform var(--transition-fast),
      background-color var(--transition-fast),
      opacity var(--transition-fast);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .nav-btn:hover:not(:disabled) {
    background: white;
    transform: scale(1.05);
  }

  .nav-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .nav-btn:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }

  .nav-btn svg {
    width: 24px;
    height: 24px;
  }

  /* Smaller buttons on mobile */
  @media (max-width: 640px) {
    .nav-arrows {
      padding: var(--space-2);
    }

    .nav-btn {
      width: 40px;
      height: 40px;
    }

    .nav-btn svg {
      width: 20px;
      height: 20px;
    }
  }

  /* Hide arrows in fullscreen on touch devices after first interaction */
  @media (hover: none) and (pointer: coarse) {
    .nav-btn {
      opacity: 0.7;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .nav-btn {
      transition: none;
    }
  }
</style>
