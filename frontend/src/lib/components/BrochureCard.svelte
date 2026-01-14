<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { LibraryBrochure } from '@open-brochure/shared';

  export let brochure: LibraryBrochure;

  const dispatch = createEventDispatcher<{
    view: string;
    edit: string;
    share: string;
    delete: string;
    rename: { id: string; name: string };
    toggleVisibility: string;
  }>();

  let isEditing = false;
  let editName = brochure.name;
  let showMenu = false;

  function handleClick() {
    if (!isEditing) {
      dispatch('view', brochure.id);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  function startEditing(e: Event) {
    e.stopPropagation();
    editName = brochure.name;
    isEditing = true;
    showMenu = false;
  }

  function saveEdit() {
    if (editName.trim() && editName !== brochure.name) {
      dispatch('rename', { id: brochure.id, name: editName.trim() });
    }
    isEditing = false;
  }

  function cancelEdit() {
    isEditing = false;
    editName = brochure.name;
  }

  function handleEditKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  function toggleMenu(e: Event) {
    e.stopPropagation();
    showMenu = !showMenu;
  }

  function handleMenuAction(action: string, e: Event) {
    e.stopPropagation();
    showMenu = false;

    switch (action) {
      case 'edit':
        dispatch('edit', brochure.id);
        break;
      case 'share':
        dispatch('share', brochure.id);
        break;
      case 'visibility':
        dispatch('toggleVisibility', brochure.id);
        break;
      case 'rename':
        startEditing(e);
        break;
      case 'delete':
        dispatch('delete', brochure.id);
        break;
    }
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }
</script>

<article
  class="brochure-card"
  on:click={handleClick}
  on:keydown={handleKeyDown}
  role="button"
  tabindex="0"
  aria-label="View {brochure.name}"
>
  <!-- Thumbnail -->
  <div class="card-thumbnail">
    {#if brochure.thumbnailUrl}
      <img src={brochure.thumbnailUrl} alt="" />
    {:else}
      <div class="thumbnail-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    {/if}

    <!-- Visibility Badge -->
    <span class="visibility-badge" class:public={brochure.visibility === 'public'}>
      {brochure.visibility === 'public' ? 'Public' : 'Private'}
    </span>
  </div>

  <!-- Card Content -->
  <div class="card-content">
    {#if isEditing}
      <input
        type="text"
        bind:value={editName}
        on:keydown={handleEditKeyDown}
        on:blur={saveEdit}
        on:click|stopPropagation
        class="edit-input"
        autofocus
      />
    {:else}
      <h3 class="card-title">{brochure.name}</h3>
    {/if}

    <div class="card-meta">
      <span class="view-count">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {brochure.viewCount}
      </span>
      <span class="date">{formatDate(brochure.updatedAt)}</span>
    </div>
  </div>

  <!-- Actions Menu -->
  <div class="card-actions">
    <button
      class="menu-btn"
      on:click={toggleMenu}
      aria-label="More options"
      aria-expanded={showMenu}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    </button>

    {#if showMenu}
      <div class="menu-dropdown">
        <button on:click={(e) => handleMenuAction('edit', e)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Arrangement
        </button>
        <button on:click={(e) => handleMenuAction('share', e)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
        <button on:click={(e) => handleMenuAction('visibility', e)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            {#if brochure.visibility === 'public'}
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            {:else}
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            {/if}
          </svg>
          Make {brochure.visibility === 'public' ? 'Private' : 'Public'}
        </button>
        <button on:click={(e) => handleMenuAction('rename', e)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Rename
        </button>
        <hr />
        <button class="danger" on:click={(e) => handleMenuAction('delete', e)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Delete
        </button>
      </div>
    {/if}
  </div>
</article>

<style>
  .brochure-card {
    position: relative;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    overflow: hidden;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .brochure-card:hover {
    border-color: var(--color-border-hover);
    transform: scale(1.02);
    box-shadow: var(--shadow-lg);
  }

  .brochure-card:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .card-thumbnail {
    position: relative;
    aspect-ratio: 4 / 3;
    background: var(--color-background-secondary);
  }

  .card-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumbnail-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-tertiary);
  }

  .visibility-badge {
    position: absolute;
    top: var(--space-2);
    left: var(--space-2);
    padding: var(--space-1) var(--space-2);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    border-radius: var(--radius-full);
    background: rgba(0, 0, 0, 0.6);
    color: white;
  }

  .visibility-badge.public {
    background: var(--color-success, #10b981);
  }

  .card-content {
    padding: var(--space-4);
  }

  .card-title {
    margin: 0 0 var(--space-2) 0;
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .edit-input {
    width: 100%;
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    margin-bottom: var(--space-2);
  }

  .card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
  }

  .view-count {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .card-actions {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
  }

  .menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.9);
    border: none;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: all var(--transition-fast);
  }

  .menu-btn:hover {
    background: white;
    color: var(--color-text);
  }

  .menu-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: var(--space-1);
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    min-width: 180px;
    z-index: 10;
    overflow: hidden;
  }

  .menu-dropdown button {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-3) var(--space-4);
    border: none;
    background: none;
    font-size: var(--text-sm);
    color: var(--color-text);
    cursor: pointer;
    text-align: left;
    transition: background var(--transition-fast);
  }

  .menu-dropdown button:hover {
    background: var(--color-background-secondary);
  }

  .menu-dropdown button.danger {
    color: var(--color-error);
  }

  .menu-dropdown button.danger:hover {
    background: var(--color-error-bg, #fef2f2);
  }

  .menu-dropdown hr {
    margin: 0;
    border: none;
    border-top: 1px solid var(--color-border);
  }
</style>
