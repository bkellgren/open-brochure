<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import PanelArrangement from '$lib/components/PanelArrangement.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { arrangement, panelsByPosition } from '$lib/stores/arrangement';

  let name = '';
  let showToast = false;
  let toastMessage = '';

  onMount(() => {
    // Get suggested name from URL
    name = $page.url.searchParams.get('name') || 'Untitled Brochure';

    // Redirect if no panels loaded
    if ($arrangement.panels.length === 0) {
      goto('/upload');
    }
  });

  function handleConfirm() {
    // In MVP, just navigate to viewer with panels in state
    // Later: save to backend
    arrangement.markSaved();

    // Store in session for viewer
    if (typeof sessionStorage !== 'undefined') {
      const panels = $arrangement.panels.map((p) => ({
        position: p.position,
        imageUrl: p.imageUrl,
      }));
      sessionStorage.setItem('brochure_panels', JSON.stringify(panels));
      sessionStorage.setItem('brochure_name', name);
    }

    goto('/view/preview');
  }

  function handleCancel() {
    goto('/upload');
  }

  function dismissToast() {
    showToast = false;
  }
</script>

<svelte:head>
  <title>Arrange Panels | Open Brochure</title>
</svelte:head>

<div class="arrange-page container fade-in">
  <div class="arrange-header">
    <h1>Arrange your panels</h1>
    <p>Drag panels to match your brochure's layout</p>
  </div>

  <div class="name-input">
    <label for="brochure-name" class="sr-only">Brochure name</label>
    <input
      id="brochure-name"
      type="text"
      bind:value={name}
      placeholder="Enter brochure name"
      class="name-field"
    />
  </div>

  <PanelArrangement on:confirm={handleConfirm} on:cancel={handleCancel} />
</div>

{#if showToast}
  <div class="toast-container">
    <Toast message={toastMessage} type="success" on:dismiss={dismissToast} />
  </div>
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

  .name-input {
    margin-bottom: var(--space-8);
  }

  .name-field {
    width: 100%;
    text-align: center;
    font-size: var(--text-lg);
    font-weight: var(--font-medium);
    border: none;
    border-bottom: 2px solid var(--color-border);
    border-radius: 0;
    padding: var(--space-2) var(--space-4);
    background: transparent;
  }

  .name-field:focus {
    border-bottom-color: var(--color-primary);
    box-shadow: none;
  }

  .toast-container {
    position: fixed;
    bottom: var(--space-4);
    right: var(--space-4);
    z-index: var(--z-toast);
  }
</style>
