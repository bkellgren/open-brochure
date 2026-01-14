<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { MAX_FILE_SIZE_MB, ALLOWED_FILE_TYPES } from '@open-brochure/shared';

  const dispatch = createEventDispatcher<{
    file: File;
    error: string;
  }>();

  let isDragging = false;
  let fileInput: HTMLInputElement;

  const allowedTypes = ALLOWED_FILE_TYPES.join(', ');
  const allowedExtensions = '.jpg, .jpeg, .png, .pdf';

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;

    const files = e.dataTransfer?.files;
    if (files?.length) {
      validateAndDispatch(files[0]);
    }
  }

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      validateAndDispatch(input.files[0]);
    }
  }

  function validateAndDispatch(file: File) {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
      dispatch('error', `Please upload a valid image (JPG, PNG) or PDF file`);
      return;
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      dispatch('error', `File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    dispatch('file', file);
  }

  function openFileDialog() {
    fileInput.click();
  }
</script>

<div
  class="upload-zone"
  class:dragging={isDragging}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  on:click={openFileDialog}
  on:keydown={(e) => e.key === 'Enter' && openFileDialog()}
  role="button"
  tabindex="0"
  aria-label="Upload file. Click or drag and drop."
>
  <input
    bind:this={fileInput}
    type="file"
    accept={allowedExtensions}
    on:change={handleFileSelect}
    class="sr-only"
    aria-hidden="true"
  />

  <div class="upload-content">
    <div class="upload-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    </div>

    <p class="upload-title">
      {#if isDragging}
        Drop your file here
      {:else}
        Drag and drop your brochure
      {/if}
    </p>

    <p class="upload-subtitle">
      or <span class="upload-link">browse</span> to choose a file
    </p>

    <p class="upload-hint">
      JPG, PNG, or PDF up to {MAX_FILE_SIZE_MB}MB
    </p>
  </div>
</div>

<style>
  .upload-zone {
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--space-12);
    text-align: center;
    cursor: pointer;
    transition: all var(--transition-normal);
    background: var(--color-background);
  }

  .upload-zone:hover,
  .upload-zone:focus-visible {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
  }

  .upload-zone.dragging {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
    transform: scale(1.02);
  }

  .upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
  }

  .upload-icon {
    color: var(--color-text-tertiary);
    margin-bottom: var(--space-2);
  }

  .dragging .upload-icon,
  .upload-zone:hover .upload-icon {
    color: var(--color-primary);
  }

  .upload-title {
    font-size: var(--text-lg);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .upload-subtitle {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .upload-link {
    color: var(--color-primary);
    font-weight: var(--font-medium);
  }

  .upload-hint {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    margin-top: var(--space-2);
  }
</style>
