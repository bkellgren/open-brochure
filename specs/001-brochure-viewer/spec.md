# Feature Specification: Brochure Viewer

**Feature Branch**: `001-brochure-viewer`
**Created**: 2025-01-12
**Status**: Draft
**Input**: User description: "Core viewing functionality for tri-fold brochures"
**App Name**: Open Brochure
**Domain**: openbrochure.com

## Clarifications

### Session 2025-01-12

- Q: Application name and domain? → A: "Open Brochure" at openbrochure.com (changed from "Open Tri-fold" for better SEO and future format expansion)
- Q: Competitive positioning? → A: Compete with Simplebooklet by focusing on tri-fold specialization, simplicity, and free/open approach
- Q: Pricing strategy? → A: Free forever (unlimited brochures, unlimited views) - monetize later via premium features
- Q: Analytics features? → A: Basic view counts only (total views per brochure, visible in library)
- Q: QR code generation? → A: Yes - generate downloadable QR code for each brochure's share link
- Q: Social sharing approach? → A: Copy button + native share API (uses device's share sheet on mobile)
- Q: Download capabilities? → A: Owner can download original file + downloadable PDF with realistic mockup images of the brochure
- Q: How are brochures provided to the system? → A: Users upload images or PDFs (not structured data)
- Q: What type of viewer? → A: Custom tri-fold viewer with realistic unfold animations (updated 2026-01-13)
- Q: Additional functionality beyond viewing? → A: Save, share, and manage saved brochures
- Q: Authentication method? → A: Social login only (Google, Apple)
- Q: Maximum upload file size? → A: 25 MB
- Q: Share link expiration? → A: Never expire; owner revokes by deleting brochure
- Q: UI design style? → A: Extremely simple, clean, modern with lots of whitespace
- Q: Additional auth providers? → A: Add Microsoft login (Google, Apple, Microsoft)
- Q: Embed functionality? → A: Users can copy embed code for public brochures to embed on external sites
- Q: Brochure visibility? → A: Brochures can be public or private; embed only works for public
- Q: Panel detection? → A: System identifies 6 panels from upload; user confirms/adjusts mapping
- Q: Panel arrangement editing? → A: User can rearrange panels before saving; can edit later
- Q: Panel naming convention? → A: User-friendly names: Cover, Back, Inside Flap, Left Panel, Center Panel, Right Panel
- Q: UX polish enhancements? → A: Include micro-animations, smart defaults, and helpful empty states

### Session 2026-01-13

- Q: Viewer animation approach? → A: Build custom tri-fold viewer with realistic unfold animation (not page-flip); user clicks/swipes to unfold panels sequentially like opening a physical tri-fold brochure
- Q: Unfold states sequence? → A: 4 states with realistic tri-fold physics: (1) Cover only, (2) Partial open (left panel + inside flap visible), (3) Fully open (all 3 inside panels), (4) Back panel only
- Q: Initial viewer state? → A: Start folded showing Cover panel; user unfolds to explore (mimics physical brochure experience)
- Q: Navigation controls? → A: Both arrow buttons and click/swipe gestures; arrows provide clear affordance, gestures provide efficiency
- Q: Viewer toolbar contents? → A: Minimal toolbar with Share button and Fullscreen toggle only; aligns with clean/simple UI goal
- Q: Animation model for viewer? → A: Unfold model - tri-fold unfolds outward like opening a physical brochure (accordion-style from center), NOT page-flip/book model
- Q: CSS 3D transform settings? → A: perspective: 1200px on container, rotateY transforms for panel folding, 0.5s transition duration
- Q: Shadow behavior during animations? → A: Minimal shadows - subtle fold crease lines at panel edges (only in fully open), ambient ground shadow; NO darkening overlays on panels when fully open to preserve image brightness
- Q: Panel aspect ratio for rendering? → A: Standard tri-fold ratio - each panel ~1:2.3 (like 3.67"×8.5"), fully open spread is ~4:3 landscape
- Q: Rotation pivot point (transform-origin)? → A: Fold edge - left panel pivots on right edge, right panel pivots on left edge (mimics physical fold lines)
- Q: Animation physics model? → A: Realistic tri-fold physics - panels that are "revealed" (inside flap when opening left panel, center panel when opening inside flap) appear instantly without animation since they were already in position underneath; only panels that physically move should animate
- Q: State transition details? → A: (1) Cover→Partial: left panel animates open, inside flap appears instantly; (2) Partial→Fully: inside flap animates closed, center panel appears instantly, right panel visible; (3) Fully→Back: panels close, back shows; (4) Back→Cover: returns to start; navigation wraps around

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload and Arrange Panels (Priority: P1)

A user uploads an image or PDF of their tri-fold brochure. The system detects the 6 panels and
presents them for the user to confirm or rearrange. The user maps each detected panel to a
position in the 3D tri-fold using intuitive labels: Cover, Back, Inside Flap (outside panels)
and Left Panel, Center Panel, Right Panel (inside panels). Once confirmed, the system displays
the brochure in a custom interactive viewer with realistic tri-fold unfold animations.

**Why this priority**: This is the core value proposition—transforming a static image/PDF into
an interactive 3D viewing experience with correct panel placement. Without this, the brochure
won't display correctly in 3D.

**Independent Test**: Can be tested by uploading a sample PDF/image, verifying panel detection,
rearranging panels, and confirming the 3D viewer displays panels in correct positions.

**Acceptance Scenarios**:

1. **Given** a user uploads an image file (JPG, PNG), **When** upload completes, **Then** the
   system detects 6 panels and displays them for arrangement confirmation
2. **Given** a user uploads a PDF file, **When** upload completes, **Then** the system extracts
   pages, detects panels, and displays them for arrangement confirmation
3. **Given** detected panels are displayed, **When** the user views the arrangement screen,
   **Then** each panel position is labeled clearly: Cover, Back, Inside Flap, Left Panel,
   Center Panel, Right Panel
4. **Given** the arrangement screen, **When** the user drags a panel to a different position,
   **Then** the panels swap positions and the preview updates immediately
5. **Given** panels are arranged, **When** the user confirms the arrangement, **Then** the
   3D viewer displays the brochure with panels in the confirmed positions
6. **Given** a brochure is displayed in the viewer, **When** the user interacts with it (click/swipe),
   **Then** panels unfold with smooth, realistic animation mimicking a physical tri-fold
7. **Given** a user on a mobile device, **When** they arrange panels, **Then** touch-friendly
   controls allow easy drag-and-drop or tap-to-swap

---

### User Story 2 - Edit Panel Arrangement (Priority: P2)

A user wants to adjust the panel arrangement of a brochure after initially setting it up. They
can access the arrangement editor from the viewer or library to rearrange panels at any time.
Changes take effect immediately and update the 3D view.

**Why this priority**: Users may make mistakes during initial setup or want to experiment with
different arrangements. Editing capability is essential for a good user experience.

**Independent Test**: Can be tested by saving a brochure, reopening the arrangement editor,
swapping two panels, and verifying the 3D view reflects the change.

**Acceptance Scenarios**:

1. **Given** a brochure is displayed in the viewer, **When** the user selects "Edit Arrangement",
   **Then** the panel arrangement editor opens with current positions shown
2. **Given** a saved brochure in the library, **When** the user selects "Edit Arrangement",
   **Then** the panel arrangement editor opens
3. **Given** the arrangement editor is open, **When** the user rearranges panels and confirms,
   **Then** the changes are saved and the 3D view updates immediately
4. **Given** the arrangement editor is open, **When** the user cancels without saving, **Then**
   no changes are applied and the original arrangement is preserved

---

### User Story 3 - Save Brochures (Priority: P3)

A user wants to save their uploaded brochure for later viewing. After uploading and arranging
panels, they can save the brochure to their personal library. Saved brochures persist across
sessions and can be accessed from any device when logged in.

**Why this priority**: Saving enables return visits and builds user engagement. Without saving,
users must re-upload each time, reducing utility.

**Independent Test**: Can be tested by uploading a brochure, arranging panels, saving it,
closing the browser, returning, and verifying the brochure appears with correct arrangement.

**Acceptance Scenarios**:

1. **Given** a brochure with panels arranged, **When** the user selects "Save", **Then** the
   brochure and its panel arrangement are saved to their personal library
2. **Given** a user has saved brochures, **When** they return to the application, **Then**
   their saved brochures appear in their library with correct panel arrangements
3. **Given** a user is logged in on a new device, **When** they access their library, **Then**
   previously saved brochures are available with their panel arrangements intact

---

### User Story 4 - Share Brochures (Priority: P4)

A user wants to share a brochure with others. They can generate a shareable link that allows
recipients to view the brochure in the 3D viewer without needing an account. Shared brochures
can be viewed but not edited or re-saved by recipients.

**Why this priority**: Sharing extends the value of the viewer to recipients and increases
exposure. It's valuable but secondary to core viewing and saving.

**Independent Test**: Can be tested by generating a share link, opening it in an incognito
browser, and verifying the brochure displays correctly without login.

**Acceptance Scenarios**:

1. **Given** a saved brochure, **When** the user selects "Share", **Then** a shareable link
   is generated and can be copied
2. **Given** a share link, **When** anyone opens it, **Then** the brochure displays in the
   3D viewer without requiring login
3. **Given** a shared brochure view, **When** the recipient interacts with it, **Then** all
   viewing features work (unfold, zoom) but save is not available

---

### User Story 5 - Embed Brochures (Priority: P5)

A user wants to showcase their brochure on their own website or blog. They can mark a saved
brochure as "public" and then copy an embed code (HTML snippet) that displays the interactive
3D brochure viewer on any external website. Private brochures cannot be embedded.

**Why this priority**: Embedding extends reach and provides viral marketing potential, but
requires public visibility which is a subset of use cases. Core viewing/saving/sharing come first.

**Independent Test**: Can be tested by marking a brochure public, copying embed code, pasting
into an HTML file, and verifying the 3D viewer renders correctly.

**Acceptance Scenarios**:

1. **Given** a saved brochure marked as public, **When** the user selects "Embed", **Then**
   an HTML embed code is displayed and can be copied
2. **Given** embed code is pasted into an external website, **When** the page loads, **Then**
   the 3D brochure viewer renders with full interactivity
3. **Given** a brochure is marked as private, **When** the user views sharing options, **Then**
   the embed option is disabled or hidden
4. **Given** an embedded brochure, **When** the owner changes it to private, **Then** the
   embed stops working and shows "This brochure is no longer available"

---

### User Story 6 - Download Mockups (Priority: P6)

A user wants to use their tri-fold brochure in marketing materials or presentations. They can
download a PDF containing realistic mockup images showing their brochure in various 3D views
(folded closed, partially open, fully open). They can also download their original uploaded file.

**Why this priority**: Mockup downloads add significant value for marketing professionals but
are not essential for core viewing/sharing functionality.

**Independent Test**: Can be tested by saving a brochure, clicking download options, and
verifying both the original file and mockup PDF download correctly with realistic 3D renders.

**Acceptance Scenarios**:

1. **Given** a saved brochure, **When** the user selects "Download Original", **Then** the
   original uploaded file downloads in its original format
2. **Given** a saved brochure, **When** the user selects "Download Mockups", **Then** a PDF
   downloads containing realistic 3D mockup images of the brochure
3. **Given** a mockup PDF, **When** the user opens it, **Then** it contains multiple views:
   folded closed, partially open, and fully open perspectives
4. **Given** mockup images, **When** viewed, **Then** they show realistic shadows, lighting,
   and perspective appropriate for marketing materials

---

### User Story 7 - Manage Saved Brochures (Priority: P7)

A user wants to organize their saved brochures. They can view their library, rename brochures,
delete brochures they no longer need, and see when each was last viewed.

**Why this priority**: Management features improve usability for users with multiple brochures
but are not essential for core viewing experience.

**Independent Test**: Can be tested by saving multiple brochures, renaming one, deleting
another, and verifying the library reflects changes correctly.

**Acceptance Scenarios**:

1. **Given** a user has saved brochures, **When** they open their library, **Then** all saved
   brochures display with names and thumbnails
2. **Given** a brochure in the library, **When** the user renames it, **Then** the new name
   persists and displays correctly
3. **Given** a brochure in the library, **When** the user deletes it, **Then** it is removed
   from the library with confirmation

---

### Edge Cases

- What happens when an uploaded file is not a valid image or PDF?
  - Display a clear error message: "Please upload a valid image (JPG, PNG) or PDF file"
- What happens when an uploaded file exceeds 25 MB?
  - Reject the upload with message: "File too large. Maximum size is 25 MB."
- What happens when a PDF has too many pages for a tri-fold?
  - Accept the first 2 pages (front and back) or prompt user to select pages
- What happens when the uploaded image resolution is too low?
  - Display a warning if any panel would render below 300×400 pixels; allow viewing but suggest uploading higher resolution for best quality
- What happens when the user's storage quota is exceeded?
  - Prevent save and display message indicating quota reached with option to delete old items
- What happens when a share link is accessed after the brochure is deleted?
  - Display a friendly "This brochure is no longer available" message
- What happens during poor network connectivity?
  - Show loading indicators; allow offline viewing of cached brochures if previously loaded
- What happens when someone tries to embed a private brochure?
  - Embed code is not available; option is disabled/hidden in the UI
- What happens when an embedded brochure is made private by the owner?
  - Embed stops rendering and displays "This brochure is no longer available"
- What happens if embed code is used on a site with restrictive CSP?
  - Embed may fail to load; documentation should note CSP requirements
- What happens when the system cannot detect exactly 6 panels?
  - Allow user to manually define panel boundaries or upload a different file
- What happens when panel detection produces incorrect boundaries?
  - User can adjust panel boundaries manually in the arrangement editor
- What happens when the uploaded image is a single panel (not a full tri-fold)?
  - Allow user to assign the single image to one panel position; leave others blank or as placeholders

## Requirements *(mandatory)*

### Functional Requirements

**Upload & Processing**
- **FR-001**: System MUST accept image uploads in JPG and PNG formats
- **FR-002**: System MUST accept PDF uploads and extract viewable pages
- **FR-003**: System MUST enforce a maximum file size of 25 MB per upload
- **FR-004**: System MUST validate uploaded files and reject invalid formats with clear messaging
- **FR-005**: System MUST process uploads and detect 6 panels from the uploaded content

**Panel Detection & Arrangement**
- **FR-006**: System MUST detect and extract 6 panels from uploaded images/PDFs
- **FR-007**: System MUST present detected panels in an arrangement confirmation screen
- **FR-008**: System MUST label panel positions with user-friendly names: Cover, Back, Inside Flap
  (outside panels) and Left Panel, Center Panel, Right Panel (inside panels)
- **FR-009**: System MUST allow users to drag-and-drop or tap-to-swap panels to rearrange positions
- **FR-010**: System MUST show a live preview of the arrangement as users make changes
- **FR-011**: System MUST require user confirmation before proceeding to 3D view
- **FR-012**: System MUST allow users to edit panel arrangement after initial setup
- **FR-013**: System MUST preserve panel arrangement when brochure is saved
- **FR-014**: System MUST provide touch-friendly arrangement controls on mobile devices

**Custom Tri-Fold Viewer**
- **FR-015**: System MUST display brochures in a custom-built interactive tri-fold viewer
- **FR-016**: System MUST provide realistic unfold animations that mimic opening a physical tri-fold brochure
- **FR-016a**: Viewer MUST support 4 distinct states: (1) Cover only, (2) Partial open (left panel + inside flap), (3) Fully open (all 3 inside panels), (4) Back panel only
- **FR-016b**: User MUST be able to navigate forward and backward through all 4 unfold states with wrap-around
- **FR-016g**: Inside flap MUST appear instantly (no animation) when entering partial open state (simulates being revealed under left panel)
- **FR-016h**: Center panel MUST appear instantly (no animation) when entering fully open state (simulates being revealed under inside flap)
- **FR-016c**: Viewer MUST initially display brochure in folded state showing Cover panel
- **FR-016d**: Viewer MUST display left/right arrow buttons for navigating between unfold states
- **FR-016e**: Arrow buttons MUST always be visible (navigation wraps around from last state to first)
- **FR-017**: System MUST support mouse/trackpad interactions on desktop (click on brochure to advance, scroll to zoom)
- **FR-018**: System MUST support touch gestures on mobile (swipe to navigate states, pinch to zoom)
- **FR-019**: System MUST render the viewer smoothly at 30+ FPS on target devices
- **FR-020**: System MUST adapt the viewer to different screen sizes and orientations
- **FR-020d**: Viewer MUST render panels at standard tri-fold aspect ratio (~1:2.3 per panel, ~4:3 landscape when fully open)
- **FR-020e**: Viewer MUST use CSS perspective: 1200px on container with rotateY transforms and 0.5s transition duration
- **FR-020f**: Viewer MUST set transform-origin at fold edges (left panel pivots on right edge, right panel pivots on left edge) to mimic physical fold behavior
- **FR-020a**: Viewer MUST display a minimal toolbar with Share button and Fullscreen toggle
- **FR-020b**: Toolbar MUST be unobtrusive and not obscure brochure content
- **FR-020c**: Fullscreen mode MUST use browser Fullscreen API where supported

**Authentication**
- **FR-021**: System MUST support social login via Google, Apple, and Microsoft sign-in
- **FR-022**: System MUST NOT require authentication for uploading or viewing brochures

**UI Design**
- **FR-023**: UI MUST follow a minimalist design with generous whitespace
- **FR-024**: UI MUST use a clean, modern visual style with simple controls

**Micro-animations & Polish**
- **FR-025**: UI MUST use smooth fade-in transitions when content loads
- **FR-026**: UI MUST provide subtle scale animation on hover for library thumbnails
- **FR-027**: UI MUST show satisfying "snap" animation when panels are placed during arrangement
- **FR-028**: Viewer MUST include subtle shadow effects: fold crease lines between panels (only in fully open state), and minimal ambient shadow beneath brochure; shadows MUST NOT darken panel content when fully open
- **FR-029**: Success confirmations MUST use gentle toast notifications that auto-dismiss
- **FR-030**: Upload progress MUST display a smooth, visually pleasing progress indicator

**Smart Defaults**
- **FR-031**: System MUST auto-suggest brochure name from uploaded filename (user can edit)
- **FR-032**: System MUST remember user's last panel arrangement as an optional template
- **FR-033**: System MUST auto-detect image orientation and suggest optimal viewing mode

**Helpful Empty States**
- **FR-034**: Empty library MUST display friendly illustration with message "Your brochures will appear here"
- **FR-035**: First-time users MUST see subtle quick-start tips that fade after first use
- **FR-036**: Empty states MUST include clear call-to-action to upload first brochure

**Saving**
- **FR-037**: System MUST allow authenticated users to save brochures to a personal library
- **FR-038**: System MUST persist saved brochures across sessions and devices
- **FR-039**: System MUST generate thumbnails for saved brochures

**Visibility**
- **FR-040**: System MUST allow users to set brochures as public or private (default: private)
- **FR-041**: System MUST allow users to change visibility at any time

**Sharing**
- **FR-042**: System MUST generate unique shareable links for saved brochures
- **FR-043**: System MUST keep share links valid indefinitely (no expiration)
- **FR-044**: System MUST allow unauthenticated users to view shared brochures
- **FR-045**: System MUST restrict shared view to read-only (no save, no re-share)
- **FR-046**: System MUST invalidate share links when the owner deletes the brochure
- **FR-047**: System MUST generate a downloadable QR code image for each brochure's share link
- **FR-048**: QR code MUST be available in PNG format at minimum 200x200 pixels
- **FR-049**: System MUST provide a "Copy Link" button for the share URL
- **FR-050**: System MUST use the Web Share API on supported devices to show native share sheet
- **FR-051**: System MUST fall back to copy-only on devices without Web Share API support

**Embedding**
- **FR-052**: System MUST provide copyable HTML embed code for public brochures
- **FR-053**: System MUST render embedded brochures with full 3D viewer interactivity
- **FR-054**: System MUST disable/hide embed option for private brochures
- **FR-055**: System MUST stop rendering embeds when brochure is changed to private or deleted
- **FR-056**: Embedded viewers MUST display "brochure unavailable" message when access is revoked

**Management**
- **FR-057**: System MUST display a library view of all saved brochures
- **FR-058**: System MUST allow users to rename saved brochures
- **FR-059**: System MUST allow users to delete saved brochures with confirmation
- **FR-060**: System MUST allow users to toggle public/private visibility from library view
- **FR-061**: System MUST support keyboard navigation for all viewing and management controls
- **FR-062**: System MUST function on viewports from 320px to 1920px+ width

**Analytics**
- **FR-063**: System MUST track total view count for each brochure (share link + embed views)
- **FR-064**: System MUST display view count in the library view for each brochure
- **FR-065**: System MUST NOT count the owner's own views in the view count

**Downloads & Mockups**
- **FR-066**: System MUST allow owners to download their original uploaded file
- **FR-067**: System MUST generate realistic mockup images of the brochure (folded, partially open, fully open views)
- **FR-068**: System MUST provide downloadable PDF containing mockup images for marketing use
- **FR-069**: Mockup images MUST show the brochure in realistic 3D perspective views

### Key Entities

- **Brochure**: An uploaded document (image or PDF) representing a tri-fold brochure, with
  associated metadata (name, upload date, owner, visibility status, panel arrangement)
- **Panel**: One of 6 content sections extracted from the uploaded brochure, assigned to a
  specific position in the 3D tri-fold
- **Panel Position**: A named slot in the tri-fold structure. Outside: Cover, Back, Inside Flap.
  Inside: Left Panel, Center Panel, Right Panel
- **Panel Arrangement**: The mapping of detected panels to panel positions for a brochure
- **User**: An authenticated person who can upload, save, share, embed, and manage brochures
- **Library**: A user's collection of saved brochures
- **Share Link**: A unique URL that grants read-only access to a specific brochure
- **Embed Code**: An HTML snippet that renders the 3D viewer on external sites (public brochures only)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can upload and view a brochure in 3D within 10 seconds of starting
- **SC-002**: Unfold animations complete smoothly with no visible stuttering on target devices
- **SC-003**: 90% of users successfully save their first brochure without assistance
- **SC-004**: Share links load the brochure for recipients within 5 seconds
- **SC-005**: The viewer functions correctly on mobile, tablet, and desktop devices
- **SC-006**: All interactive elements are accessible via keyboard navigation
- **SC-007**: Users can manage a library of 50+ brochures without performance degradation
- **SC-008**: Embedded brochures load and render correctly on external sites within 5 seconds
- **SC-009**: 90% of users successfully arrange panels correctly on first attempt
- **SC-010**: Panel arrangement editing completes in under 30 seconds for typical adjustments
- **SC-011**: All micro-animations complete within 300ms to feel responsive yet polished
- **SC-012**: First-time users understand how to upload within 5 seconds of viewing empty state

## Assumptions

- Users will upload pre-designed brochure images/PDFs (no in-app design/editing)
- Tri-fold brochures have 6 panels: 3 outside (Cover, Back, Inside Flap) and 3 inside (Left, Center, Right)
- Uploaded images/PDFs contain panel content that can be detected and extracted by the system
- Authentication via social login (Google/Apple/Microsoft) is required for save/share; viewing is anonymous
- Modern browsers (latest two versions of Chrome, Firefox, Safari, Edge) are supported
- Mobile support targets iOS Safari and Android Chrome
- **Business Model**: Free forever with unlimited brochures and views; no artificial limits on core functionality; premium features may be added later but core viewing/saving/sharing remains free
