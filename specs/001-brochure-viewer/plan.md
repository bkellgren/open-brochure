# Implementation Plan: Brochure Viewer

**Branch**: `001-brochure-viewer` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-brochure-viewer/spec.md`

## Summary

Build the core interactive tri-fold brochure viewer - a web application that allows users to upload PDF/image brochures, have the system detect and extract 6 panels, arrange them in a custom panel editor, and view them in an immersive 3D viewer with realistic unfold animations. Users can save brochures to a personal library, share via links/QR codes/embeds, download originals and mockup PDFs, and track view analytics.

**Technical Approach**: SvelteKit frontend with CSS 3D transforms for the custom viewer, Fastify API backend, Supabase for auth/database/storage, and Sharp for server-side image processing.

## Technical Context

**Language/Version**: TypeScript 5.3.x (frontend + backend)
**Primary Dependencies**:
- Frontend: SvelteKit 2.x, Svelte 4.x, Vite 5.x, html2canvas, jspdf, qrcode, pdfjs-dist
- Backend: Fastify 4.x, Sharp 0.34.x, @aws-sdk/client-s3, nanoid
- Shared: @supabase/supabase-js 2.x

**Storage**: Supabase (PostgreSQL with RLS) + Supabase Storage (S3-compatible, 25MB limit)
**Testing**:
- Unit/Integration: Vitest 1.x (frontend + backend)
- E2E: Playwright 1.x
- Accessibility: axe-core via Vitest

**Target Platform**: Web - Modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions), iOS Safari, Android Chrome
**Project Type**: Web application (monorepo with frontend + backend + shared)
**Performance Goals**:
- Initial load < 3s on 3G
- Viewer animations 30+ FPS
- Interactions < 100ms response
- JS bundle < 200KB gzipped

**Constraints**:
- Upload limit 25MB
- Offline viewing for cached brochures
- No runtime external dependencies (except analytics)
- WCAG 2.1 AA accessibility compliance

**Scale/Scope**: Free tier with unlimited brochures per user, target 50+ brochures per library without degradation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Simplicity

| Requirement | Compliance | Notes |
|-------------|------------|-------|
| Minimum interaction steps | ✅ PASS | Upload → Arrange → View is 3 steps; editing is 2 steps |
| Self-explanatory interface | ✅ PASS | Panel labels use friendly names (Cover, Back, etc.); helpful empty states guide first use |
| Cognitive load proportional to value | ✅ PASS | Micro-animations add polish without complexity; viewer controls are minimal (Share + Fullscreen only) |
| When in doubt, leave it out | ✅ PASS | No in-app design tools; no complex analytics; free forever model avoids paywall complexity |

### II. Responsive Design

| Requirement | Compliance | Notes |
|-------------|------------|-------|
| Fluid layouts 320px-1920px+ | ✅ PASS | FR-062 requires 320px-1920px+; viewer adapts to screen (FR-020) |
| Touch and pointer first-class | ✅ PASS | Desktop: click/scroll (FR-017); Mobile: swipe/pinch (FR-018); touch-friendly arrangement (FR-014) |
| No horizontal scroll | ✅ PASS | Panel aspect ratio ~4:3 landscape fully open fits standard viewports |
| Critical features on small screens | ✅ PASS | FR-062 ensures all controls accessible; FR-014 ensures mobile arrangement works |

### III. Accessibility

| Requirement | Compliance | Notes |
|-------------|------------|-------|
| Keyboard navigable with focus indicators | ✅ PASS | FR-061 requires keyboard navigation for all controls |
| Text alternatives for images | ⚠️ NEEDS DESIGN | Panel images need alt text strategy; viewer needs ARIA labels |
| Color not sole information carrier | ✅ PASS | UI uses labels + icons, not color coding |
| Screen reader compatibility | ⚠️ NEEDS DESIGN | Viewer state changes need ARIA announcements |
| Logical focus order | ✅ PASS | Standard component flow; arrangement editor needs focus trap |

### Technical Constraints

| Constraint | Compliance | Notes |
|------------|------------|-------|
| Target browsers (latest 2) | ✅ PASS | Svelte 4 + Vite 5 targets modern browsers; CSS 3D transforms widely supported |
| Initial load < 3s on 3G | ⚠️ NEEDS DESIGN | Bundle splitting strategy needed; lazy load viewer components |
| Bundle < 200KB gzipped | ⚠️ NEEDS DESIGN | pdfjs-dist is large (~500KB); needs dynamic import strategy |
| Offline viewing | ⚠️ NEEDS DESIGN | Service worker caching strategy needed |
| No external runtime deps | ✅ PASS | All processing client/server-side; no third-party APIs |

### Pre-Design Gate Result: ✅ PASS WITH CONDITIONS

Conditions to resolve in Phase 0/1:
1. Accessibility: Define ARIA strategy for viewer and panel arrangement
2. Performance: Bundle splitting strategy for pdfjs-dist and viewer
3. Offline: Service worker caching approach

## Project Structure

### Documentation (this feature)

```text
specs/001-brochure-viewer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── index.ts                 # Fastify app entry
│   ├── lib/
│   │   └── supabase.ts          # Supabase client
│   ├── middleware/
│   │   ├── auth.ts              # JWT validation
│   │   ├── error.ts             # Error handling
│   │   └── validate.ts          # Request validation
│   └── routes/
│       ├── auth.ts              # OAuth callbacks
│       ├── brochures.ts         # CRUD operations
│       ├── upload.ts            # Presigned URLs, processing
│       ├── share.ts             # Share links, QR codes
│       └── embed.ts             # Embed code generation
└── tests/

frontend/
├── src/
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client
│   │   ├── utils/
│   │   │   └── validation.ts    # Client-side validation
│   │   ├── services/
│   │   │   └── panelDetection.ts # Panel extraction logic
│   │   └── transitions/
│   │       └── fade.ts          # Animation utilities
│   ├── components/              # Reusable UI components
│   │   ├── viewer/              # 3D viewer components
│   │   │   ├── TriFoldViewer.svelte
│   │   │   ├── Panel.svelte
│   │   │   └── ViewerControls.svelte
│   │   ├── arrangement/         # Panel arrangement editor
│   │   │   ├── ArrangementEditor.svelte
│   │   │   └── DraggablePanel.svelte
│   │   ├── library/             # Library components
│   │   │   ├── BrochureGrid.svelte
│   │   │   └── BrochureCard.svelte
│   │   └── common/              # Shared components
│   │       ├── Toast.svelte
│   │       ├── EmptyState.svelte
│   │       └── FileUpload.svelte
│   └── routes/                  # SvelteKit pages
│       ├── +page.svelte         # Landing/upload
│       ├── +layout.svelte       # App shell
│       ├── library/
│       │   └── +page.svelte
│       ├── brochure/
│       │   └── [id]/
│       │       ├── +page.svelte # Viewer
│       │       └── arrange/
│       │           └── +page.svelte
│       ├── share/
│       │   └── [token]/
│       │       └── +page.svelte # Public view
│       └── embed/
│           └── [token]/
│               └── +page.svelte # Iframe viewer
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/

shared/
├── types/
│   ├── models.ts               # Domain entities
│   ├── api.ts                  # Request/response types
│   ├── errors.ts               # Error types
│   └── index.ts                # Re-exports
├── constants/
│   └── index.ts                # Shared constants
└── index.ts

supabase/
├── config.toml                 # Local dev config
├── migrations/                 # SQL migrations
│   └── 001_initial_schema.sql
└── seed.sql                    # Test data
```

**Structure Decision**: Web application with monorepo structure. Frontend (SvelteKit) and Backend (Fastify) as separate workspace packages with shared types package. Supabase handles database, auth, and storage.

## Complexity Tracking

No constitution violations requiring justification. The architecture uses:
- Standard monorepo pattern (frontend/backend/shared) - matches project type
- Supabase for auth/storage - reduces custom infrastructure
- CSS 3D transforms - native browser capability, no heavy libraries

All complexity is proportional to requirements (3D viewer, social auth, file processing).

---

## Post-Design Constitution Check

*Re-evaluated after Phase 1 design completion (2026-01-13)*

### III. Accessibility (Previously NEEDS DESIGN - Now Resolved)

| Requirement | Compliance | Resolution |
|-------------|------------|------------|
| Text alternatives for images | ✅ PASS | Dynamic `aria-labelledby` + `aria-describedby` updated per viewer state (see research.md Decision 13) |
| Screen reader compatibility | ✅ PASS | ARIA live region with `role="status"` announces state transitions; carousel keyboard pattern implemented |

### Technical Constraints (Previously NEEDS DESIGN - Now Resolved)

| Constraint | Compliance | Resolution |
|------------|------------|------------|
| Initial load < 3s on 3G | ✅ PASS | Dynamic import of pdfjs-dist; main bundle ~105KB gzipped well under 200KB |
| Bundle < 200KB gzipped | ✅ PASS | pdfjs-dist isolated to lazy-loaded chunk; only loaded on PDF upload (see research.md Decision 11) |
| Offline viewing | ✅ PASS | @vite-pwa/sveltekit with Cache-First for images, Network-First for API; IndexedDB for metadata (see research.md Decision 12) |

### Post-Design Gate Result: ✅ PASS

All pre-design conditions have been resolved:
1. **Accessibility**: ARIA strategy defined with carousel pattern, live regions, and dynamic alt text
2. **Performance**: Bundle splitting via Vite manualChunks with dynamic imports
3. **Offline**: @vite-pwa/sveltekit with hybrid Cache API + IndexedDB storage

No additional complexity or constitution violations introduced during design phase.
