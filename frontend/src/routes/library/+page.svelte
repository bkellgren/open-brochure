<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import BrochureCard from '$lib/components/BrochureCard.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { authStore } from '$lib/stores/auth';
  import { brochuresStore, hasBrochures } from '$lib/stores/brochures';

  let showToast = false;
  let toastMessage = '';
  let toastType: 'success' | 'error' = 'success';
  let confirmDelete: { id: string; name: string } | null = null;

  $: isAuthenticated = $authStore.isAuthenticated;
  $: isLoading = $brochuresStore.isLoading;
  $: brochures = $brochuresStore.items;
  $: error = $brochuresStore.error;

  onMount(() => {
    if (!isAuthenticated) {
      goto('/login?redirect=/library');
      return;
    }

    if (!$brochuresStore.hasLoaded) {
      brochuresStore.load();
    }
  });

  function handleView(e: CustomEvent<string>) {
    goto(`/view/${e.detail}`);
  }

  function handleEdit(e: CustomEvent<string>) {
    goto(`/arrange/${e.detail}`);
  }

  function handleShare(e: CustomEvent<string>) {
    goto(`/share/${e.detail}`);
  }

  async function handleRename(e: CustomEvent<{ id: string; name: string }>) {
    try {
      await brochuresStore.renameBrochure(e.detail.id, e.detail.name);
      showToast = true;
      toastType = 'success';
      toastMessage = 'Brochure renamed';
    } catch (err) {
      showToast = true;
      toastType = 'error';
      toastMessage = err instanceof Error ? err.message : 'Failed to rename';
    }
  }

  async function handleToggleVisibility(e: CustomEvent<string>) {
    try {
      const newVisibility = await brochuresStore.toggleVisibility(e.detail);
      showToast = true;
      toastType = 'success';
      toastMessage = `Brochure is now ${newVisibility}`;
    } catch (err) {
      showToast = true;
      toastType = 'error';
      toastMessage = err instanceof Error ? err.message : 'Failed to update visibility';
    }
  }

  function handleDeleteRequest(e: CustomEvent<string>) {
    const brochure = brochures.find((b) => b.id === e.detail);
    if (brochure) {
      confirmDelete = { id: brochure.id, name: brochure.name };
    }
  }

  async function confirmDeleteBrochure() {
    if (!confirmDelete) return;

    try {
      await brochuresStore.deleteBrochure(confirmDelete.id);
      showToast = true;
      toastType = 'success';
      toastMessage = 'Brochure deleted';
    } catch (err) {
      showToast = true;
      toastType = 'error';
      toastMessage = err instanceof Error ? err.message : 'Failed to delete';
    } finally {
      confirmDelete = null;
    }
  }

  function cancelDelete() {
    confirmDelete = null;
  }
</script>

<svelte:head>
  <title>My Library | Open Brochure</title>
</svelte:head>

<div class="library-page container fade-in">
  <div class="library-header">
    <h1>My Library</h1>
    <a href="/upload" class="btn btn-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      New Brochure
    </a>
  </div>

  {#if isLoading && !$brochuresStore.hasLoaded}
    <div class="loading">
      <p>Loading your brochures...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button class="btn btn-secondary" on:click={() => brochuresStore.load()}>
        Try Again
      </button>
    </div>
  {:else if !$hasBrochures}
    <EmptyState
      title="No brochures yet"
      description="Upload your first brochure to get started"
      actionLabel="Upload Brochure"
      actionHref="/upload"
    />
  {:else}
    <div class="brochure-grid" role="list">
      {#each brochures as brochure (brochure.id)}
        <BrochureCard
          {brochure}
          on:view={handleView}
          on:edit={handleEdit}
          on:share={handleShare}
          on:rename={handleRename}
          on:toggleVisibility={handleToggleVisibility}
          on:delete={handleDeleteRequest}
        />
      {/each}
    </div>

    {#if isLoading}
      <div class="loading-more">
        <p>Loading more...</p>
      </div>
    {/if}
  {/if}
</div>

<!-- Delete Confirmation Modal -->
{#if confirmDelete}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <div
    class="modal-overlay"
    on:click={cancelDelete}
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-modal-title"
  >
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="confirm-modal" on:click|stopPropagation role="document">
      <h2 id="delete-modal-title">Delete Brochure?</h2>
      <p>Are you sure you want to delete "{confirmDelete.name}"? This action cannot be undone.</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" on:click={cancelDelete}>
          Cancel
        </button>
        <button class="btn btn-danger" on:click={confirmDeleteBrochure}>
          Delete
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showToast}
  <Toast message={toastMessage} type={toastType} on:close={() => (showToast = false)} />
{/if}

<style>
  .library-page {
    max-width: 1200px;
    margin: 0 auto;
  }

  .library-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-8);
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  .library-header h1 {
    margin: 0;
  }

  .library-header .btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .loading,
  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    text-align: center;
    gap: var(--space-4);
  }

  .brochure-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-6);
  }

  @media (max-width: 640px) {
    .brochure-grid {
      grid-template-columns: 1fr;
    }
  }

  .loading-more {
    text-align: center;
    padding: var(--space-8);
    color: var(--color-text-secondary);
  }

  .modal-overlay {
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

  .confirm-modal {
    background: var(--color-background);
    border-radius: var(--radius-xl);
    padding: var(--space-8);
    max-width: 400px;
    width: 100%;
    box-shadow: var(--shadow-xl);
  }

  .confirm-modal h2 {
    margin-bottom: var(--space-2);
  }

  .confirm-modal p {
    color: var(--color-text-secondary);
    margin-bottom: var(--space-6);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
  }

  .btn-danger {
    background: var(--color-error);
    color: white;
  }

  .btn-danger:hover {
    opacity: 0.9;
  }
</style>
