# Research: Brochure Viewer

**Date**: 2025-01-12
**Branch**: `001-brochure-viewer`
**App Name**: Open Brochure | **Domain**: openbrochure.com

## Executive Summary

This document captures technology decisions for the Open Brochure application.
Key constraints from the constitution and spec drove all decisions:
- Bundle size < 200KB gzipped
- 30+ FPS on mobile devices
- < 3 second initial load on 3G
- Social auth (Google, Apple, Microsoft)
- 25MB file upload support
- CDN delivery for embeds
- Free forever business model (no artificial limits)

---

## Decision 1: Custom Tri-Fold Viewer Animation

### Decision: **Custom CSS 3D Transforms with Svelte Transitions**

### Rationale (Updated 2026-01-13)
The spec clarification session (2026-01-13) established that the viewer should use realistic unfold animations mimicking a physical tri-fold brochure, NOT page-flip animations. This requires a custom implementation:

1. **CSS 3D transforms**: Hardware-accelerated via GPU, achieving 60 FPS desktop / 30+ FPS mobile
2. **Minimal bundle**: ~2-10KB custom code vs 30-50KB for page-flip library
3. **Precise control**: 5 distinct fold states specific to tri-fold geometry
4. **Off-thread animation**: CSS animations run via OMTA (Off-Main-Thread Animation)
5. **Svelte integration**: Built-in transitions compose naturally with reactive state

### 5 Fold States
```
State 0: Folded (Cover visible) - initial state
State 1: Back panel revealed (flip brochure over)
State 2: Partial unfold left (left panel extends)
State 3: Partial unfold right (right panel extends)
State 4: Fully open (all inside panels visible)
```

### Implementation Approach
```typescript
// CSS 3D perspective container
.brochure-viewer {
  perspective: 800px;
  perspective-origin: 50% 50%;
}

// Panel with transform for fold
.panel {
  transform-style: preserve-3d;
  transform-origin: left center; // or right center for opposite fold
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  backface-visibility: hidden;
}

// Fold states
.panel.state-closed { transform: rotateY(0deg); }
.panel.state-folding { transform: rotateY(-90deg); }
.panel.state-open { transform: rotateY(-180deg); }
```

### Shadow/Lighting Effects
- Use opacity-animated pseudo-elements instead of animating box-shadow directly
- Gradient overlays at fold edges for self-shadowing effect
- Hue-matched shadows (reduce saturation/lightness of background color)

### Touch Gesture Handling
- Vanilla JavaScript with passive event listeners
- Swipe threshold: 150px minimum distance
- Support both discrete swipes and continuous drag-to-fold

### Alternatives Considered

| Approach | Bundle Size | Mobile FPS | Rejected Because |
|---------|-------------|------------|------------------|
| page-flip (StPageFlip) | 30-50KB | 30+ | Designed for page-flip, not tri-fold unfold |
| Three.js | 168KB gzip | 30+ | Too large, overkill for 2.5D fold effect |
| GSAP | ~45KB | 60 | Adds dependency for features CSS provides |
| CSS 3D Custom | 2-10KB | 30+ | **SELECTED**: Best fit for tri-fold geometry |

**Note**: The page-flip library remains in package.json from initial setup but will not be used for the tri-fold viewer. It may be removed during implementation cleanup.

---

## Decision 2: Frontend Framework

### Decision: **SvelteKit**

### Rationale
1. **Bundle size excellence**: 30-100KB total app achievable—comfortably under 200KB budget
2. **Svelte core**: Only 1.6KB gzipped (vs React 40KB, Vue 22KB)
3. **SSR performance**: Fastest hydration times (~25ms) enables <3s load on 3G
4. **3D integration**: Threlte library provides excellent Three.js/WebGL integration
5. **Service workers**: Standard Vite PWA integration for offline support
6. **TypeScript**: First-class support throughout
7. **Compiler approach**: Reactive 3D updates highly efficient
8. **Developer experience**: Minimal configuration, elegant syntax

### Alternatives Considered

| Framework | Bundle Size | SSR | 3D Integration | Rejected Because |
|-----------|-------------|-----|----------------|------------------|
| Next.js | 150-250KB | Excellent | Excellent | Bundle size 60% larger than SvelteKit |
| Nuxt | 80-160KB | Excellent | Good | Equally capable but larger than SvelteKit |
| Astro | 10-50KB | Excellent | Poor | Islands architecture adds complexity for 3D viewer |
| Solid Start | 50-120KB | Good | Good | Less mature ecosystem, smaller community |

### Implementation Notes
```bash
npm create svelte@latest frontend
# Select: SvelteKit, TypeScript, Playwright
```

Key packages:
- `@threlte/core` - Svelte 3D integration
- `@sveltejs/adapter-node` - SSR deployment
- `vite-plugin-pwa` - Service worker support

---

## Decision 3: Backend Framework

### Decision: **Fastify**

### Rationale
1. **File uploads**: `@fastify/multipart` optimized for streaming, handles 25MB with backpressure
2. **Performance**: 2-3x faster than Express under load—important for responsive API
3. **Social auth**: Official `@fastify/oauth2` plugin with mature OAuth strategies
4. **TypeScript**: Excellent type safety with decorators
5. **Plugin architecture**: Modular scaling from MVP to enterprise
6. **Memory efficiency**: Lower footprint than Express/NestJS

### Alternatives Considered

| Framework | Performance | Auth Integration | Rejected Because |
|-----------|-------------|------------------|------------------|
| Express | Baseline | Excellent (Passport) | 2-3x slower, callback-based |
| Hono | Excellent | Good | Less mature auth ecosystem |
| NestJS | Good | Excellent | Over-engineered for this project size |

### Implementation Notes
```bash
npm install fastify @fastify/multipart @fastify/oauth2 @fastify/cors
```

---

## Decision 4: Database

### Decision: **Supabase (PostgreSQL)** for MVP → **Self-hosted PostgreSQL** at scale

### Rationale
1. **Built-in social auth**: Google, Apple, Microsoft OAuth pre-configured—saves days of work
2. **PostgreSQL backend**: Future-proof, migration to self-hosted is straightforward
3. **Integrated storage**: S3-compatible API reduces infrastructure complexity
4. **Cost**: ~$25/month Pro tier covers MVP needs
5. **Row-level security**: Built-in access control for brochures
6. **Library queries**: PostgreSQL handles 50+ brochures per user with indexed queries

### Alternatives Considered

| Database | Auth Integration | Scalability | Rejected Because |
|----------|------------------|-------------|------------------|
| SQLite | Works | Limited | Single-file locks on concurrent 25MB uploads |
| MongoDB | Works | Excellent | No compelling advantage over PostgreSQL |
| PlanetScale | Works | Excellent | Requires separate file storage, more infra |

### Migration Path
- **Months 0-6**: Supabase handles auth + database + storage
- **Months 6+**: If exceeding Pro tier, migrate to PostgreSQL + separate auth

---

## Decision 5: File Storage

### Decision: **Cloudflare R2**

### Rationale
1. **Zero egress charges**: Critical for embed delivery—S3 would cost $0.09/GB
2. **S3-compatible**: Drop-in replacement, same SDK works
3. **Cost**: 33% cheaper storage than S3 ($0.015/GB vs $0.023/GB)
4. **CDN integration**: Built-in Cloudflare edge network
5. **Performance**: 30ms latency improvements over origin fetches

### Cost Comparison (100 users, 50 brochures each, embed-heavy)
| Service | Storage (50GB) | Transfer (100GB) | Total/Month |
|---------|----------------|------------------|-------------|
| AWS S3 | $1.15 | $9.00 | $10.15 |
| Cloudflare R2 | $0.75 | $0.00 | $0.75 |

**Savings: $113/year** at modest scale, scales linearly with embed views.

### Implementation Notes
```typescript
// S3-compatible SDK works directly
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: 'https://<account-id>.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});
```

---

## Decision 6: Panel Detection Approach

### Decision: **Client-side image processing with Canvas API + optional server fallback**

### Rationale
1. **No server compute costs**: Panel detection happens in browser
2. **Instant feedback**: User sees detected panels immediately
3. **Simple algorithm**: Tri-fold has predictable 3-column or 2-row structure
4. **Fallback**: Server-side Sharp/PDF.js for complex PDFs

### Approach
1. **Images (JPG/PNG)**: Canvas API to slice into 6 equal panels (3x2 grid)
2. **PDFs**: PDF.js to render pages, then apply same slicing
3. **User adjustment**: If auto-detection is wrong, user can manually adjust boundaries
4. **Edge cases**: Single images assigned to one panel, others left as placeholders

### Implementation Notes
```typescript
// Client-side panel detection
async function detectPanels(imageUrl: string): Promise<Panel[]> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = await loadImage(imageUrl);

  // Standard tri-fold: 3 columns, 2 rows (front/back)
  const panelWidth = img.width / 3;
  const panelHeight = img.height / 2; // if 2-page PDF

  // Extract 6 panels
  return [
    extractPanel(ctx, img, 0, 0, panelWidth, panelHeight, 'cover'),
    extractPanel(ctx, img, panelWidth, 0, panelWidth, panelHeight, 'back'),
    // ... etc for all 6 positions
  ];
}
```

---

## Decision 7: Authentication Strategy

### Decision: **Supabase Auth** for MVP → **Passport.js** at scale

### Rationale
1. **Zero setup**: Supabase Auth includes Google, Apple, Microsoft providers
2. **Session management**: Built-in JWT handling, refresh tokens
3. **Row-level security**: Integrates with database access control
4. **Cost**: Included in Supabase tier

### Implementation Notes
```typescript
// Supabase social auth (client-side)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google', // or 'apple', 'azure' (Microsoft)
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});

// Server-side session verification
const { data: { user } } = await supabase.auth.getUser(token);
```

### Microsoft Setup Note
Microsoft uses Azure AD provider in Supabase, configured as:
```typescript
provider: 'azure' // Not 'microsoft'
```

---

## Decision 8: QR Code Generation

### Decision: **Client-side generation with qrcode library**

### Rationale
1. **No server load**: QR codes generated entirely in browser
2. **Instant**: No API call needed, immediate rendering
3. **Small bundle**: qrcode library is ~15KB gzipped
4. **Customizable**: Can match brand colors if needed later
5. **Downloadable**: Canvas-based output easily converted to PNG

### Alternatives Considered

| Approach | Latency | Server Load | Rejected Because |
|----------|---------|-------------|------------------|
| Server-side (Sharp) | ~200ms | Yes | Unnecessary server round-trip |
| External API | ~500ms | No | Third-party dependency, latency |
| SVG inline | Instant | No | Harder to download as image |

### Implementation Notes
```typescript
import QRCode from 'qrcode';

// Generate QR code as data URL
async function generateQRCode(shareUrl: string): Promise<string> {
  return QRCode.toDataURL(shareUrl, {
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

// Download as PNG
function downloadQRCode(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = `${filename}-qr.png`;
  link.href = dataUrl;
  link.click();
}
```

---

## Decision 9: View Analytics

### Decision: **Database-level tracking with owner exclusion**

### Rationale
1. **Simple implementation**: Counter column on brochures table
2. **Efficient**: Single atomic increment per view
3. **Owner exclusion**: Compare request user ID with brochure owner
4. **Privacy-friendly**: No detailed tracking, just counts

### Approach
1. **Increment on view**: When `/view/{shareToken}` or embed loads
2. **Skip owner**: If authenticated user matches brochure.user_id, don't increment
3. **Anonymous views**: Always count (no user to compare)
4. **Rate limiting**: Optional: dedupe by IP within 5-minute window

### Implementation Notes
```sql
-- Add view_count column to brochures
ALTER TABLE public.brochures ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;

-- Atomic increment (in API handler)
UPDATE brochures
SET view_count = view_count + 1
WHERE id = $1
AND (user_id IS NULL OR user_id != $2);
```

```typescript
// API endpoint
async function trackView(brochureId: string, viewerId?: string) {
  const brochure = await getBrochure(brochureId);

  // Skip if viewer is owner
  if (viewerId && viewerId === brochure.userId) {
    return;
  }

  await db.query(
    'UPDATE brochures SET view_count = view_count + 1 WHERE id = $1',
    [brochureId]
  );
}
```

---

## Decision 10: Mockup PDF Generation

### Decision: **Client-side canvas capture + jsPDF**

### Rationale
1. **No server infrastructure**: All rendering happens in browser
2. **Leverages existing viewer**: Capture 3D viewer at different states
3. **Small bundle**: jsPDF is ~25KB gzipped
4. **Instant download**: No upload/download round-trip
5. **High quality**: Canvas captures at device resolution

### Approach
1. **Capture views**: Use html2canvas to capture 3D viewer in different states:
   - Folded closed (cover visible)
   - Partially open (showing fold)
   - Fully open (all inside panels)
2. **Generate PDF**: Combine captures into single PDF with jsPDF
3. **Add branding**: Include "Created with Open Brochure" footer

### Alternatives Considered

| Approach | Quality | Server Load | Rejected Because |
|----------|---------|-------------|------------------|
| Puppeteer server-side | High | Heavy | Server infrastructure, cost |
| Pre-rendered templates | Medium | None | Less realistic, generic |
| Three.js server render | High | Heavy | Complex setup, overkill |

### Implementation Notes
```typescript
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

async function generateMockupPDF(viewerElement: HTMLElement): Promise<Blob> {
  const pdf = new jsPDF('landscape', 'mm', 'a4');

  // Capture folded view
  setViewerState('folded');
  const foldedCanvas = await html2canvas(viewerElement);
  pdf.addImage(foldedCanvas.toDataURL(), 'PNG', 10, 10, 277, 150);

  // Capture partially open
  pdf.addPage();
  setViewerState('partial');
  const partialCanvas = await html2canvas(viewerElement);
  pdf.addImage(partialCanvas.toDataURL(), 'PNG', 10, 10, 277, 150);

  // Capture fully open
  pdf.addPage();
  setViewerState('open');
  const openCanvas = await html2canvas(viewerElement);
  pdf.addImage(openCanvas.toDataURL(), 'PNG', 10, 10, 277, 150);

  // Footer
  pdf.setFontSize(10);
  pdf.text('Created with Open Brochure - openbrochure.com', 10, 200);

  return pdf.output('blob');
}
```

---

## Final Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  SvelteKit + TypeScript + StPageFlip + qrcode + jsPDF       │
│  Bundle target: <150KB gzipped                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  Fastify + TypeScript + @fastify/multipart                  │
│  Deployed on: Vercel / Render / Railway                      │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│       SUPABASE          │     │      CLOUDFLARE R2          │
│  PostgreSQL + Auth      │     │  File storage + CDN         │
│  ~$25/month             │     │  ~$5/month (scales w/usage) │
└─────────────────────────┘     └─────────────────────────────┘
```

---

## Cost Projection (Year 1)

| Phase | Users | Supabase | R2 | Hosting | Total/Month |
|-------|-------|----------|-----|---------|-------------|
| MVP | 100 | $25 | $5 | $0 (free tier) | **$30** |
| Growth | 500 | $25 | $20 | $20 | **$65** |
| Scale | 2000 | $75 | $50 | $50 | **$175** |

**Note**: Free forever model means no revenue at these phases. Premium features
(e.g., custom branding, advanced analytics) can be introduced later.

---

## Bundle Size Budget (Updated 2026-01-13)

| Component | Size (gzip) | Notes |
|-----------|-------------|-------|
| Svelte runtime | 1.6KB | Core framework |
| SvelteKit | ~20KB | Routing, SSR hydration |
| Custom tri-fold viewer | ~5-10KB | CSS 3D transforms + Svelte transitions |
| qrcode | ~15KB | QR code generation |
| Supabase client | ~35KB | Auth + database client |
| App code | ~30KB | Components, routes, utilities |
| **Total (initial)** | **~105KB** | Well under 200KB budget |
| jsPDF | ~25KB | PDF generation (lazy loaded) |
| html2canvas | ~40KB | Canvas capture (lazy loaded) |
| pdf.js | ~200KB | PDF parsing (lazy loaded) |
| **Total (with lazy)** | **~370KB** | Loaded on demand |

Lazy loading strategy:
- pdf.js only loaded when user uploads a PDF
- html2canvas + jsPDF only loaded when user requests mockup download

**Note**: The page-flip library (30-50KB) was removed from initial bundle since we're using custom CSS 3D transforms instead. This saves ~30KB from initial load.

---

## Decision 11: pdfjs-dist Bundle Optimization

**Updated: 2026-01-13**

### Decision: Dynamic import with manual chunk splitting; CDN worker

### Rationale
- pdfjs-dist is ~253KB gzipped - too large for initial bundle
- Only needed for PDF uploads, not viewing processed brochures
- Dynamic import ensures zero impact on initial page load

### Implementation Details

**Dynamic Import Pattern:**
```typescript
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

export async function loadPdfLibrary() {
  if (pdfjsLib) return pdfjsLib;

  pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  return pdfjsLib;
}
```

**Vite Configuration:**
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('pdfjs-dist')) return 'pdfjs';
      }
    }
  }
},
optimizeDeps: {
  exclude: ['pdfjs-dist']
}
```

**Worker Options (in order of preference):**
1. CDN (unpkg/jsDelivr) - zero config, version-matched
2. Copy to `/static/` folder - production reliability
3. Vite URL import - `import worker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'`

**Bundle Size Targets:**
- Main bundle (excluding pdfjs): ~80-145KB gzipped
- pdfjs chunk (loaded on-demand): ~253KB gzipped
- Total under 200KB gzipped for initial load: Achievable

---

## Decision 12: Service Worker Offline Caching

**Updated: 2026-01-13**

### Decision: @vite-pwa/sveltekit with Workbox; hybrid Cache API + IndexedDB

### Rationale
- @vite-pwa/sveltekit provides sensible SvelteKit defaults
- Workbox strategies well-tested for image-heavy content
- Hybrid approach leverages strengths of each storage mechanism

### Implementation Details

**Plugin Setup:**
```typescript
// vite.config.ts
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

plugins: [
  sveltekit(),
  SvelteKitPWA({
    strategies: 'generateSW',
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['client/**/*.{js,css,ico,png,svg,webp}'],
      runtimeCaching: [/* see caching strategies */]
    }
  })
]
```

**Caching Strategy by Content Type:**

| Content | Strategy | Cache Name | TTL |
|---------|----------|------------|-----|
| App shell (JS/CSS) | Precache | `build-cache` | Version-based |
| Panel images | Cache-First | `brochure-images` | 30 days, max 200 entries |
| API reads | Network-First | `api-cache` | 24 hours, max 50 entries |
| Uploads | Network-Only | - | No caching |

**Storage by Data Type:**
- **Cache API**: Images, app shell, static assets (URL-addressable)
- **IndexedDB**: Brochure metadata, panel arrangement, sync status (structured, queryable)

**Offline Behavior:**
- View cached brochures: Works offline
- Upload new brochures: Requires network (queued for sync)
- Edit arrangement: Cached locally, synced when online

---

## Decision 13: Accessibility for 3D Viewer

**Updated: 2026-01-13**

### Decision: Carousel accessibility patterns + ARIA live regions for state announcements

### Rationale
- Carousel pattern well-established (W3C APG)
- Live regions enable non-visual state awareness
- Canvas content requires explicit text alternatives

### Implementation Details

**Component Structure:**
```html
<section
  role="region"
  aria-roledescription="interactive brochure viewer"
  aria-label="Tri-fold brochure"
  aria-describedby="viewer-instructions">

  <!-- Instructions (visually hidden) -->
  <p id="viewer-instructions" class="visually-hidden">
    Use left and right arrow keys to unfold. Press Enter for descriptions.
  </p>

  <!-- Navigation controls -->
  <button aria-label="Previous view" aria-disabled="true">...</button>
  <button aria-label="Next view" aria-disabled="false">...</button>

  <!-- Viewer content -->
  <div role="group" aria-roledescription="view" aria-label="Front cover, 1 of 5 views" tabindex="0">
    <canvas role="img" aria-labelledby="panel-label" aria-describedby="panel-desc"></canvas>
  </div>

  <!-- Dynamic text alternatives -->
  <span id="panel-label" class="visually-hidden">Front cover</span>
  <div id="panel-desc" class="visually-hidden">Company logo in upper left...</div>

  <!-- Live region for announcements -->
  <div role="status" aria-live="polite" aria-atomic="true" class="visually-hidden"></div>
</section>
```

**Keyboard Navigation:**
| Key | Action |
|-----|--------|
| `←` / `→` | Previous/next state |
| `Home` / `End` | First/last state |
| `Enter` / `Space` | Announce current panel |
| `Escape` | Reset to folded |

**State Announcements:**
```javascript
const announcements = {
  folded: "Brochure folded, showing front cover. Use right arrow to unfold.",
  back: "Back panel. 2 of 5 views.",
  partialLeft: "Left panel revealed. 3 of 5 views.",
  partialRight: "Right panel revealed. 4 of 5 views.",
  fullyOpen: "Fully open, all panels visible. 5 of 5 views."
};
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  .panel {
    transition-duration: 0.01ms !important;
  }
}
```

---

## CSS 3D Transform Implementation Details

**Updated: 2026-01-13**

### Perspective and Transform-Origin

**Container Perspective:**
```css
.brochure-container {
  perspective: 1500px;
  perspective-origin: 50% 50%;
}
```

**Panel Transform Origins (for fold edge pivoting):**
```css
.panel-left { transform-origin: right center; }  /* Pivots on right edge */
.panel-center { transform-origin: center center; }
.panel-right { transform-origin: left center; }  /* Pivots on left edge */
```

### 5 State Transitions

| State | Left Panel | Right Panel |
|-------|------------|-------------|
| Folded (Cover) | `rotateY(-180deg)` | `rotateY(180deg)` |
| Back View | Container `rotateY(180deg)` | - |
| Partial Left | `rotateY(-90deg)` | `rotateY(180deg)` |
| Partial Right | `rotateY(-180deg)` | `rotateY(90deg)` |
| Fully Open | `rotateY(0deg)` | `rotateY(0deg)` |

### Dynamic Shadows

- Use pseudo-element overlays with gradient backgrounds
- Shadow intensity calculated from rotation angle: `opacity = sin(angleRadians)`
- Peaks at 90° rotation, fades at 0° and 180°
- Animate opacity (GPU-accelerated), not box-shadow

### Animation Performance

```css
.panel {
  transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: transform;
  backface-visibility: hidden;
  transform-style: preserve-3d;
}
```

**Browser Compatibility:** 97%+ support across latest 2 versions of Chrome, Firefox, Safari, Edge. No vendor prefixes required.

---

## Resolved Open Items

1. **Service worker strategy**: Use @vite-pwa/sveltekit with Cache-First for images, Network-First for API
2. **Accessibility testing**: Use carousel pattern with ARIA live regions and keyboard navigation
3. **pdfjs bundle**: Dynamic import with manual chunk splitting keeps initial bundle under 200KB

## Remaining Open Items

1. **Apple Sign-In**: Requires Apple Developer account setup
2. **Microsoft Sign-In**: Requires Azure AD app registration (uses 'azure' provider in Supabase)
3. **Embed CSP headers**: Configure route-specific Content-Security-Policy for /embed/:id
