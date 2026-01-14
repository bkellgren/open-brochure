<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';

  // Minimum swipe distance in pixels to trigger navigation
  const SWIPE_THRESHOLD = 150;
  // Maximum vertical movement allowed (to distinguish from scrolling)
  const MAX_VERTICAL = 100;
  // Minimum velocity for swipe detection (px/ms)
  const MIN_VELOCITY = 0.3;

  const dispatch = createEventDispatcher<{
    swipeLeft: void;
    swipeRight: void;
  }>();

  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let isSwiping = false;

  function handleTouchStart(event: TouchEvent) {
    if (event.touches.length !== 1) return;

    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
    isSwiping = true;
  }

  function handleTouchMove(event: TouchEvent) {
    if (!isSwiping || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const deltaY = Math.abs(touch.clientY - startY);

    // Cancel swipe if too much vertical movement (user might be scrolling)
    if (deltaY > MAX_VERTICAL) {
      isSwiping = false;
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    if (!isSwiping) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = Math.abs(touch.clientY - startY);
    const deltaTime = Date.now() - startTime;
    const velocity = Math.abs(deltaX) / deltaTime;

    isSwiping = false;

    // Check if swipe meets criteria
    if (deltaY > MAX_VERTICAL) return;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD && velocity < MIN_VELOCITY) return;

    // Dispatch swipe event
    if (deltaX < 0) {
      dispatch('swipeLeft');
    } else {
      dispatch('swipeRight');
    }
  }

  // Mouse drag support for desktop
  let isMouseDown = false;
  let mouseStartX = 0;
  let mouseStartTime = 0;

  function handleMouseDown(event: MouseEvent) {
    // Only track primary button
    if (event.button !== 0) return;

    isMouseDown = true;
    mouseStartX = event.clientX;
    mouseStartTime = Date.now();
  }

  function handleMouseUp(event: MouseEvent) {
    if (!isMouseDown) return;

    const deltaX = event.clientX - mouseStartX;
    const deltaTime = Date.now() - mouseStartTime;
    const velocity = Math.abs(deltaX) / deltaTime;

    isMouseDown = false;

    // Check if drag meets swipe criteria
    if (Math.abs(deltaX) < SWIPE_THRESHOLD && velocity < MIN_VELOCITY) return;

    if (deltaX < 0) {
      dispatch('swipeLeft');
    } else {
      dispatch('swipeRight');
    }
  }

  function handleMouseLeave() {
    isMouseDown = false;
  }
</script>

<div
  class="swipe-handler"
  on:touchstart|passive={handleTouchStart}
  on:touchmove|passive={handleTouchMove}
  on:touchend|passive={handleTouchEnd}
  on:mousedown={handleMouseDown}
  on:mouseup={handleMouseUp}
  on:mouseleave={handleMouseLeave}
  role="presentation"
  aria-hidden="true"
></div>

<style>
  .swipe-handler {
    position: absolute;
    inset: 0;
    z-index: 5;
    touch-action: pan-y; /* Allow vertical scrolling but capture horizontal */
    cursor: grab;
  }

  .swipe-handler:active {
    cursor: grabbing;
  }
</style>
