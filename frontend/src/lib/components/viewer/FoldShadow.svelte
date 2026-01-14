<script lang="ts">
  import type { FoldState } from '$lib/stores/viewerState';

  export let foldState: FoldState;

  // Shadow intensity based on fold state
  $: leftShadowOpacity = getLeftShadowOpacity(foldState);
  $: rightShadowOpacity = getRightShadowOpacity(foldState);
  $: centerShadowOpacity = getCenterShadowOpacity(foldState);
  $: ambientShadowOpacity = getAmbientShadowOpacity(foldState);

  function getLeftShadowOpacity(state: FoldState): number {
    switch (state) {
      case 'cover':
      case 'back':
        return 0;
      case 'partial_open':
        return 0.1;
      case 'fully_open':
        return 0; // No side shadows when flat
    }
  }

  function getRightShadowOpacity(state: FoldState): number {
    switch (state) {
      case 'cover':
      case 'back':
        return 0;
      case 'partial_open':
        return 0.05;
      case 'fully_open':
        return 0; // No side shadows when flat
    }
  }

  function getCenterShadowOpacity(state: FoldState): number {
    switch (state) {
      case 'cover':
        return 0.2; // Light shadow on folded cover
      case 'back':
        return 0.2;
      case 'partial_open':
        return 0.05;
      case 'fully_open':
        return 0; // No vignette when flat - panels are fully lit
    }
  }

  function getAmbientShadowOpacity(state: FoldState): number {
    switch (state) {
      case 'cover':
      case 'back':
        return 0.15;
      case 'partial_open':
        return 0.1;
      case 'fully_open':
        return 0.08; // Subtle ground shadow only
    }
  }
</script>

<div class="fold-shadows" aria-hidden="true">
  <!-- Left fold shadow (appears when left panel unfolds) -->
  <div
    class="shadow left-fold-shadow"
    style="opacity: {leftShadowOpacity}"
  ></div>

  <!-- Right fold shadow (appears when right panel unfolds) -->
  <div
    class="shadow right-fold-shadow"
    style="opacity: {rightShadowOpacity}"
  ></div>

  <!-- Center gradient shadow (soft ambient) -->
  <div
    class="shadow center-shadow"
    style="opacity: {centerShadowOpacity}"
  ></div>

  <!-- Ambient drop shadow under the whole brochure -->
  <div
    class="shadow ambient-shadow"
    style="opacity: {ambientShadowOpacity}"
  ></div>

  <!-- Fold crease highlight lines - only show in fully_open when all 3 panels visible -->
  <div class="crease left-crease" class:visible={foldState === 'fully_open'}></div>
  <div class="crease right-crease" class:visible={foldState === 'fully_open'}></div>
</div>

<style>
  .fold-shadows {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 20;
  }

  .shadow {
    position: absolute;
    transition: opacity 0.4s ease-out;
  }

  /* Left fold shadow - gradient from left edge */
  .left-fold-shadow {
    left: 0;
    top: 0;
    width: 40%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.4) 0%,
      rgba(0, 0, 0, 0.15) 30%,
      transparent 100%
    );
  }

  /* Right fold shadow - gradient from right edge */
  .right-fold-shadow {
    right: 0;
    top: 0;
    width: 40%;
    height: 100%;
    background: linear-gradient(
      -90deg,
      rgba(0, 0, 0, 0.4) 0%,
      rgba(0, 0, 0, 0.15) 30%,
      transparent 100%
    );
  }

  /* Center shadow - soft vignette */
  .center-shadow {
    inset: 0;
    background: radial-gradient(
      ellipse at center,
      transparent 40%,
      rgba(0, 0, 0, 0.1) 100%
    );
  }

  /* Ambient shadow beneath brochure */
  .ambient-shadow {
    bottom: -20px;
    left: 10%;
    width: 80%;
    height: 40px;
    background: radial-gradient(
      ellipse at center,
      rgba(0, 0, 0, 0.3) 0%,
      transparent 70%
    );
    filter: blur(10px);
    transform: rotateX(80deg);
  }

  /* Fold crease lines */
  .crease {
    position: absolute;
    top: 0;
    width: 2px;
    height: 100%;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .crease.visible {
    opacity: 1;
  }

  .left-crease {
    /* Aligns with where left panel (5% + 30% width) meets center panel (35%) */
    left: 35%;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(0, 0, 0, 0.08) 20%,
      rgba(0, 0, 0, 0.1) 50%,
      rgba(0, 0, 0, 0.08) 80%,
      transparent 100%
    );
  }

  .right-crease {
    /* Aligns with where center panel (35% + 30% width) meets right panel (65%) */
    left: 65%;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(0, 0, 0, 0.08) 20%,
      rgba(0, 0, 0, 0.1) 50%,
      rgba(0, 0, 0, 0.08) 80%,
      transparent 100%
    );
  }

  /* Reduced motion - instant transitions */
  @media (prefers-reduced-motion: reduce) {
    .shadow,
    .crease {
      transition: none;
    }
  }
</style>
