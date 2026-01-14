<script lang="ts">
  export let progress: number = 0;
  export let filename: string = '';
  export let status: 'uploading' | 'processing' | 'complete' | 'error' = 'uploading';

  $: progressPercent = Math.round(progress);
  $: statusText = {
    uploading: `Uploading... ${progressPercent}%`,
    processing: 'Processing brochure...',
    complete: 'Upload complete!',
    error: 'Upload failed',
  }[status];
</script>

<div class="upload-progress" class:error={status === 'error'}>
  <div class="progress-header">
    <span class="filename">{filename}</span>
    <span class="status">{statusText}</span>
  </div>

  <div class="progress-bar-container">
    <div
      class="progress-bar"
      class:complete={status === 'complete'}
      class:error={status === 'error'}
      style="width: {status === 'processing' ? 100 : progressPercent}%"
    />
  </div>

  {#if status === 'processing'}
    <div class="processing-indicator">
      <div class="spinner" />
      <span>Detecting panels...</span>
    </div>
  {/if}
</div>

<style>
  .upload-progress {
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-background);
  }

  .upload-progress.error {
    border-color: var(--color-error);
    background: #fef2f2;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-3);
  }

  .filename {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
  }

  .status {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .error .status {
    color: var(--color-error);
  }

  .progress-bar-container {
    height: 8px;
    background: var(--color-background-tertiary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: var(--color-primary);
    border-radius: var(--radius-full);
    transition: width var(--transition-fast);
  }

  .progress-bar.complete {
    background: var(--color-success);
  }

  .progress-bar.error {
    background: var(--color-error);
  }

  .processing-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-3);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
