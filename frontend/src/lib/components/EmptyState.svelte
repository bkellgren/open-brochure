<script lang="ts">
  export let title = "Your brochures will appear here";
  export let description = "Upload your first brochure to get started";
  export let actionLabel = "Upload a Brochure";
  export let actionHref = "/upload";
  export let showAction = true;
</script>

<div class="empty-state fade-in">
  <div class="empty-illustration">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="120"
      height="120"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  </div>

  <h3 class="empty-title">{title}</h3>
  <p class="empty-description">{description}</p>

  {#if showAction}
    <a href={actionHref} class="btn btn-primary">
      {actionLabel}
    </a>
  {/if}
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-16) var(--space-4);
    max-width: 400px;
    margin: 0 auto;
  }

  .empty-illustration {
    color: var(--color-border);
    margin-bottom: var(--space-6);
  }

  .empty-title {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-2);
  }

  .empty-description {
    font-size: var(--text-base);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-6);
  }
</style>
