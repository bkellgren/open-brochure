<script lang="ts">
  import { goto } from '$app/navigation';
  import FileUpload from '$lib/components/FileUpload.svelte';
  import UploadProgress from '$lib/components/UploadProgress.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { uploadFile } from '$lib/api';
  import { detectPanelsFromImage, fileToDataUrl } from '$lib/services/panelDetection';
  import { combinePdfPages } from '$lib/utils/pdfExtract';
  import { isPdf, suggestNameFromFile } from '$lib/utils/validation';
  import { arrangement } from '$lib/stores/arrangement';

  let uploadState: 'idle' | 'uploading' | 'processing' | 'complete' | 'error' = 'idle';
  let uploadProgress = 0;
  let selectedFile: File | null = null;
  let suggestedName = '';
  let errorMessage = '';

  async function handleFile(event: CustomEvent<File>) {
    const file = event.detail;
    selectedFile = file;
    suggestedName = suggestNameFromFile(file.name);
    errorMessage = '';

    try {
      uploadState = 'uploading';

      // Upload file to R2
      await uploadFile(file, (progress) => {
        uploadProgress = progress;
      });

      uploadState = 'processing';

      // Get image data URL for panel detection
      let imageDataUrl: string;
      if (isPdf(file)) {
        // Extract and combine PDF pages
        imageDataUrl = await combinePdfPages(file);
      } else {
        // Use image directly
        imageDataUrl = await fileToDataUrl(file);
      }

      // Detect panels
      const panels = await detectPanelsFromImage(imageDataUrl);
      arrangement.initialize(panels);

      uploadState = 'complete';

      // Navigate to arrangement page
      setTimeout(() => {
        goto(`/arrange?name=${encodeURIComponent(suggestedName)}`);
      }, 500);
    } catch (error) {
      uploadState = 'error';
      errorMessage = error instanceof Error ? error.message : 'Upload failed';
    }
  }

  function handleUploadError(event: CustomEvent<string>) {
    errorMessage = event.detail;
    uploadState = 'idle';
  }

  function dismissError() {
    errorMessage = '';
  }

  function reset() {
    uploadState = 'idle';
    uploadProgress = 0;
    selectedFile = null;
    errorMessage = '';
  }
</script>

<svelte:head>
  <title>Upload Brochure | Open Brochure</title>
</svelte:head>

<div class="upload-page container fade-in">
  <div class="upload-header">
    <h1>Upload your brochure</h1>
    <p>We'll detect the 6 panels and let you arrange them</p>
  </div>

  <div class="upload-content">
    {#if uploadState === 'idle'}
      <FileUpload on:file={handleFile} on:error={handleUploadError} />
    {:else}
      <UploadProgress
        progress={uploadProgress}
        filename={selectedFile?.name || ''}
        status={uploadState === 'error' ? 'error' : uploadState}
      />

      {#if uploadState === 'error'}
        <button class="btn btn-secondary mt-4" on:click={reset}>
          Try Again
        </button>
      {/if}
    {/if}
  </div>
</div>

{#if errorMessage}
  <div class="toast-container">
    <Toast message={errorMessage} type="error" on:dismiss={dismissError} />
  </div>
{/if}

<style>
  .upload-page {
    max-width: 600px;
    margin: 0 auto;
  }

  .upload-header {
    text-align: center;
    margin-bottom: var(--space-8);
  }

  .upload-header h1 {
    margin-bottom: var(--space-2);
  }

  .upload-header p {
    font-size: var(--text-lg);
  }

  .upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .toast-container {
    position: fixed;
    bottom: var(--space-4);
    right: var(--space-4);
    z-index: var(--z-toast);
  }
</style>
