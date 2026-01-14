<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { ViewerContainer } from '$lib/components/viewer';
  import { getSharedBrochure } from '$lib/api';
  import type { BrochureWithPanels } from '@open-brochure/shared';

  let brochure: BrochureWithPanels | null = null;
  let isLoading = true;
  let error: string | null = null;

  $: shareToken = $page.params.shareToken;

  onMount(async () => {
    await loadBrochure();
  });

  async function loadBrochure() {
    try {
      isLoading = true;
      error = null;
      brochure = await getSharedBrochure(shareToken);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Brochure not found or no longer available';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>{brochure?.name || 'Shared Brochure'} | Open Brochure</title>
  {#if brochure}
    <meta property="og:title" content={brochure.name} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={$page.url.href} />
    {#if brochure.thumbnailUrl}
      <meta property="og:image" content={brochure.thumbnailUrl} />
    {/if}
    <meta name="twitter:card" content="summary_large_image" />
  {/if}
</svelte:head>

<div class="shared-view-page container fade-in">
  {#if isLoading}
    <div class="loading">
      <p>Loading brochure...</p>
    </div>
  {:else if error}
    <div class="error">
      <h1>Brochure Not Found</h1>
      <p>{error}</p>
      <a href="/" class="btn btn-primary">Go to Home</a>
    </div>
  {:else if brochure}
    <div class="view-header">
      <h1>{brochure.name}</h1>
    </div>

    <ViewerContainer
      panels={brochure.panels}
      showNavigation={true}
      enableKeyboard={true}
      enableSwipe={true}
      enableZoom={true}
    />

    <div class="view-footer">
      <p class="view-count">{brochure.viewCount} view{brochure.viewCount !== 1 ? 's' : ''}</p>
      <a href="/" class="create-link">
        Create your own brochure at <strong>Open Brochure</strong>
      </a>
    </div>
  {/if}
</div>

<style>
  .shared-view-page {
    max-width: 1000px;
    margin: 0 auto;
  }

  .view-header {
    text-align: center;
    margin-bottom: var(--space-6);
  }

  .view-header h1 {
    margin: 0;
  }

  .loading,
  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    gap: var(--space-4);
  }

  .error h1 {
    margin-bottom: var(--space-2);
  }

  .error p {
    color: var(--color-text-secondary);
    margin-bottom: var(--space-4);
  }

  .view-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    margin-top: var(--space-8);
    padding: var(--space-6);
    background: var(--color-background-secondary);
    border-radius: var(--radius-xl);
    text-align: center;
  }

  .view-count {
    font-size: var(--text-sm);
    color: var(--color-text-tertiary);
    margin: 0;
  }

  .create-link {
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: var(--text-sm);
  }

  .create-link:hover {
    color: var(--color-primary);
  }

  .create-link strong {
    color: var(--color-primary);
  }
</style>
