<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { PanelPosition } from '@open-brochure/shared';
  import { arrangement, panelsByPosition } from '$lib/stores/arrangement';
  import PanelSlot from './PanelSlot.svelte';

  export let disabled = false;

  const dispatch = createEventDispatcher<{
    confirm: void;
    cancel: void;
  }>();

  const outsidePositions: PanelPosition[] = ['cover', 'back', 'inside_flap'];
  const insidePositions: PanelPosition[] = ['left_panel', 'center_panel', 'right_panel'];

  let dropTargetPosition: PanelPosition | null = null;
  let panelSlots: Record<string, { triggerSnapAnimation: () => void }> = {};

  $: selectedId = $arrangement.selectedPanelId;

  function handleSlotClick(position: PanelPosition) {
    if (disabled) return;

    const panel = $panelsByPosition[position];
    if (panel) {
      arrangement.selectPanel(panel.id);
    }
  }

  function handleDragOver(e: DragEvent, position: PanelPosition) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    dropTargetPosition = position;
  }

  function handleDragLeave() {
    dropTargetPosition = null;
  }

  function handleDrop(e: DragEvent, position: PanelPosition) {
    e.preventDefault();
    dropTargetPosition = null;

    const sourcePosition = e.dataTransfer?.getData('text/plain') as PanelPosition;
    if (sourcePosition && sourcePosition !== position) {
      arrangement.swapByPosition(sourcePosition, position);

      // Trigger snap animation
      if (panelSlots[position]) {
        panelSlots[position].triggerSnapAnimation();
      }
      if (panelSlots[sourcePosition]) {
        panelSlots[sourcePosition].triggerSnapAnimation();
      }
    }

    arrangement.setDragging(false);
  }

  function handleConfirm() {
    dispatch('confirm');
  }

  function handleCancel() {
    arrangement.reset();
    dispatch('cancel');
  }
</script>

<div class="panel-arrangement">
  <div class="arrangement-section">
    <h3 class="section-title">Outside (when folded)</h3>
    <div class="panel-grid" role="listbox" aria-label="Outside panels">
      {#each outsidePositions as position}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="slot-wrapper"
          role="option"
          aria-selected={selectedId === $panelsByPosition[position]?.id}
          on:dragover={(e) => handleDragOver(e, position)}
          on:dragleave={handleDragLeave}
          on:drop={(e) => handleDrop(e, position)}
        >
          <PanelSlot
            bind:this={panelSlots[position]}
            {position}
            imageUrl={$panelsByPosition[position]?.imageUrl || null}
            isDropTarget={dropTargetPosition === position}
            isSelected={selectedId === $panelsByPosition[position]?.id}
            {disabled}
            on:click={() => handleSlotClick(position)}
          />
        </div>
      {/each}
    </div>
  </div>

  <div class="arrangement-section">
    <h3 class="section-title">Inside (when unfolded)</h3>
    <div class="panel-grid" role="listbox" aria-label="Inside panels">
      {#each insidePositions as position}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="slot-wrapper"
          role="option"
          aria-selected={selectedId === $panelsByPosition[position]?.id}
          on:dragover={(e) => handleDragOver(e, position)}
          on:dragleave={handleDragLeave}
          on:drop={(e) => handleDrop(e, position)}
        >
          <PanelSlot
            bind:this={panelSlots[position]}
            {position}
            imageUrl={$panelsByPosition[position]?.imageUrl || null}
            isDropTarget={dropTargetPosition === position}
            isSelected={selectedId === $panelsByPosition[position]?.id}
            {disabled}
            on:click={() => handleSlotClick(position)}
          />
        </div>
      {/each}
    </div>
  </div>

  {#if !disabled}
    <div class="arrangement-help">
      <p>Drag and drop panels to rearrange, or tap two panels to swap.</p>
    </div>

    <div class="arrangement-actions">
      {#if $arrangement.hasChanges}
        <button class="btn btn-ghost" on:click={handleCancel}>
          Reset Changes
        </button>
      {/if}
      <button class="btn btn-primary" on:click={handleConfirm}>
        Confirm Arrangement
      </button>
    </div>
  {/if}
</div>

<style>
  .panel-arrangement {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .arrangement-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .section-title {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .panel-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
  }

  @media (max-width: 640px) {
    .panel-grid {
      gap: var(--space-2);
    }
  }

  .slot-wrapper {
    /* For drag-over events */
  }

  .arrangement-help {
    text-align: center;
    padding: var(--space-4);
    background: var(--color-background-secondary);
    border-radius: var(--radius-lg);
  }

  .arrangement-help p {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .arrangement-actions {
    display: flex;
    justify-content: center;
    gap: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border);
  }
</style>
