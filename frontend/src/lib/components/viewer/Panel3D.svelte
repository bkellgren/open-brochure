<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Panel } from '@open-brochure/shared';
  import type { FoldState } from '$lib/stores/viewerState';

  export let panel: Panel;
  export let foldState: FoldState;
  export let side: 'outside' | 'inside';
  export let panelType: 'cover' | 'back' | 'inside_flap' | 'left' | 'center' | 'right';

  const dispatch = createEventDispatcher<{
    animationend: void;
  }>();

  /**
   * Tri-fold brochure viewer states (4 states):
   *
   * COVER: Cover visible (single panel)
   * PARTIAL_OPEN: Left + Inside flap visible (2 panels)
   * FULLY_OPEN: All 3 inside panels visible (left, center, right)
   * BACK: Back panel visible (single panel)
   *
   * Animation rules (simulating real tri-fold physics):
   * - Inside flap: appears instantly when entering partial_open (was hidden under left panel)
   *   but animates when leaving partial_open (physically folds away)
   * - Center panel: always appears instantly (was hidden under inside flap, doesn't move)
   */

  let prevFoldState: FoldState = foldState;
  let insideFlapAppearing = false;

  // Track when inside_flap is appearing (needs instant show, no animation)
  $: {
    if (foldState !== prevFoldState) {
      if (panelType === 'inside_flap') {
        const wasVisible = prevFoldState === 'partial_open';
        const willBeVisible = foldState === 'partial_open';
        // Set flag when inside_flap is appearing
        insideFlapAppearing = !wasVisible && willBeVisible;
      }
      prevFoldState = foldState;
    }
  }

  // After inside_flap has appeared, re-enable transitions for when it leaves
  $: if (panelType === 'inside_flap' && insideFlapAppearing && foldState === 'partial_open') {
    // Use setTimeout to ensure the instant appearance happens before re-enabling
    setTimeout(() => {
      insideFlapAppearing = false;
    }, 50);
  }

  function getTransform(state: FoldState, type: typeof panelType): string {
    // All visible panels are flat (0deg), hidden panels rotated away
    switch (type) {
      case 'cover':
        return state === 'cover' ? 'rotateY(0deg)' : 'rotateY(180deg)';

      case 'back':
        return state === 'back' ? 'rotateY(0deg)' : 'rotateY(180deg)';

      case 'inside_flap':
        // Visible in partial_open (shows next to left panel)
        if (state === 'partial_open') return 'rotateY(0deg)';
        return 'rotateY(180deg)';

      case 'left':
        // Visible in partial_open and fully_open
        if (state === 'partial_open' || state === 'fully_open') return 'rotateY(0deg)';
        return 'rotateY(180deg)';

      case 'center':
        // Only visible in fully_open
        if (state === 'fully_open') return 'rotateY(0deg)';
        return 'rotateY(180deg)';

      case 'right':
        // Only visible in fully_open
        if (state === 'fully_open') return 'rotateY(0deg)';
        return 'rotateY(-180deg)';
    }
    return 'rotateY(0deg)';
  }

  function getVisible(state: FoldState, type: typeof panelType): boolean {
    switch (type) {
      case 'cover': return state === 'cover';
      case 'back': return state === 'back';
      case 'inside_flap': return state === 'partial_open';
      case 'left': return state === 'partial_open' || state === 'fully_open';
      case 'center': return state === 'fully_open';
      case 'right': return state === 'fully_open';
    }
    return false;
  }

  function getZIndex(state: FoldState, type: typeof panelType): number {
    if (type === 'cover') return state === 'cover' ? 50 : 1;
    if (type === 'back') return state === 'back' ? 50 : 1;
    if (type === 'inside_flap') return state === 'partial_open' ? 20 : 1;
    if (type === 'left') return 30;
    if (type === 'center') return 20;
    if (type === 'right') return 10;
    return 1;
  }

  $: transform = getTransform(foldState, panelType);
  $: visible = getVisible(foldState, panelType);
  $: zIndex = getZIndex(foldState, panelType);

  function handleTransitionEnd(e: TransitionEvent) {
    if (e.propertyName === 'transform') {
      dispatch('animationend');
    }
  }

  $: altText = `${panel.position.replace(/_/g, ' ')} panel`;
</script>

<div
  class="panel-wrapper panel-{panelType}"
  class:visible
  class:skip-transition={insideFlapAppearing}
  style:--transform={transform}
  style:--z-index={zIndex}
  on:transitionend={handleTransitionEnd}
  aria-hidden={!visible}
>
  <div class="panel-inner">
    <img src={panel.imageUrl} alt={altText} loading="lazy" draggable="false" />
  </div>
</div>

<style>
  .panel-wrapper {
    position: absolute;
    width: 30%;
    height: 85%;
    transform-style: preserve-3d;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
    backface-visibility: hidden;
    transform: var(--transform);
    z-index: var(--z-index);
    opacity: 0;
    pointer-events: none;
  }

  .panel-wrapper.visible {
    opacity: 1;
    pointer-events: auto;
  }

  .panel-inner {
    width: 100%;
    height: 100%;
    background: white;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .panel-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Position each panel type */
  .panel-cover,
  .panel-back {
    left: 35%;
    top: 7.5%;
    transform-origin: center center;
  }

  .panel-left {
    left: 5%;
    top: 7.5%;
    transform-origin: right center;
  }

  .panel-center {
    left: 35%;
    top: 7.5%;
    transform-origin: center center;
    /* Center panel never animates - it's revealed, not moving */
    transition: none !important;
  }

  .panel-right {
    left: 65%;
    top: 7.5%;
    transform-origin: left center;
  }

  .panel-inside_flap {
    left: 35%;
    top: 7.5%;
    transform-origin: center center;
  }

  /* Skip transition for panels that should appear instantly */
  .panel-wrapper.skip-transition {
    transition: none !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .panel-wrapper {
      transition: opacity 0.1s;
    }
  }
</style>
