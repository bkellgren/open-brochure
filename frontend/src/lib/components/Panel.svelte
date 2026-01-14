<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { PanelPosition } from '@open-brochure/shared';
  import { PANEL_POSITIONS } from '@open-brochure/shared';

  export let position: PanelPosition;
  export let imageUrl: string;
  export let isDragging = false;
  export let isSelected = false;

  const dispatch = createEventDispatcher<{
    dragstart: void;
    dragend: void;
    click: void;
  }>();

  $: label = PANEL_POSITIONS[position].label;

  function handleDragStart(e: DragEvent) {
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', position);
    }
    dispatch('dragstart');
  }

  function handleDragEnd() {
    dispatch('dragend');
  }

  function handleClick() {
    dispatch('click');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }
</script>

<div
  class="panel"
  class:dragging={isDragging}
  class:selected={isSelected}
  draggable="true"
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  on:click={handleClick}
  on:keydown={handleKeydown}
  role="button"
  tabindex="0"
  aria-label="{label} panel"
  aria-pressed={isSelected}
>
  <img src={imageUrl} alt="{label} panel content" class="panel-image" />
  <div class="panel-label">{label}</div>
</div>

<style>
  .panel {
    position: relative;
    aspect-ratio: 1 / 1.4;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    cursor: grab;
    transition: all var(--transition-fast);
    background: var(--color-background);
  }

  .panel:hover {
    border-color: var(--color-primary);
    transform: scale(1.02);
    box-shadow: var(--shadow-md);
  }

  .panel:focus-visible {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }

  .panel.dragging {
    opacity: 0.5;
    cursor: grabbing;
    transform: scale(0.95);
  }

  .panel.selected {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }

  .panel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }

  .panel-label {
    position: absolute;
    bottom: var(--space-2);
    left: var(--space-2);
    right: var(--space-2);
    padding: var(--space-1) var(--space-2);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    border-radius: var(--radius-sm);
    text-align: center;
  }
</style>
