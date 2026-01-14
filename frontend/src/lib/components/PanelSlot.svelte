<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { PanelPosition } from '@open-brochure/shared';
  import { PANEL_POSITIONS } from '@open-brochure/shared';

  export let position: PanelPosition;
  export let imageUrl: string | null = null;
  export let isDropTarget = false;
  export let isSelected = false;
  export let disabled = false;

  const dispatch = createEventDispatcher<{
    click: void;
    drop: void;
  }>();

  $: label = PANEL_POSITIONS[position].label;

  let isAnimating = false;

  export function triggerSnapAnimation() {
    isAnimating = true;
    setTimeout(() => {
      isAnimating = false;
    }, 300);
  }

  function handleClick() {
    if (!disabled) {
      dispatch('click');
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }
</script>

<div
  class="panel-slot"
  class:drop-target={isDropTarget}
  class:selected={isSelected}
  class:disabled
  class:animating={isAnimating}
  on:click={handleClick}
  on:keydown={handleKeydown}
  role="button"
  tabindex={disabled ? -1 : 0}
  aria-label="{label} panel slot"
  aria-pressed={isSelected}
>
  <div class="panel-label">{label}</div>

  {#if imageUrl}
    <img src={imageUrl} alt="{label} panel" class="panel-image" />
  {:else}
    <div class="panel-placeholder">
      <span>Drop panel here</span>
    </div>
  {/if}
</div>

<style>
  .panel-slot {
    position: relative;
    aspect-ratio: 1 / 1.4;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    cursor: pointer;
    transition: all var(--transition-normal);
    background: var(--color-background);
  }

  .panel-slot:hover:not(.disabled) {
    border-color: var(--color-primary);
    transform: scale(1.02);
  }

  .panel-slot:focus-visible {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }

  .panel-slot.drop-target {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
    border-style: dashed;
  }

  .panel-slot.selected {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }

  .panel-slot.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .panel-slot.animating {
    animation: snap 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes snap {
    0% {
      transform: scale(1.1);
    }
    50% {
      transform: scale(0.95);
    }
    100% {
      transform: scale(1);
    }
  }

  .panel-label {
    position: absolute;
    top: var(--space-2);
    left: var(--space-2);
    padding: var(--space-1) var(--space-2);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    border-radius: var(--radius-sm);
    z-index: 1;
  }

  .panel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .panel-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: var(--color-background-secondary);
    color: var(--color-text-tertiary);
    font-size: var(--text-sm);
  }
</style>
