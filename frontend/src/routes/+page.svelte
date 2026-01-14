<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth';
</script>

<svelte:head>
  <title>Open Brochure - Interactive 3D Tri-fold Viewer</title>
</svelte:head>

<div class="hero container fade-in">
  <div class="hero-content">
    <h1 class="hero-title">
      Turn your brochures into
      <span class="hero-highlight">interactive experiences</span>
    </h1>
    <p class="hero-description">
      Upload your tri-fold brochure and watch it come to life with realistic
      3D unfold animations. Share, embed, and download mockups—all for free.
    </p>
    <div class="hero-actions">
      <a href="/upload" class="btn btn-primary btn-lg">
        Upload a Brochure
      </a>
      {#if !$isAuthenticated}
        <a href="/login" class="btn btn-secondary btn-lg">
          Sign In
        </a>
      {/if}
    </div>
  </div>

  <div class="hero-visual">
    <div class="placeholder-viewer">
      <span>3D Viewer Preview</span>
    </div>
  </div>
</div>

<section class="features container">
  <h2 class="features-title">Everything you need</h2>
  <div class="features-grid">
    <div class="feature card">
      <div class="feature-icon">📤</div>
      <h3 class="feature-title">Upload</h3>
      <p class="feature-description">
        Drop your image or PDF and we'll detect the 6 panels automatically.
      </p>
    </div>
    <div class="feature card">
      <div class="feature-icon">🎯</div>
      <h3 class="feature-title">Arrange</h3>
      <p class="feature-description">
        Drag and drop panels to match your brochure's layout.
      </p>
    </div>
    <div class="feature card">
      <div class="feature-icon">📱</div>
      <h3 class="feature-title">View in 3D</h3>
      <p class="feature-description">
        Experience realistic unfold animations on any device.
      </p>
    </div>
    <div class="feature card">
      <div class="feature-icon">🔗</div>
      <h3 class="feature-title">Share</h3>
      <p class="feature-description">
        Generate shareable links and QR codes instantly.
      </p>
    </div>
  </div>
</section>

<style>
  .hero {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-12);
    padding: var(--space-12) 0;
    align-items: center;
  }

  @media (min-width: 768px) {
    .hero {
      grid-template-columns: 1fr 1fr;
      padding: var(--space-16) 0;
    }
  }

  .hero-title {
    font-size: var(--text-4xl);
    font-weight: var(--font-bold);
    line-height: 1.1;
    margin-bottom: var(--space-6);
  }

  .hero-highlight {
    color: var(--color-primary);
  }

  .hero-description {
    font-size: var(--text-lg);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-8);
    max-width: 500px;
  }

  .hero-actions {
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .btn-lg {
    padding: var(--space-4) var(--space-8);
    font-size: var(--text-base);
  }

  .hero-visual {
    display: flex;
    justify-content: center;
  }

  .placeholder-viewer {
    width: 100%;
    max-width: 400px;
    aspect-ratio: 4/3;
    background: var(--color-background-secondary);
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-tertiary);
    font-size: var(--text-sm);
  }

  .features {
    padding: var(--space-16) 0;
  }

  .features-title {
    text-align: center;
    margin-bottom: var(--space-12);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-6);
  }

  .feature {
    text-align: center;
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: var(--space-4);
  }

  .feature-title {
    font-size: var(--text-lg);
    margin-bottom: var(--space-2);
  }

  .feature-description {
    font-size: var(--text-sm);
  }
</style>
