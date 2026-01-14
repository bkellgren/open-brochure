<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import PanelArrangement from '$lib/components/PanelArrangement.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { getBrochure, updatePanels } from '$lib/api';
  import { authStore } from '$lib/stores/auth';
  import { arrangement } from '$lib/stores/arrangement';
  import type { BrochureWithPanels } from '@open-brochure/shared';

  let brochure: BrochureWithPanels | null = null;
  let isLoading = true;
  let error: string | null = null;
  let isSaving = false;
  let showToast = false;
  let toastMessage = '';
  let toastType: 'success' | 'error' = 'success';

  $: brochureId = $page.params.id;

  onMount(async () => {
    await loadBrochure();
  });

  async function loadBrochure() {
    try {
      isLoading = true;
      error = null;
      brochure = await getBrochure(brochureId);

      // Check ownership
      if (!$authStore.user || brochure.userId !== $authStore.user.id) {
        error = 'You do not have permission to edit this brochure';
        return;
      }

      // Initialize arrangement store
      arrangement.initializeFromBrochure(brochure.id, brochure.panels);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load brochure';
    } finally {
      isLoading = false;
    }
  }

  async function handleConfirm() {
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

      // Mark as saved
      arrangement.markSaved();

      showToast = true;
      toastType = 'success';
      toastMessage = 'Panel arrangement saved!';

      // Redirect back to viewer after a brief delay
      setTimeout(() => {
        goto(`/view/${brochureId}`);
      }, 1000);
    } catch (err) {
      showToast = true;
      toastType = 'error';
      toastMessage = err instanceof Error ? err.message : 'Failed to save arrangement';
      isSaving = false;
    }
  }

  function handleCancel() {
    goto(`/view/${brochureId}`);
  }
</script>

<svelte:head>
  <title>Edit Arrangement - {brochure?.name || 'Brochure'} | Open Brochure</title>
</svelte:head>

<div class="arrange-page container fade-in">
  {#if isLoading}
    <div class="loading">
      <p>Loading brochure...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <a href="/library" class="btn btn-primary">Go to Library</a>
    </div>
  {:else if brochure}
    <div class="arrange-header">
      <h1>Edit Arrangement</h1>
      <p class="brochure-name">{brochure.name}</p>
    </div>

    <PanelArrangement
      disabled={isSaving}
      on:confirm={handleConfirm}
      on:cancel={handleCancel}
    />

    {#if isSaving}
      <div class="saving-overlay">
        <p>Saving changes...</p>
      </div>
    {/if}
  {/if}
</div>

{#if showToast}
  <Toast message={toastMessage} type={toastType} on:close={() => (showToast = false)} />
{/if}

<style>
  .arrange-page {
    max-width: 800px;
    margin: 0 auto;
  }

  .arrange-header {
    text-align: center;
    margin-bottom: var(--space-6);
  }

  .arrange-header h1 {
    margin-bottom: var(--space-2);
  }

  .brochure-name {
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
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

  .saving-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .saving-overlay p {
    background: var(--color-background);
    padding: var(--space-6);
    border-radius: var(--radius-lg);
    font-weight: var(--font-medium);
  }
</style>
