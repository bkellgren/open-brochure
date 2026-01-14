<script lang="ts">
  export let message = 'This brochure is no longer available';
  export let submessage = 'The brochure may have been deleted or made private by its owner.';
</script>

<div class="unavailable-container">
  <div class="unavailable-content">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
    <h1 class="title">{message}</h1>
    <p class="description">{submessage}</p>
    <a href="/" class="link">
      Create your own brochure
    </a>
  </div>
</div>

<style>
  .unavailable-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4, 1rem);
    background: var(--color-background, #ffffff);
  }

  .unavailable-content {
    text-align: center;
    max-width: 400px;
  }

  .icon {
    color: var(--color-text-tertiary, #9ca3af);
    margin-bottom: var(--space-6, 1.5rem);
  }

  .title {
    font-size: var(--text-xl, 1.25rem);
    font-weight: var(--font-semibold, 600);
    color: var(--color-text, #111827);
    margin: 0 0 var(--space-2, 0.5rem);
  }

  .description {
    font-size: var(--text-base, 1rem);
    color: var(--color-text-secondary, #6b7280);
    margin: 0 0 var(--space-6, 1.5rem);
    line-height: 1.5;
  }

  .link {
    display: inline-block;
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    background: var(--color-primary, #3b82f6);
    color: white;
    border-radius: var(--radius-lg, 0.5rem);
    text-decoration: none;
    font-weight: var(--font-medium, 500);
    transition: opacity 0.2s;
  }

  .link:hover {
    opacity: 0.9;
  }

  .link:focus-visible {
    outline: 2px solid var(--color-primary, #3b82f6);
    outline-offset: 2px;
  }
</style>
