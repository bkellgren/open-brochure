<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { ViewerContainer, Toolbar } from '$lib/components/viewer';
  import Toast from '$lib/components/Toast.svelte';
  import ShareModal from '$lib/components/ShareModal.svelte';
  import { getBrochure, updatePanels } from '$lib/api';
  import { authStore } from '$lib/stores/auth';
  import { arrangement } from '$lib/stores/arrangement';
  import type { BrochureWithPanels, Panel, PanelPosition } from '@open-brochure/shared';

  let brochure: BrochureWithPanels | null = null;
  let isLoading = true;
  let error: string | null = null;
  let isEditMode = false;
  let isSaving = false;
  let showToast = false;
  let toastMessage = '';
  let toastType: 'success' | 'error' = 'success';
  let showShareModal = false;

  $: brochureId = $page.params.id;
  $: isOwner = brochure && $authStore.user && brochure.userId === $authStore.user.id;

  onMount(async () => {
    await loadBrochure();
  });

  async function loadBrochure() {
    try {
      isLoading = true;
      error = null;
      brochure = await getBrochure(brochureId);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load brochure';
    } finally {
      isLoading = false;
    }
  }

  function enterEditMode() {
    if (!brochure) return;
    arrangement.initializeFromBrochure(brochure.id, brochure.panels);
    isEditMode = true;
  }

  function cancelEditMode() {
    arrangement.reset();
    isEditMode = false;
  }

  async function saveArrangement() {
    if (!brochure) return;

    try {
      isSaving = true;

      // Get current arrangement
      const panels = $arrangement.panels.map((p) => ({
        id: p.id,
        position: p.position,
      }));

      // Save to backend
      await updatePanels(brochure.id, panels);

      // Update local brochure data with new positions
      brochure = {
        ...brochure,
        panels: brochure.panels.map((p) => {
          const updated = panels.find((up) => up.id === p.id);
          return updated ? { ...p, position: updated.position } : p;
        }),
      };

      // Mark as saved in store
      arrangement.markSaved();

      showToast = true;
      toastType = 'success';
      toastMessage = 'Panel arrangement saved!';

      isEditMode = false;
    } catch (err) {
      showToast = true;
      toastType = 'error';
      toastMessage = err instanceof Error ? err.message : 'Failed to save arrangement';
    } finally {
      isSaving = false;
    }
  }

  function handleShare() {
    showShareModal = true;
  }

  function closeShareModal() {
    showShareModal = false;
  }
</script>

<svelte:head>
  <title>{brochure?.name || 'Brochure'} | Open Brochure</title>
</svelte:head>

<div class="view-page container fade-in">
  {#if isLoading}
    <div class="loading">
      <p>Loading brochure...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button class="btn btn-primary" on:click={loadBrochure}>Try Again</button>
    </div>
  {:else if brochure}
    <div class="view-header">
      <h1>{brochure.name}</h1>
      <div class="view-actions">
        {#if isOwner && !isEditMode}
          <button class="btn btn-secondary" on:click={enterEditMode}>
            Edit Arrangement
          </button>
          <button class="btn btn-primary" on:click={handleShare}>
            Share
          </button>
        {/if}
        {#if isEditMode}
          <button class="btn btn-ghost" on:click={cancelEditMode} disabled={isSaving}>
            Cancel
          </button>
          <button class="btn btn-primary" on:click={saveArrangement} disabled={isSaving || !$arrangement.hasChanges}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        {/if}
      </div>
    </div>

    {#if isEditMode}
      <!-- Import and use PanelArrangement component in edit mode -->
      {#await import('$lib/components/PanelArrangement.svelte') then { default: PanelArrangement }}
        <PanelArrangement
          on:confirm={saveArrangement}
          on:cancel={cancelEditMode}
        />
      {/await}
    {:else}
      <div class="viewer-wrapper">
        <ViewerContainer
          panels={brochure.panels}
          showNavigation={true}
          enableKeyboard={true}
          enableSwipe={true}
          enableZoom={true}
        />
        <Toolbar
          showShare={true}
          showFullscreen={true}
          showProgress={true}
          showEdit={true}
          showSave={false}
          showDownload={true}
          isOwner={isOwner || false}
          isSaved={!!brochure.userId}
          on:share={handleShare}
          on:edit={enterEditMode}
        />
      </div>

      <div class="brochure-meta">
        <span class="view-count">{brochure.viewCount} view{brochure.viewCount !== 1 ? 's' : ''}</span>
        <span class="visibility">{brochure.visibility === 'public' ? 'Public' : 'Private'}</span>
      </div>
    {/if}
  {/if}
</div>

{#if showToast}
  <Toast message={toastMessage} type={toastType} on:close={() => (showToast = false)} />
{/if}

{#if showShareModal && brochure}
  <ShareModal
    shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/s/${brochure.shareToken || brochure.id}`}
    brochureName={brochure.name}
    on:close={closeShareModal}
  />
{/if}

<style>
  .view-page {
    max-width: 1000px;
    margin: 0 auto;
  }

  .viewer-wrapper {
    position: relative;
    width: 100%;
  }

  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  .view-header h1 {
    margin: 0;
  }

  .view-actions {
    display: flex;
    gap: var(--space-2);
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

  .error {
    color: var(--color-error);
  }

  .brochure-meta {
    display: flex;
    justify-content: center;
    gap: var(--space-4);
    margin-top: var(--space-6);
    padding: var(--space-4);
    background: var(--color-background-secondary);
    border-radius: var(--radius-lg);
  }

  .view-count,
  .visibility {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .visibility {
    padding: var(--space-1) var(--space-2);
    background: var(--color-background);
    border-radius: var(--radius-sm);
  }
</style>
