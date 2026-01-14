<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { ViewerContainer } from '$lib/components/viewer';
  import Unavailable from '$lib/components/embed/Unavailable.svelte';
  import { getBrochure } from '$lib/api';
  import type { BrochureWithPanels } from '@open-brochure/shared';

  let brochure: BrochureWithPanels | null = null;
  let isLoading = true;
  let error: string | null = null;
  let errorMessage = 'This brochure is no longer available';
  let errorSubmessage = 'The brochure may have been deleted or made private by its owner.';

  $: brochureId = $page.params.id;

  onMount(async () => {
    await loadBrochure();
  });

  async function loadBrochure() {
    try {
      isLoading = true;
      error = null;
      brochure = await getBrochure(brochureId);

      // Check if brochure is public
      if (brochure.visibility !== 'public') {
        error = 'private';
        errorMessage = 'This brochure is no longer available for embedding';
        errorSubmessage = 'The owner has made this brochure private.';
        brochure = null;
      }
    } catch (err) {
      error = 'not_found';
      errorMessage = 'This brochure is no longer available';
      errorSubmessage = 'The brochure may have been deleted or the link is invalid.';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>{brochure?.name || 'Embedded Brochure'} | Open Brochure</title>
  <style>
    /* Minimal styles for embed context */
    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #f5f5f5;
    }
  </style>
</svelte:head>

<div class="embed-container">
  {#if isLoading}
    <div class="embed-message">
      <p>Loading...</p>
    </div>
  {:else if error}
    <Unavailable message={errorMessage} submessage={errorSubmessage} />
  {:else if brochure}
    <ViewerContainer
      panels={brochure.panels}
      showNavigation={true}
      enableKeyboard={true}
      enableSwipe={true}
      enableZoom={true}
    />
    <a href="https://openbrochure.com" target="_blank" rel="noopener noreferrer" class="embed-attribution">
      Open Brochure
    </a>
  {/if}
</div>

<style>
  .embed-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-4, 1rem);
    box-sizing: border-box;
    position: relative;
  }

  .embed-message {
    text-align: center;
    color: #666;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .embed-attribution {
    position: absolute;
    bottom: 8px;
    right: 8px;
    font-size: 10px;
    color: #999;
    text-decoration: none;
    font-family: system-ui, -apple-system, sans-serif;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
  }

  .embed-attribution:hover {
    color: #666;
  }
</style>
