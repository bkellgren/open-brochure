<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import type { Panel } from '@open-brochure/shared';
  import {
    viewerState,
    canGoNext,
    canGoPrevious,
    panelsByPosition,
    FOLD_STATES,
    type FoldState,
  } from '$lib/stores/viewerState';
  import Panel3D from './Panel3D.svelte';
  import FoldShadow from './FoldShadow.svelte';
  import NavArrows from './NavArrows.svelte';
  import SwipeHandler from './SwipeHandler.svelte';
  import ZoomHandler from './ZoomHandler.svelte';

  export let panels: Panel[] = [];
  export let showNavigation = true;
  export let enableKeyboard = true;
  export let enableSwipe = true;
  export let enableZoom = true;

  const dispatch = createEventDispatcher<{
    stateChange: { state: FoldState; index: number };
    ready: void;
  }>();

  let containerEl: HTMLDivElement;
  let isReady = false;

  // Initialize viewer when panels change
  $: if (panels.length > 0) {
    viewerState.initialize(panels);
    isReady = true;
    dispatch('ready');
  }

  // Dispatch state changes
  $: if (isReady) {
    dispatch('stateChange', {
      state: $viewerState.foldState,
      index: $viewerState.foldStateIndex,
    });
  }

  // Keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (!enableKeyboard) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        viewerState.nextState();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        viewerState.previousState();
        break;
      case 'Home':
        event.preventDefault();
        viewerState.goToState(0);
        break;
      case 'End':
        event.preventDefault();
        viewerState.goToState(FOLD_STATES.length - 1);
        break;
      case ' ':
        event.preventDefault();
        viewerState.nextState();
        break;
    }
  }

  // Click to advance
  function handleContainerClick(event: MouseEvent) {
    // Only advance on click if not clicking controls
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('.nav-arrows')) return;

    // Determine direction based on click position
    const rect = containerEl.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const halfWidth = rect.width / 2;

    if (clickX > halfWidth) {
      viewerState.nextState();
    } else {
      viewerState.previousState();
    }
  }

  // Handle animation end
  function handleAnimationEnd() {
    viewerState.animationComplete();
  }

  onMount(() => {
    if (enableKeyboard && containerEl) {
      containerEl.focus();
    }
  });
</script>

<div
  class="viewer-container"
  class:fullscreen={$viewerState.isFullscreen}
  bind:this={containerEl}
  on:click={handleContainerClick}
  on:keydown={handleKeydown}
  tabindex="0"
  role="application"
  aria-label="Tri-fold brochure viewer. Use arrow keys to navigate between fold states."
  aria-roledescription="brochure viewer"
>
  {#if enableSwipe}
    <SwipeHandler
      on:swipeLeft={() => viewerState.nextState()}
      on:swipeRight={() => viewerState.previousState()}
    />
  {/if}

  {#if enableZoom}
    <ZoomHandler
      zoomLevel={$viewerState.zoomLevel}
      on:zoom={(e) => viewerState.setZoom(e.detail)}
    />
  {/if}

  <div
    class="viewer-perspective"
    style="transform: scale({$viewerState.zoomLevel})"
    aria-live="polite"
    aria-atomic="true"
  >
    <div
      class="brochure-scene"
      class:animating={$viewerState.isAnimating}
      class:reduced-motion={$viewerState.reducedMotion}
    >
      <!-- Outside panels (visible when folded/back) -->
      {#if $panelsByPosition.cover}
        <Panel3D
          panel={$panelsByPosition.cover}
          foldState={$viewerState.foldState}
          side="outside"
          panelType="cover"
          on:animationend={handleAnimationEnd}
        />
      {/if}

      {#if $panelsByPosition.back}
        <Panel3D
          panel={$panelsByPosition.back}
          foldState={$viewerState.foldState}
          side="outside"
          panelType="back"
        />
      {/if}

      {#if $panelsByPosition.inside_flap}
        <Panel3D
          panel={$panelsByPosition.inside_flap}
          foldState={$viewerState.foldState}
          side="outside"
          panelType="inside_flap"
        />
      {/if}

      <!-- Inside panels (visible when unfolded) -->
      {#if $panelsByPosition.left_panel}
        <Panel3D
          panel={$panelsByPosition.left_panel}
          foldState={$viewerState.foldState}
          side="inside"
          panelType="left"
        />
      {/if}

      {#if $panelsByPosition.center_panel}
        <Panel3D
          panel={$panelsByPosition.center_panel}
          foldState={$viewerState.foldState}
          side="inside"
          panelType="center"
        />
      {/if}

      {#if $panelsByPosition.right_panel}
        <Panel3D
          panel={$panelsByPosition.right_panel}
          foldState={$viewerState.foldState}
          side="inside"
          panelType="right"
        />
      {/if}

      <!-- Shadow/lighting effects -->
      <FoldShadow foldState={$viewerState.foldState} />
    </div>
  </div>

  {#if showNavigation}
    <NavArrows
      canGoNext={$canGoNext}
      canGoPrevious={$canGoPrevious}
      on:next={() => viewerState.nextState()}
      on:previous={() => viewerState.previousState()}
    />
  {/if}

  <!-- Screen reader announcement for current state -->
  <div class="sr-only" aria-live="polite">
    {$viewerState.foldState === 'cover'
      ? 'Viewing brochure cover'
      : $viewerState.foldState === 'back'
        ? 'Viewing brochure back'
        : $viewerState.foldState === 'partial_open'
          ? 'Left panel and inside flap visible'
          : 'Brochure fully open'}
  </div>
</div>

<style>
  .viewer-container {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    background: var(--color-background-secondary);
    border-radius: var(--radius-xl);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }

  .viewer-container:focus {
    outline: none;
  }

  .viewer-container:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .viewer-container.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    aspect-ratio: unset;
    border-radius: 0;
    z-index: 9999;
    background: var(--color-background);
  }

  .viewer-perspective {
    perspective: 1200px;
    perspective-origin: 50% 50%;
    width: 80%;
    height: 80%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--transition-normal);
  }

  .brochure-scene {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brochure-scene.animating {
    pointer-events: none;
  }

  .brochure-scene.reduced-motion {
    transition: none;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Responsive sizing */
  @media (max-width: 640px) {
    .viewer-perspective {
      width: 90%;
      height: 85%;
      perspective: 800px;
    }
  }

  @media (min-width: 1024px) {
    .viewer-perspective {
      perspective: 1500px;
    }
  }
</style>
