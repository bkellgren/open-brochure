<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { viewerState, stateProgress, currentStateLabel } from '$lib/stores/viewerState';

  export let showShare = true;
  export let showFullscreen = true;
  export let showProgress = true;
  export let showEdit = false;
  export let showSave = false;
  export let showDownload = false;
  export let isOwner = false;
  export let isSaved = false;

  const dispatch = createEventDispatcher<{
    share: void;
    fullscreen: void;
    edit: void;
    save: void;
    download: void;
  }>();

  function handleShare() {
    dispatch('share');
  }

  function handleEdit() {
    dispatch('edit');
  }

  function handleSave() {
    dispatch('save');
  }

  function handleDownload() {
    dispatch('download');
  }

  function handleFullscreen() {
    toggleFullscreen();
    dispatch('fullscreen');
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      try {
        const container = document.querySelector('.viewer-container');
        if (container) {
          await container.requestFullscreen();
          viewerState.setFullscreen(true);
        }
      } catch (err) {
        console.warn('Fullscreen not supported:', err);
      }
    } else {
      await document.exitFullscreen();
      viewerState.setFullscreen(false);
    }
  }

  // Listen for fullscreen changes (e.g., pressing Escape)
  function handleFullscreenChange() {
    viewerState.setFullscreen(!!document.fullscreenElement);
  }
</script>

<svelte:document on:fullscreenchange={handleFullscreenChange} />

<div class="toolbar" role="toolbar" aria-label="Viewer controls">
  {#if showProgress}
    <div class="progress-indicator" aria-live="polite">
      <span class="state-label">{$currentStateLabel}</span>
      <span class="state-progress">{$stateProgress}</span>
    </div>
  {/if}

  <div class="toolbar-actions">
    {#if showEdit && isOwner}
      <button
        class="toolbar-btn"
        on:click|stopPropagation={handleEdit}
        aria-label="Edit panel arrangement"
        title="Edit Arrangement"
      >
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
          aria-hidden="true"
        >
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      </button>
    {/if}

    {#if showSave && !isSaved}
      <button
        class="toolbar-btn save-btn"
        on:click|stopPropagation={handleSave}
        aria-label="Save brochure"
        title="Save"
      >
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
          aria-hidden="true"
        >
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      </button>
    {/if}

    {#if showDownload && isSaved}
      <button
        class="toolbar-btn"
        on:click|stopPropagation={handleDownload}
        aria-label="Download brochure"
        title="Download"
      >
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
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
    {/if}

    {#if showShare}
      <button
        class="toolbar-btn"
        on:click|stopPropagation={handleShare}
        aria-label="Share brochure"
        title="Share"
      >
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
          aria-hidden="true"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>
    {/if}

    {#if showFullscreen}
      <button
        class="toolbar-btn"
        on:click|stopPropagation={handleFullscreen}
        aria-label={$viewerState.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        title={$viewerState.isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {#if $viewerState.isFullscreen}
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
            aria-hidden="true"
          >
            <path d="M8 3v3a2 2 0 0 1-2 2H3" />
            <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
            <path d="M3 16h3a2 2 0 0 1 2 2v3" />
            <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
        {:else}
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
            aria-hidden="true"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
            <path d="M3 16v3a2 2 0 0 0 2 2h3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        {/if}
      </button>
    {/if}
  </div>
</div>

<style>
  .toolbar {
    position: absolute;
    bottom: var(--space-4);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-2) var(--space-4);
    background: rgba(255, 255, 255, 0.95);
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 40;
  }

  .progress-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 var(--space-2);
  }

  .state-label {
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--color-text);
    white-space: nowrap;
  }

  .state-progress {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
  }

  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding-left: var(--space-2);
    border-left: 1px solid var(--color-border);
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-lg);
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition:
      background-color var(--transition-fast),
      color var(--transition-fast);
  }

  .toolbar-btn:hover {
    background: var(--color-background-secondary);
    color: var(--color-text);
  }

  .toolbar-btn:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .toolbar-btn.save-btn {
    color: var(--color-primary);
  }

  .toolbar-btn.save-btn:hover {
    background: var(--color-primary-light);
    color: var(--color-primary);
  }

  /* Mobile adjustments */
  @media (max-width: 640px) {
    .toolbar {
      bottom: var(--space-3);
      padding: var(--space-2) var(--space-3);
      gap: var(--space-3);
    }

    .progress-indicator {
      display: none;
    }

    .toolbar-actions {
      border-left: none;
      padding-left: 0;
    }

    .toolbar-btn {
      width: 40px;
      height: 40px;
    }
  }

  /* Fullscreen mode */
  :global(.viewer-container.fullscreen) .toolbar {
    bottom: var(--space-6);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .toolbar-btn {
      transition: none;
    }
  }
</style>
