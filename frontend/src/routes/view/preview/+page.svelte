<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ViewerContainer } from '$lib/components/viewer';
  import Toast from '$lib/components/Toast.svelte';
  import LoginPrompt from '$lib/components/LoginPrompt.svelte';
  import { authStore } from '$lib/stores/auth';
  import { brochuresStore } from '$lib/stores/brochures';
  import type { Panel, PanelPosition } from '@open-brochure/shared';

  interface StoredPanelData {
    position: PanelPosition;
    imageUrl: string;
  }

  let panels: Panel[] = [];
  let name = 'Preview';
  let isLoading = true;
  let isSaving = false;
  let showLoginPrompt = false;
  let showToast = false;
  let toastMessage = '';
  let toastType: 'success' | 'error' = 'success';

  $: isAuthenticated = $authStore.isAuthenticated;

  onMount(() => {
    // Load panels from session storage
    if (typeof sessionStorage !== 'undefined') {
      const storedPanels = sessionStorage.getItem('brochure_panels');
      const storedName = sessionStorage.getItem('brochure_name');

      if (storedPanels) {
        const storedData: StoredPanelData[] = JSON.parse(storedPanels);
        // Convert to full Panel objects for ViewerContainer
        panels = storedData.map((p, index) => ({
          id: `preview-${index}`,
          brochureId: 'preview',
          position: p.position,
          imageUrl: p.imageUrl,
          sortOrder: index,
        }));
        name = storedName || 'Preview';
        isLoading = false;
      } else {
        // No panels, redirect to upload
        goto('/upload');
      }
    }
  });

  function handleEditArrangement() {
    goto('/arrange');
  }

  function handleSave() {
    if (!isAuthenticated) {
      showLoginPrompt = true;
      return;
    }
    saveBrochure();
  }

  async function saveBrochure() {
    if (isSaving) return;

    try {
      isSaving = true;

      // TODO: Implement actual save to backend
      // For now, show success and redirect to a mock saved state
      // This will be completed when we have the full backend integration

      showToast = true;
      toastType = 'success';
      toastMessage = 'Brochure saved! Redirecting to library...';

      // Clear session storage after save
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('brochure_panels');
        sessionStorage.removeItem('brochure_name');
      }

      // Redirect to library after a brief delay
      setTimeout(() => {
        goto('/library');
      }, 1500);
    } catch (err) {
      showToast = true;
      toastType = 'error';
      toastMessage = err instanceof Error ? err.message : 'Failed to save brochure';
      isSaving = false;
    }
  }
</script>

<svelte:head>
  <title>{name} | Open Brochure</title>
</svelte:head>

<div class="view-page container fade-in">
  <div class="view-header">
    <h1>{name}</h1>
    <div class="view-actions">
      <button class="btn btn-secondary" on:click={handleEditArrangement}>
        Edit Arrangement
      </button>
      <button class="btn btn-primary" on:click={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Brochure'}
      </button>
    </div>
  </div>

  {#if isLoading}
    <div class="loading">
      <p>Loading viewer...</p>
    </div>
  {:else if panels.length > 0}
    <ViewerContainer
      {panels}
      showNavigation={true}
      enableKeyboard={true}
      enableSwipe={true}
      enableZoom={true}
    />

    <div class="view-info">
      <p>Click, swipe, or use arrow keys to unfold the brochure. {#if !isAuthenticated}Sign in to save and share.{:else}Click "Save Brochure" to add to your library.{/if}</p>
    </div>
  {:else}
    <div class="no-panels">
      <p>No panels to display.</p>
      <a href="/upload" class="btn btn-primary">Upload a Brochure</a>
    </div>
  {/if}
</div>

{#if showLoginPrompt}
  <LoginPrompt
    title="Sign in to save"
    description="Create a free account to save your brochures and access them from any device."
    on:close={() => (showLoginPrompt = false)}
  />
{/if}

{#if showToast}
  <Toast message={toastMessage} type={toastType} on:close={() => (showToast = false)} />
{/if}

<style>
  .view-page {
    max-width: 1000px;
    margin: 0 auto;
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
  .no-panels {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    gap: var(--space-4);
  }

  .view-info {
    margin-top: var(--space-6);
    text-align: center;
    padding: var(--space-4);
    background: var(--color-background-secondary);
    border-radius: var(--radius-lg);
  }

  .view-info p {
    font-size: var(--text-sm);
    margin: 0;
  }
</style>
