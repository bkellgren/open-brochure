<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { downloadMockupPDF, downloadOriginalFile } from '$lib/services/mockups';

  export let brochureName: string;
  export let originalFileUrl: string;
  export let originalFileType: 'image' | 'pdf';
  export let viewerElement: HTMLElement | null = null;

  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  let isDownloadingMockup = false;
  let isDownloadingOriginal = false;
  let error: string | null = null;

  function handleClose() {
    dispatch('close');
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  async function handleDownloadMockup() {
    if (!viewerElement) {
      error = 'Viewer not available for mockup generation';
      return;
    }

    try {
      isDownloadingMockup = true;
      error = null;
      await downloadMockupPDF(viewerElement, brochureName);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to generate mockup';
    } finally {
      isDownloadingMockup = false;
    }
  }

  async function handleDownloadOriginal() {
    try {
      isDownloadingOriginal = true;
      error = null;
      const extension = originalFileType === 'pdf' ? 'pdf' : 'jpg';
      const filename = `${brochureName.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
      await downloadOriginalFile(originalFileUrl, filename);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to download original';
    } finally {
      isDownloadingOriginal = false;
    }
  }
</script>

<div class="download-modal-overlay" on:click={handleBackdropClick} role="dialog" aria-modal="true">
  <div class="download-modal">
    <button class="close-btn" on:click={handleClose} aria-label="Close">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>

    <h2>Download</h2>
    <p class="brochure-name">{brochureName}</p>

    {#if error}
      <div class="error-message">
        <p>{error}</p>
      </div>
    {/if}

    <div class="download-options">
      <!-- Mockup PDF -->
      <button
        class="download-option"
        on:click={handleDownloadMockup}
        disabled={isDownloadingMockup || !viewerElement}
      >
        <div class="option-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M12 18v-6" />
            <path d="M9 15l3 3 3-3" />
          </svg>
        </div>
        <div class="option-content">
          <h3>Mockup PDF</h3>
          <p>Download a PDF with 3D mockup images of your brochure</p>
        </div>
        {#if isDownloadingMockup}
          <span class="download-status">Generating...</span>
        {/if}
      </button>

      <!-- Original File -->
      <button
        class="download-option"
        on:click={handleDownloadOriginal}
        disabled={isDownloadingOriginal}
      >
        <div class="option-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <div class="option-content">
          <h3>Original File</h3>
          <p>Download the original uploaded {originalFileType === 'pdf' ? 'PDF' : 'image'}</p>
        </div>
        {#if isDownloadingOriginal}
          <span class="download-status">Downloading...</span>
        {/if}
      </button>
    </div>

    <p class="attribution-note">
      Mockup PDFs include "Created with Open Brochure" footer
    </p>
  </div>
</div>

<style>
  .download-modal-overlay {
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

  .download-modal {
    position: relative;
    background: var(--color-background);
    border-radius: var(--radius-xl);
    padding: var(--space-8);
    max-width: 440px;
    width: 100%;
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

  .error-message {
    padding: var(--space-3);
    background: var(--color-error-bg, #fef2f2);
    border: 1px solid var(--color-error-border, #fecaca);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
    text-align: center;
  }

  .error-message p {
    margin: 0;
    color: var(--color-error);
    font-size: var(--text-sm);
  }

  .download-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
  }

  .download-option {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-background);
    cursor: pointer;
    text-align: left;
    transition: all var(--transition-fast);
    position: relative;
  }

  .download-option:hover:not(:disabled) {
    border-color: var(--color-primary);
    background: var(--color-background-secondary);
  }

  .download-option:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .option-icon {
    flex-shrink: 0;
    color: var(--color-primary);
  }

  .option-content {
    flex: 1;
  }

  .option-content h3 {
    margin: 0 0 var(--space-1) 0;
    font-size: var(--text-base);
    font-weight: var(--font-medium);
  }

  .option-content p {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .download-status {
    position: absolute;
    top: var(--space-2);
    right: var(--space-3);
    font-size: var(--text-xs);
    color: var(--color-primary);
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .attribution-note {
    text-align: center;
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    margin: 0;
  }
</style>
