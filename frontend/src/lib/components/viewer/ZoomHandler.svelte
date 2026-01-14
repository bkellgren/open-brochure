<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';

  export let zoomLevel = 1;

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;

  const dispatch = createEventDispatcher<{
    zoom: number;
  }>();

  let initialDistance = 0;
  let initialZoom = 1;
  let isPinching = false;

  function getDistance(touches: TouchList): number {
    if (touches.length < 2) return 0;

    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      isPinching = true;
      initialDistance = getDistance(event.touches);
      initialZoom = zoomLevel;
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (!isPinching || event.touches.length !== 2) return;

    const currentDistance = getDistance(event.touches);
    const scale = currentDistance / initialDistance;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, initialZoom * scale));

    dispatch('zoom', newZoom);
  }

  function handleTouchEnd(event: TouchEvent) {
    if (event.touches.length < 2) {
      isPinching = false;
    }
  }

  // Double-tap to toggle zoom
  let lastTapTime = 0;
  const DOUBLE_TAP_DELAY = 300;

  function handleDoubleTap(event: TouchEvent) {
    if (event.touches.length !== 1) return;

    const currentTime = Date.now();
    const tapInterval = currentTime - lastTapTime;
    lastTapTime = currentTime;

    if (tapInterval < DOUBLE_TAP_DELAY && tapInterval > 0) {
      // Double tap detected - toggle between 1x and 2x zoom
      const newZoom = zoomLevel > 1 ? 1 : 2;
      dispatch('zoom', newZoom);
    }
  }

  // Mouse wheel zoom for desktop
  function handleWheel(event: WheelEvent) {
    // Only zoom with Ctrl/Cmd key (standard convention)
    if (!event.ctrlKey && !event.metaKey) return;

    event.preventDefault();

    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel + delta));

    dispatch('zoom', newZoom);
  }
</script>

<div
  class="zoom-handler"
  on:touchstart|passive={handleTouchStart}
  on:touchstart|passive={handleDoubleTap}
  on:touchmove|passive={handleTouchMove}
  on:touchend|passive={handleTouchEnd}
  on:wheel={handleWheel}
  role="presentation"
  aria-hidden="true"
></div>

<style>
  .zoom-handler {
    position: absolute;
    inset: 0;
    z-index: 4;
    touch-action: manipulation;
  }
</style>
