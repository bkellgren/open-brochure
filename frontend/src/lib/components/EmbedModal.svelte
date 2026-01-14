<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getEmbedCode } from '$lib/api';

  export let brochureId: string;
  export let brochureName: string;
  export let isPublic: boolean;

  const dispatch = createEventDispatcher<{
    close: void;
    makePublic: void;
  }>();

  let embedCode = '';
  let isLoading = true;
  let error: string | null = null;
  let isCopied = false;
  let width = 800;
  let height = 600;

  // Preset sizes
  const presets = [
    { label: 'Small', width: 400, height: 300 },
    { label: 'Medium', width: 600, height: 450 },
    { label: 'Large', width: 800, height: 600 },
    { label: 'Full Width', width: 100, height: 600, isPercent: true },
  ];

  $: if (isPublic) {
    loadEmbedCode();
  }

  async function loadEmbedCode() {
    try {
      isLoading = true;
      error = null;
      const response = await getEmbedCode(brochureId, width, height);
      embedCode = response.embedCode;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to generate embed code';
    } finally {
      isLoading = false;
    }
  }

  function selectPreset(preset: typeof presets[0]) {
    if (preset.isPercent) {
      embedCode = `<iframe src="https://openbrochure.com/embed/${brochureId}" width="100%" height="${preset.height}" frameborder="0" allowfullscreen></iframe>`;
    } else {
      width = preset.width;
      height = preset.height;
      loadEmbedCode();
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(embedCode);
      isCopied = true;
      setTimeout(() => (isCopied = false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = embedCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      isCopied = true;
      setTimeout(() => (isCopied = false), 2000);
    }
  }

  function handleClose() {
    dispatch('close');
  }

  function handleMakePublic() {
    dispatch('makePublic');
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }
</script>

<div class="embed-modal-overlay" on:click={handleBackdropClick} role="dialog" aria-modal="true">
  <div class="embed-modal">
    <button class="close-btn" on:click={handleClose} aria-label="Close">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>

    <h2>Embed Brochure</h2>
    <p class="brochure-name">{brochureName}</p>

    {#if !isPublic}
      <div class="private-notice">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <div>
          <p><strong>This brochure is private</strong></p>
          <p>Make it public to enable embedding on external websites.</p>
        </div>
      </div>
      <button class="btn btn-primary btn-full" on:click={handleMakePublic}>
        Make Public
      </button>
    {:else}
      {#if isLoading}
        <div class="loading">
          <p>Generating embed code...</p>
        </div>
      {:else if error}
        <div class="error">
          <p>{error}</p>
          <button class="btn btn-secondary" on:click={loadEmbedCode}>Try Again</button>
        </div>
      {:else}
        <!-- Size Presets -->
        <div class="presets">
          <span class="presets-label">Size:</span>
          {#each presets as preset}
            <button
              class="preset-btn"
              class:active={!preset.isPercent && preset.width === width && preset.height === height}
              on:click={() => selectPreset(preset)}
            >
              {preset.label}
            </button>
          {/each}
        </div>

        <!-- Custom Dimensions -->
        <div class="dimensions">
          <div class="dimension-input">
            <label for="embed-width">Width</label>
            <input
              id="embed-width"
              type="number"
              bind:value={width}
              on:change={loadEmbedCode}
              min="200"
              max="1920"
            />
          </div>
          <span class="dimension-sep">×</span>
          <div class="dimension-input">
            <label for="embed-height">Height</label>
            <input
              id="embed-height"
              type="number"
              bind:value={height}
              on:change={loadEmbedCode}
              min="200"
              max="1080"
            />
          </div>
        </div>

        <!-- Embed Code -->
        <div class="code-section">
          <label for="embed-code" class="code-label">Embed Code</label>
          <textarea
            id="embed-code"
            readonly
            rows="3"
            class="code-input"
          >{embedCode}</textarea>
          <button class="btn btn-secondary btn-full" on:click={copyCode}>
            {isCopied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        <!-- Preview -->
        <div class="preview-section">
          <p class="preview-label">Preview</p>
          <div class="preview-container">
            <div
              class="preview-frame"
              style="width: {Math.min(width, 300)}px; height: {Math.min(height, 225)}px;"
            >
              <div class="preview-content">
                <span class="preview-text">Preview</span>
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .embed-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-modal);
    padding: var(--space-4);
  }

  .embed-modal {
    position: relative;
    background: var(--color-background);
    border-radius: var(--radius-xl);
    padding: var(--space-8);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-xl);
  }

  .close-btn {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    background: none;
    border: none;
    padding: var(--space-2);
    color: var(--color-text-tertiary);
    cursor: pointer;
    border-radius: var(--radius-full);
    transition: all var(--transition-fast);
  }

  .close-btn:hover {
    background: var(--color-background-secondary);
    color: var(--color-text);
  }

  h2 {
    text-align: center;
    margin-bottom: var(--space-1);
  }

  .brochure-name {
    text-align: center;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    margin-bottom: var(--space-6);
  }

  .private-notice {
    display: flex;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--color-warning-bg, #fff8e6);
    border: 1px solid var(--color-warning-border, #f0c36d);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-4);
  }

  .private-notice svg {
    flex-shrink: 0;
    color: var(--color-warning, #d97706);
  }

  .private-notice p {
    margin: 0;
    font-size: var(--text-sm);
  }

  .private-notice p:first-child {
    margin-bottom: var(--space-1);
  }

  .private-notice p:last-child {
    color: var(--color-text-secondary);
  }

  .loading,
  .error {
    text-align: center;
    padding: var(--space-8);
  }

  .presets {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
    flex-wrap: wrap;
  }

  .presets-label {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .preset-btn {
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-xs);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    background: var(--color-background);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .preset-btn:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .preset-btn.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
  }

  .dimensions {
    display: flex;
    align-items: flex-end;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
  }

  .dimension-input {
    flex: 1;
  }

  .dimension-input label {
    display: block;
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-1);
  }

  .dimension-input input {
    width: 100%;
    padding: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
  }

  .dimension-sep {
    color: var(--color-text-tertiary);
    padding-bottom: var(--space-2);
  }

  .code-section {
    margin-bottom: var(--space-6);
  }

  .code-label {
    display: block;
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-2);
  }

  .code-input {
    width: 100%;
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background-secondary);
    font-family: monospace;
    font-size: var(--text-xs);
    resize: none;
    margin-bottom: var(--space-2);
  }

  .preview-section {
    text-align: center;
  }

  .preview-label {
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-2);
  }

  .preview-container {
    display: flex;
    justify-content: center;
  }

  .preview-frame {
    background: var(--color-background-secondary);
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-content {
    color: var(--color-text-tertiary);
    font-size: var(--text-xs);
  }

  .btn-full {
    width: 100%;
  }
</style>
