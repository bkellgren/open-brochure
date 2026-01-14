# Tasks: Brochure Viewer

**Input**: Design documents from `/specs/001-brochure-viewer/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.yaml
**App Name**: Open Brochure | **Domain**: openbrochure.com

**Tests**: Not explicitly requested in specification. Tests can be added in a future iteration.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/` (Fastify API)
- **Frontend**: `frontend/src/` (SvelteKit app)
- **Shared**: `shared/` (TypeScript types)
- **Database**: `supabase/migrations/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create monorepo structure with backend/, frontend/, shared/ directories
- [ ] T002 [P] Initialize backend with Fastify + TypeScript in backend/package.json
- [ ] T003 [P] Initialize frontend with SvelteKit + TypeScript in frontend/package.json
- [ ] T004 [P] Create shared types package in shared/package.json
- [ ] T005 [P] Configure ESLint and Prettier for monorepo
- [ ] T006 [P] Create .env.example files for backend and frontend
- [ ] T007 [P] Initialize Supabase project with supabase init

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### Database Schema

- [ ] T008 Create users table migration in supabase/migrations/ (extends auth.users)
- [ ] T009 Create brochures table migration with view_count column in supabase/migrations/
- [ ] T010 Create panels table migration with position enum in supabase/migrations/
- [ ] T011 Create RLS policies for users, brochures, panels in supabase/migrations/
- [ ] T012 Create updated_at trigger function in supabase/migrations/
- [ ] T013 Create indexes for brochure_user_id, share_token, visibility in supabase/migrations/

### Shared Types

- [ ] T014 [P] Define Visibility, PanelPosition, AuthProvider types in shared/types/models.ts
- [ ] T015 [P] Define User, Brochure, Panel interfaces in shared/types/models.ts
- [ ] T016 [P] Define BrochureWithPanels, LibraryBrochure types in shared/types/models.ts
- [ ] T017 [P] Define API request/response types in shared/types/api.ts
- [ ] T018 [P] Define error types and codes in shared/types/errors.ts

### Backend Foundation

- [ ] T019 Configure Fastify server with CORS in backend/src/index.ts
- [ ] T020 [P] Create Supabase client initialization in backend/src/lib/supabase.ts
- [ ] T021 [P] Create R2 storage client in backend/src/lib/storage.ts
- [ ] T022 Create auth middleware for JWT validation in backend/src/middleware/auth.ts
- [ ] T023 [P] Create error handling middleware in backend/src/middleware/error.ts
- [ ] T024 [P] Create request validation middleware in backend/src/middleware/validate.ts
- [ ] T025 Create API route structure /api/v1/* in backend/src/routes/

### Frontend Foundation

- [ ] T026 Configure SvelteKit with TypeScript in frontend/svelte.config.js
- [ ] T027 [P] Create Supabase client initialization in frontend/src/lib/supabase.ts
- [ ] T028 [P] Create API client service in frontend/src/lib/api.ts
- [ ] T029 Create auth store for user state in frontend/src/lib/stores/auth.ts
- [ ] T030 [P] Create base layout with header in frontend/src/routes/+layout.svelte
- [ ] T031 [P] Configure design tokens (colors, spacing) in frontend/src/styles/tokens.css
- [ ] T032 [P] Create global styles with modern minimalist aesthetic in frontend/src/app.css

### Authentication

- [ ] T033 Configure Supabase Auth providers (Google, Apple, Azure) in Supabase dashboard
- [ ] T034 Implement auth callback route in frontend/src/routes/auth/callback/+page.svelte
- [ ] T035 [P] Create login buttons component in frontend/src/lib/components/LoginButtons.svelte
- [ ] T036 Implement GET /api/v1/auth/me endpoint in backend/src/routes/auth.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Upload and Arrange Panels (Priority: P1) MVP

**Goal**: Upload brochure image/PDF, detect 6 panels, arrange them, view in custom tri-fold 3D viewer with realistic unfold animations

**Independent Test**: Upload sample PDF, verify panel detection, rearrange panels, confirm 3D viewer displays correctly with 4-state unfold navigation (Cover, Partial Open, Fully Open, Back)

**Covers**: FR-001 to FR-020, FR-023 to FR-036

### Backend - Upload & Processing

- [ ] T037 [P] [US1] Install @fastify/multipart for file uploads in backend/
- [ ] T038 [P] [US1] Create presigned URL service for R2 in backend/src/services/upload.ts
- [ ] T039 [US1] Implement POST /api/v1/upload/presigned endpoint in backend/src/routes/upload.ts
- [ ] T040 [US1] Implement POST /api/v1/brochures (create with file) in backend/src/routes/brochures.ts
- [ ] T041 [P] [US1] Create thumbnail generation service in backend/src/services/thumbnail.ts

### Frontend - Upload Flow

- [ ] T042 [P] [US1] Create FileUpload component with drag-drop in frontend/src/lib/components/FileUpload.svelte
- [ ] T043 [P] [US1] Create upload progress indicator in frontend/src/lib/components/UploadProgress.svelte
- [ ] T044 [US1] Create upload page/route in frontend/src/routes/upload/+page.svelte
- [ ] T045 [US1] Implement client-side file validation (type, size) in frontend/src/lib/utils/validation.ts

### Frontend - Panel Detection

- [ ] T046 [P] [US1] Install pdfjs-dist for PDF parsing in frontend/ with dynamic import config
- [ ] T047 [US1] Create panel detection service (Canvas API, 3x2 grid) in frontend/src/lib/services/panelDetection.ts
- [ ] T048 [US1] Create PDF page extraction utility in frontend/src/lib/utils/pdfExtract.ts

### Frontend - Panel Arrangement

- [ ] T049 [P] [US1] Create PanelSlot component with position labels in frontend/src/lib/components/PanelSlot.svelte
- [ ] T050 [P] [US1] Create draggable Panel component in frontend/src/lib/components/Panel.svelte
- [ ] T051 [US1] Create PanelArrangement editor grid in frontend/src/lib/components/PanelArrangement.svelte
- [ ] T052 [US1] Implement drag-and-drop swap logic in frontend/src/lib/stores/arrangement.ts
- [ ] T053 [US1] Add snap animation on panel drop (FR-027) in frontend/src/lib/components/PanelSlot.svelte
- [ ] T054 [US1] Create touch-friendly tap-to-swap for mobile in frontend/src/lib/components/PanelArrangement.svelte
- [ ] T055 [US1] Create arrangement confirmation page in frontend/src/routes/arrange/[id]/+page.svelte

### Frontend - Custom Tri-Fold Viewer (CSS 3D Transforms)

- [ ] T056 [US1] Create viewer state store with 4 fold states (Cover, Partial Open, Fully Open, Back) in frontend/src/lib/stores/viewerState.ts
- [ ] T057 [US1] Create ViewerContainer with CSS 3D perspective (1200px) in frontend/src/lib/components/viewer/ViewerContainer.svelte
- [ ] T058 [US1] Create Panel3D component with rotateY transforms and fold-edge transform-origin in frontend/src/lib/components/viewer/Panel3D.svelte
- [ ] T059 [US1] Implement 4-state transitions with 0.5s CSS animations in frontend/src/lib/components/viewer/Panel3D.svelte
- [ ] T060 [US1] Add fold crease shadows and ambient ground shadow (FR-028) in frontend/src/lib/components/viewer/FoldShadow.svelte
- [ ] T061 [US1] Create navigation arrow buttons with wrap-around in frontend/src/lib/components/viewer/NavArrows.svelte
- [ ] T062 [US1] Implement click-to-advance navigation in frontend/src/lib/components/viewer/ViewerContainer.svelte
- [ ] T063 [US1] Implement swipe gesture navigation (150px threshold) in frontend/src/lib/components/viewer/SwipeHandler.svelte
- [ ] T064 [US1] Implement pinch-to-zoom on mobile in frontend/src/lib/components/viewer/ZoomHandler.svelte
- [ ] T065 [US1] Create minimal toolbar (Share + Fullscreen) in frontend/src/lib/components/viewer/Toolbar.svelte
- [ ] T066 [US1] Implement fullscreen toggle using Fullscreen API in frontend/src/lib/components/viewer/Toolbar.svelte
- [ ] T067 [US1] Add keyboard navigation (arrow keys, Home/End, Escape) in frontend/src/lib/components/viewer/ViewerContainer.svelte
- [ ] T068 [US1] Add prefers-reduced-motion support in frontend/src/lib/components/viewer/Panel3D.svelte
- [ ] T069 [US1] Create viewer page/route in frontend/src/routes/view/[id]/+page.svelte

### Frontend - UI Polish (FR-025, FR-026, FR-029-FR-036)

- [ ] T070 [P] [US1] Create fade-in transition utility in frontend/src/lib/transitions/fade.ts
- [ ] T071 [P] [US1] Create Toast notification component in frontend/src/lib/components/Toast.svelte
- [ ] T072 [US1] Implement auto-suggest name from filename (FR-031) in upload flow
- [ ] T073 [US1] Create empty state for first-time users (FR-034-036) in frontend/src/lib/components/EmptyState.svelte
- [ ] T074 [US1] Add quick-start tips overlay (FR-035) in frontend/src/lib/components/QuickStartTips.svelte

**Checkpoint**: User Story 1 (Upload and Arrange) fully functional - users can upload, arrange, and view brochures with tri-fold animations

---

## Phase 4: User Story 2 - Edit Panel Arrangement (Priority: P2)

**Goal**: Allow users to re-arrange panels after initial setup

**Independent Test**: Save brochure, reopen arrangement editor, swap panels, verify 3D view updates

**Covers**: FR-012

### Implementation for User Story 2

- [ ] T075 [US2] Implement PUT /api/v1/brochures/{id}/panels endpoint in backend/src/routes/panels.ts
- [ ] T076 [US2] Add "Edit Arrangement" button to viewer toolbar in frontend/src/lib/components/viewer/Toolbar.svelte
- [ ] T077 [US2] Create arrangement edit mode in frontend/src/lib/components/PanelArrangement.svelte
- [ ] T078 [US2] Implement cancel/discard changes functionality in frontend/src/lib/components/PanelArrangement.svelte
- [ ] T079 [US2] Add edit arrangement button to library card component in frontend/src/lib/components/BrochureCard.svelte

**Checkpoint**: User Story 2 (Edit Arrangement) fully functional

---

## Phase 5: User Story 3 - Save Brochures (Priority: P3)

**Goal**: Authenticated users can save brochures to personal library

**Independent Test**: Upload brochure, save it, close browser, return, verify brochure persists

**Covers**: FR-037 to FR-039

### Backend - Save & Library

- [ ] T080 [US3] Implement GET /api/v1/brochures (list user's library) in backend/src/routes/brochures.ts
- [ ] T081 [US3] Implement GET /api/v1/brochures/{id} (get with panels) in backend/src/routes/brochures.ts
- [ ] T082 [US3] Add user_id association on save in backend/src/services/brochureService.ts

### Frontend - Save Flow

- [ ] T083 [US3] Create save button with auth gate in frontend/src/lib/components/viewer/Toolbar.svelte
- [ ] T084 [US3] Show login prompt for unauthenticated save attempts in frontend/src/lib/components/LoginPrompt.svelte
- [ ] T085 [US3] Create brochure store for state management in frontend/src/lib/stores/brochures.ts
- [ ] T086 [US3] Add success toast after save confirmation in frontend/src/lib/components/viewer/Toolbar.svelte

**Checkpoint**: User Story 3 (Save Brochures) fully functional

---

## Phase 6: User Story 4 - Share Brochures (Priority: P4)

**Goal**: Generate shareable links, QR codes, and native share support

**Independent Test**: Generate share link, open in incognito, verify brochure displays without login

**Covers**: FR-042 to FR-051, FR-063 to FR-065

### Backend - Share & Analytics

- [ ] T087 [US4] Create share token generation service in backend/src/services/share.ts
- [ ] T088 [US4] Implement POST /api/v1/brochures/{id}/share endpoint in backend/src/routes/share.ts
- [ ] T089 [US4] Implement GET /api/v1/view/{shareToken} (public view) in backend/src/routes/share.ts
- [ ] T090 [US4] Implement view count increment (exclude owner) in backend/src/services/share.ts
- [ ] T091 [US4] Implement GET /api/v1/brochures/{id}/qr endpoint in backend/src/routes/share.ts

### Frontend - Share UI

- [ ] T092 [P] [US4] Install qrcode library in frontend/
- [ ] T093 [US4] Create QR code generation service in frontend/src/lib/services/qrcode.ts
- [ ] T094 [US4] Create ShareModal component in frontend/src/lib/components/ShareModal.svelte
- [ ] T095 [US4] Implement copy link button with clipboard API in frontend/src/lib/components/ShareModal.svelte
- [ ] T096 [US4] Implement Web Share API with fallback (FR-050, FR-051) in frontend/src/lib/services/share.ts
- [ ] T097 [US4] Add QR code download button (PNG format, 200x200px min) in frontend/src/lib/components/ShareModal.svelte
- [ ] T098 [US4] Create public viewer route in frontend/src/routes/s/[shareToken]/+page.svelte
- [ ] T099 [US4] Display view count in library cards in frontend/src/lib/components/BrochureCard.svelte

**Checkpoint**: User Story 4 (Share Brochures) fully functional

---

## Phase 7: User Story 5 - Embed Brochures (Priority: P5)

**Goal**: Public brochures can be embedded on external sites via iframe

**Independent Test**: Mark brochure public, copy embed code, paste into HTML file, verify 3D viewer renders

**Covers**: FR-040, FR-041, FR-052 to FR-056

### Backend - Embed

- [ ] T100 [US5] Implement PATCH /api/v1/brochures/{id} (update visibility) in backend/src/routes/brochures.ts
- [ ] T101 [US5] Implement GET /api/v1/brochures/{id}/embed endpoint in backend/src/routes/embed.ts
- [ ] T102 [US5] Implement GET /api/v1/embed/{brochureId} (HTML page) in backend/src/routes/embed.ts
- [ ] T103 [US5] Add visibility check for embed access in backend/src/routes/embed.ts

### Frontend - Embed UI

- [ ] T104 [US5] Create EmbedModal component in frontend/src/lib/components/EmbedModal.svelte
- [ ] T105 [US5] Generate iframe embed code with customizable dimensions in frontend/src/lib/components/EmbedModal.svelte
- [ ] T106 [US5] Create embedded viewer route in frontend/src/routes/embed/[id]/+page.svelte
- [ ] T107 [US5] Show "brochure unavailable" for private/deleted embeds (FR-056) in frontend/src/lib/components/embed/Unavailable.svelte
- [ ] T108 [US5] Disable embed option for private brochures in UI in frontend/src/lib/components/ShareModal.svelte

**Checkpoint**: User Story 5 (Embed Brochures) fully functional

---

## Phase 8: User Story 6 - Download Mockups (Priority: P6)

**Goal**: Download original file and PDF with realistic 3D mockup images

**Independent Test**: Save brochure, download original, download mockups PDF, verify PDF has 3 views

**Covers**: FR-066 to FR-069

### Backend - Downloads

- [ ] T109 [US6] Implement GET /api/v1/brochures/{id}/download/original in backend/src/routes/downloads.ts
- [ ] T110 [US6] Create presigned download URL for original file in backend/src/routes/downloads.ts

### Frontend - Mockup Generation

- [ ] T111 [P] [US6] Install jspdf and html2canvas in frontend/ with lazy loading config
- [ ] T112 [US6] Create mockup PDF generation service in frontend/src/lib/services/mockups.ts
- [ ] T113 [US6] Implement viewer state control (Cover, Partial Open, Fully Open) for capture in frontend/src/lib/services/mockups.ts
- [ ] T114 [US6] Capture viewer states with html2canvas in frontend/src/lib/services/mockups.ts
- [ ] T115 [US6] Generate PDF with jsPDF containing 3 mockup views in frontend/src/lib/services/mockups.ts
- [ ] T116 [US6] Add "Created with Open Brochure" footer to PDF in frontend/src/lib/services/mockups.ts
- [ ] T117 [US6] Create DownloadModal component in frontend/src/lib/components/DownloadModal.svelte
- [ ] T118 [US6] Add download buttons to viewer and library in frontend/src/lib/components/viewer/Toolbar.svelte

**Checkpoint**: User Story 6 (Download Mockups) fully functional

---

## Phase 9: User Story 7 - Manage Saved Brochures (Priority: P7)

**Goal**: View library, rename, delete, and manage visibility of brochures

**Independent Test**: Save multiple brochures, rename one, delete another, verify library updates

**Covers**: FR-057 to FR-062

### Backend - Management

- [ ] T119 [US7] Implement PATCH /api/v1/brochures/{id} (rename) in backend/src/routes/brochures.ts
- [ ] T120 [US7] Implement DELETE /api/v1/brochures/{id} in backend/src/routes/brochures.ts
- [ ] T121 [US7] Cascade delete panels and invalidate share tokens in backend/src/services/brochureService.ts

### Frontend - Library

- [ ] T122 [US7] Create Library page in frontend/src/routes/library/+page.svelte
- [ ] T123 [US7] Create BrochureCard component with thumbnail in frontend/src/lib/components/BrochureCard.svelte
- [ ] T124 [US7] Add hover scale animation to library cards (FR-026) in frontend/src/lib/components/BrochureCard.svelte
- [ ] T125 [US7] Create rename inline edit functionality in frontend/src/lib/components/BrochureCard.svelte
- [ ] T126 [US7] Create delete confirmation modal in frontend/src/routes/library/+page.svelte
- [ ] T127 [US7] Add visibility toggle (public/private) to library cards in frontend/src/lib/components/BrochureCard.svelte
- [ ] T128 [US7] Implement keyboard navigation for library grid (FR-061) in frontend/src/routes/library/+page.svelte
- [ ] T129 [US7] Add pagination/infinite scroll for 50+ brochures (SC-007) in frontend/src/routes/library/+page.svelte

**Checkpoint**: User Story 7 (Manage Brochures) fully functional

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Accessibility

- [ ] T130 [P] Audit and fix keyboard navigation across all components
- [ ] T131 [P] Add ARIA labels, roles, and live regions per research.md Decision 13
- [ ] T132 [P] Ensure color contrast meets WCAG AA standards
- [ ] T133 [P] Add alt text for thumbnails and panel images
- [ ] T134 Run axe-core accessibility tests

### Performance

- [ ] T135 [P] Configure Vite manualChunks for pdfjs-dist lazy loading per research.md Decision 11
- [ ] T136 [P] Add @vite-pwa/sveltekit service worker for offline viewing per research.md Decision 12
- [ ] T137 [P] Optimize bundle size (target < 200KB initial load)
- [ ] T138 [P] Add image optimization for panel images

### Responsive Design

- [ ] T139 [P] Test and fix layouts for 320px viewport
- [ ] T140 [P] Test and fix layouts for 1920px+ viewport
- [ ] T141 [P] Verify no horizontal scroll on any viewport

### Final Validation

- [ ] T142 Run quickstart.md validation (full developer setup)
- [ ] T143 Verify all success criteria (SC-001 through SC-012)
- [ ] T144 Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] T145 Mobile device testing (iOS Safari, Android Chrome)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → ...)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - **This is the MVP**
- **User Story 2 (P2)**: Depends on US1 viewer components
- **User Story 3 (P3)**: Depends on US1 viewer components and US2 for arrangement persistence
- **User Story 4 (P4)**: Depends on US3 (saved brochures to share)
- **User Story 5 (P5)**: Depends on US4 (share infrastructure)
- **User Story 6 (P6)**: Depends on US1 viewer (for mockup capture)
- **User Story 7 (P7)**: Depends on US3 (library management requires saved brochures)

### Within Each User Story

- Backend endpoints before frontend consumers
- Models/types before services
- Services before UI components
- Core implementation before polish
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Within each user story, tasks marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members (after Foundational)

---

## Parallel Example: Phase 2 Foundational

```bash
# After T008-T013 (database schema) completes, these can run in parallel:
Task: T014 - Define types in shared/types/models.ts
Task: T015 - Define interfaces in shared/types/models.ts
Task: T016 - Define composite types in shared/types/models.ts
Task: T017 - Define API types in shared/types/api.ts
Task: T018 - Define error types in shared/types/errors.ts
Task: T020 - Create Supabase client in backend/
Task: T021 - Create R2 client in backend/
Task: T023 - Create error middleware in backend/
Task: T024 - Create validation middleware in backend/
Task: T027 - Create Supabase client in frontend/
Task: T028 - Create API client in frontend/
Task: T030 - Create base layout in frontend/
Task: T031 - Configure design tokens in frontend/
Task: T032 - Create global styles in frontend/
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (**MVP!**)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Continue adding stories in priority order
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (MVP)
   - Developer B: User Story 6 (can work on mockup service in parallel)
3. After US1:
   - Developer A: User Stories 2, 3, 4, 5
   - Developer B: User Story 7
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Custom CSS 3D viewer** (not page-flip library) - ~5-10KB vs 30-50KB
- 4 fold states per FR-016a: Cover → Partial Open (left panel + inside flap) → Fully Open (all 3 inside panels) → Back
- Bundle budget: ~105KB initial, ~370KB with lazy-loaded features (pdfjs, jspdf, html2canvas)
- Performance targets: <3s load, 30+ FPS animations, <100ms interactions
