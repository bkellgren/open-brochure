<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { generateQRCodeDataUrl, downloadQRCode } from '$lib/services/qrcode';
  import Toast from './Toast.svelte';

  export let shareUrl: string;
  export let brochureName: string;

  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  let qrCodeDataUrl = '';
  let isCopied = false;
  let showToast = false;
  let toastMessage = '';

  onMount(async () => {
    qrCodeDataUrl = await generateQRCodeDataUrl(shareUrl);
  });

  function handleClose() {
    dispatch('close');
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      isCopied = true;
      setTimeout(() => (isCopied = false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      isCopied = true;
      setTimeout(() => (isCopied = false), 2000);
    }
  }

  async function handleDownloadQR() {
    await downloadQRCode(shareUrl, brochureName.toLowerCase().replace(/\s+/g, '-'));
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: brochureName,
          text: `Check out this brochure: ${brochureName}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          showToast = true;
          toastMessage = 'Failed to share';
        }
      }
    } else {
      // Fallback: copy link
      await copyLink();
    }
  }

  $: hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<div class="share-modal-overlay" on:click={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
  <div class="share-modal">
    <button class="close-btn" on:click={handleClose} aria-label="Close">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>

    <h2 id="share-modal-title">Share Brochure</h2>
    <p class="brochure-name">{brochureName}</p>

    <!-- QR Code -->
    <div class="qr-section">
      {#if qrCodeDataUrl}
        <img src={qrCodeDataUrl} alt="QR code for {brochureName}" class="qr-code" />
      {:else}
        <div class="qr-placeholder">Loading QR code...</div>
      {/if}
      <button class="btn btn-ghost btn-sm" on:click={handleDownloadQR}>
        Download QR Code
      </button>
    </div>

    <!-- Share Link -->
    <div class="link-section">
      <label for="share-url" class="sr-only">Share URL</label>
      <div class="link-input-group">
        <input
          id="share-url"
          type="text"
          value={shareUrl}
          readonly
          class="link-input"
        />
        <button class="btn btn-secondary" on:click={copyLink}>
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>

    <!-- Share Options -->
    <div class="share-options">
      {#if hasNativeShare}
        <button class="btn btn-primary btn-full" on:click={handleNativeShare}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
      {/if}

      <div class="social-links">
        <a
          href="https://twitter.com/intent/tweet?url={encodeURIComponent(shareUrl)}&text={encodeURIComponent(`Check out this brochure: ${brochureName}`)}"
          target="_blank"
          rel="noopener noreferrer"
          class="social-btn"
          aria-label="Share on X (Twitter)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
        <a
          href="https://www.facebook.com/sharer/sharer.php?u={encodeURIComponent(shareUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          class="social-btn"
          aria-label="Share on Facebook"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
        <a
          href="https://www.linkedin.com/sharing/share-offsite/?url={encodeURIComponent(shareUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          class="social-btn"
          aria-label="Share on LinkedIn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
        <a
          href="mailto:?subject={encodeURIComponent(brochureName)}&body={encodeURIComponent(`Check out this brochure: ${shareUrl}`)}"
          class="social-btn"
          aria-label="Share via Email"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</div>

{#if showToast}
  <Toast message={toastMessage} type="error" on:close={() => (showToast = false)} />
{/if}

<style>
  .share-modal-overlay {
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

  .share-modal {
    position: relative;
    background: var(--color-background);
    border-radius: var(--radius-xl);
    padding: var(--space-8);
    max-width: 440px;
    width: 100%;
    box-shadow: var(--shadow-xl);
  }

  .close-btn {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    background: none;
    border: none;
    padding: var(--space-2);
    color: var(--color-text-tertiary);
    cursor: pointer;
    border-radius: var(--radius-full);
    transition: all var(--transition-fast);
  }

  .close-btn:hover {
    background: var(--color-background-secondary);
    color: var(--color-text);
  }

  h2 {
    text-align: center;
    margin-bottom: var(--space-1);
  }

  .brochure-name {
    text-align: center;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    margin-bottom: var(--space-6);
  }

  .qr-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
  }

  .qr-code {
    width: 160px;
    height: 160px;
    border-radius: var(--radius-lg);
    background: white;
  }

  .qr-placeholder {
    width: 160px;
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-background-secondary);
    border-radius: var(--radius-lg);
    color: var(--color-text-tertiary);
    font-size: var(--text-sm);
  }

  .link-section {
    margin-bottom: var(--space-6);
  }

  .link-input-group {
    display: flex;
    gap: var(--space-2);
  }

  .link-input {
    flex: 1;
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background-secondary);
    font-size: var(--text-sm);
    color: var(--color-text);
  }

  .share-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .btn-full {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
  }

  .social-links {
    display: flex;
    justify-content: center;
    gap: var(--space-3);
  }

  .social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: var(--radius-full);
    background: var(--color-background-secondary);
    color: var(--color-text-secondary);
    transition: all var(--transition-fast);
  }

  .social-btn:hover {
    background: var(--color-background-tertiary);
    color: var(--color-text);
  }

  .btn-sm {
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-xs);
  }
</style>
