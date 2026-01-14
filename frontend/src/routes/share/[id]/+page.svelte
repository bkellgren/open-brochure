<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import ShareModal from '$lib/components/ShareModal.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { getBrochure, generateShareLink } from '$lib/api';
  import { authStore } from '$lib/stores/auth';
  import type { BrochureWithPanels } from '@open-brochure/shared';

  let brochure: BrochureWithPanels | null = null;
  let shareUrl: string | null = null;
  let isLoading = true;
  let error: string | null = null;
  let showToast = false;
  let toastMessage = '';
  let toastType: 'success' | 'error' = 'success';

  $: brochureId = $page.params.id;

  onMount(async () => {
    // Check auth
    if (!$authStore.isAuthenticated) {
      goto('/login?redirect=' + encodeURIComponent($page.url.pathname));
      return;
    }

    await loadAndShare();
  });

  async function loadAndShare() {
    try {
      isLoading = true;
      error = null;

      // Load brochure
      brochure = await getBrochure(brochureId);

      // Check ownership
      if (brochure.userId !== $authStore.user?.id) {
        error = 'You can only share your own brochures';
        return;
      }

      // Generate share link
      const shareData = await generateShareLink(brochureId);
      shareUrl = shareData.shareUrl;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to generate share link';
    } finally {
      isLoading = false;
    }
  }

  function handleClose() {
    goto(`/view/${brochureId}`);
  }
</script>

<svelte:head>
  <title>Share {brochure?.name || 'Brochure'} | Open Brochure</title>
</svelte:head>

{#if isLoading}
  <div class="loading-page container">
    <p>Generating share link...</p>
  </div>
{:else if error}
  <div class="error-page container">
    <h1>Cannot Share</h1>
    <p>{error}</p>
    <button class="btn btn-primary" on:click={() => goto('/library')}>
      Go to Library
    </button>
  </div>
{:else if brochure && shareUrl}
  <ShareModal
    {shareUrl}
    brochureName={brochure.name}
    on:close={handleClose}
  />
{/if}

{#if showToast}
  <Toast message={toastMessage} type={toastType} on:close={() => (showToast = false)} />
{/if}

<style>
  .loading-page,
  .error-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
    gap: var(--space-4);
  }

  .error-page h1 {
    margin-bottom: var(--space-2);
  }

  .error-page p {
    color: var(--color-text-secondary);
    margin-bottom: var(--space-4);
  }
</style>
