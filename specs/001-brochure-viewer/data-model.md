# Data Model: Brochure Viewer

**Date**: 2025-01-12
**Branch**: `001-brochure-viewer`
**Database**: Supabase (PostgreSQL)
**App Name**: Open Brochure | **Domain**: openbrochure.com

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐
│      User       │       │      Brochure       │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │──1:N──│ id (PK)             │
│ email           │       │ user_id (FK)        │
│ name            │       │ name                │
│ avatar_url      │       │ visibility          │
│ provider        │       │ original_file_url   │
│ created_at      │       │ original_file_type  │
│ last_login_at   │       │ thumbnail_url       │
└─────────────────┘       │ share_token         │
                          │ view_count          │
                          │ created_at          │
                          │ updated_at          │
                          └─────────┬───────────┘
                                    │
                                   1:6
                                    │
                          ┌─────────▼───────────┐
                          │       Panel         │
                          ├─────────────────────┤
                          │ id (PK)             │
                          │ brochure_id (FK)    │
                          │ position            │
                          │ image_url           │
                          │ sort_order          │
                          └─────────────────────┘
```

---

## Entities

### User

Represents an authenticated user who can save, share, and manage brochures.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Unique identifier (from Supabase Auth) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| `name` | VARCHAR(100) | NULL | Display name (from OAuth provider) |
| `avatar_url` | TEXT | NULL | Profile image URL (from OAuth provider) |
| `provider` | VARCHAR(20) | NOT NULL | Auth provider: 'google', 'apple', 'azure' |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation time |
| `last_login_at` | TIMESTAMPTZ | NULL | Most recent login time |

**Notes**:
- User records are created automatically by Supabase Auth
- The `id` matches Supabase `auth.users.id`
- Provider 'azure' represents Microsoft sign-in

---

### Brochure

Represents an uploaded tri-fold brochure with its metadata and sharing status.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Unique identifier |
| `user_id` | UUID | FK → User.id, NULL | Owner (NULL for anonymous uploads) |
| `name` | VARCHAR(200) | NOT NULL | User-editable brochure name |
| `visibility` | VARCHAR(10) | NOT NULL, DEFAULT 'private' | 'public' or 'private' |
| `original_file_url` | TEXT | NOT NULL | R2 URL of uploaded file |
| `original_file_type` | VARCHAR(10) | NOT NULL | 'image' or 'pdf' |
| `thumbnail_url` | TEXT | NULL | Generated thumbnail for library view |
| `share_token` | VARCHAR(32) | UNIQUE, NULL | Token for shareable link |
| `view_count` | INTEGER | NOT NULL, DEFAULT 0 | Total views (excludes owner) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Upload time |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last modification time |

**Validation Rules**:
- `visibility` must be 'public' or 'private'
- `share_token` is generated when user first shares (lazy generation)
- `share_token` format: 32-character alphanumeric (URL-safe)
- `view_count` only increments for non-owner views

**State Transitions**:
```
Created (private) → Made Public → Embedded
        ↓                ↓            ↓
   Made Public      Made Private   Made Private (embed stops)
        ↓                ↓
    Embedded         Cannot embed
```

**Indexes**:
- `idx_brochure_user_id` on `(user_id)` — Library queries
- `idx_brochure_share_token` on `(share_token)` — Share link lookups
- `idx_brochure_visibility` on `(user_id, visibility)` — Public brochure filtering

---

### Panel

Represents one of 6 panels extracted from a brochure, mapped to a position.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Unique identifier |
| `brochure_id` | UUID | FK → Brochure.id, NOT NULL | Parent brochure |
| `position` | VARCHAR(20) | NOT NULL | Panel position name |
| `image_url` | TEXT | NOT NULL | R2 URL of extracted panel image |
| `sort_order` | SMALLINT | NOT NULL | Display order (0-5) |

**Position Values** (from spec FR-008):
| Position | Sort Order | Description |
|----------|------------|-------------|
| `cover` | 0 | Front-facing when folded |
| `back` | 1 | Back-facing when folded |
| `inside_flap` | 2 | Panel that folds inward |
| `left_panel` | 3 | Left side when fully open |
| `center_panel` | 4 | Middle when fully open |
| `right_panel` | 5 | Right side when fully open |

**Validation Rules**:
- Each brochure must have exactly 6 panels (or fewer if user uploads single image)
- `position` must be one of the 6 valid values
- `sort_order` must be unique within a brochure (0-5)

**Indexes**:
- `idx_panel_brochure_id` on `(brochure_id)` — Panel retrieval
- Unique constraint on `(brochure_id, position)` — One panel per position

---

## PostgreSQL Schema

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  provider VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Brochures table
CREATE TABLE public.brochures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  visibility VARCHAR(10) NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('public', 'private')),
  original_file_url TEXT NOT NULL,
  original_file_type VARCHAR(10) NOT NULL
    CHECK (original_file_type IN ('image', 'pdf')),
  thumbnail_url TEXT,
  share_token VARCHAR(32) UNIQUE,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brochure_user_id ON public.brochures(user_id);
CREATE INDEX idx_brochure_share_token ON public.brochures(share_token);
CREATE INDEX idx_brochure_visibility ON public.brochures(user_id, visibility);

-- Panels table
CREATE TABLE public.panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brochure_id UUID NOT NULL REFERENCES public.brochures(id) ON DELETE CASCADE,
  position VARCHAR(20) NOT NULL
    CHECK (position IN ('cover', 'back', 'inside_flap', 'left_panel', 'center_panel', 'right_panel')),
  image_url TEXT NOT NULL,
  sort_order SMALLINT NOT NULL CHECK (sort_order BETWEEN 0 AND 5),
  UNIQUE (brochure_id, position),
  UNIQUE (brochure_id, sort_order)
);

CREATE INDEX idx_panel_brochure_id ON public.panels(brochure_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brochures_updated_at
  BEFORE UPDATE ON public.brochures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Row-Level Security (Supabase)

```sql
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brochures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panels ENABLE ROW LEVEL SECURITY;

-- Users: can only read/update own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Brochures: complex rules based on ownership and visibility
CREATE POLICY "Anyone can view public brochures"
  ON public.brochures FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Anyone can view shared brochures"
  ON public.brochures FOR SELECT
  USING (share_token IS NOT NULL);

CREATE POLICY "Owners can view own brochures"
  ON public.brochures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can insert brochures"
  ON public.brochures FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Owners can update own brochures"
  ON public.brochures FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete own brochures"
  ON public.brochures FOR DELETE
  USING (auth.uid() = user_id);

-- Panels: follow brochure access
CREATE POLICY "Panels follow brochure access"
  ON public.panels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.brochures b
      WHERE b.id = brochure_id
      AND (b.visibility = 'public' OR b.share_token IS NOT NULL OR b.user_id = auth.uid())
    )
  );

CREATE POLICY "Owners can manage panels"
  ON public.panels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.brochures b
      WHERE b.id = brochure_id AND b.user_id = auth.uid()
    )
  );
```

---

## TypeScript Types

```typescript
// shared/types/models.ts

export type Visibility = 'public' | 'private';

export type PanelPosition =
  | 'cover'
  | 'back'
  | 'inside_flap'
  | 'left_panel'
  | 'center_panel'
  | 'right_panel';

export type AuthProvider = 'google' | 'apple' | 'azure';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  provider: AuthProvider;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface Brochure {
  id: string;
  userId: string | null;
  name: string;
  visibility: Visibility;
  originalFileUrl: string;
  originalFileType: 'image' | 'pdf';
  thumbnailUrl: string | null;
  shareToken: string | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Panel {
  id: string;
  brochureId: string;
  position: PanelPosition;
  imageUrl: string;
  sortOrder: number;
}

// Extended types for API responses
export interface BrochureWithPanels extends Brochure {
  panels: Panel[];
}

export interface LibraryBrochure extends Pick<Brochure,
  'id' | 'name' | 'visibility' | 'thumbnailUrl' | 'viewCount' | 'createdAt' | 'updatedAt'
> {}
```

---

## Query Patterns

### Get User's Library (with view counts)
```sql
SELECT id, name, visibility, thumbnail_url, view_count, created_at, updated_at
FROM brochures
WHERE user_id = $1
ORDER BY updated_at DESC
LIMIT 50;
```

### Get Brochure with Panels (for viewer)
```sql
SELECT
  b.*,
  json_agg(
    json_build_object(
      'id', p.id,
      'position', p.position,
      'imageUrl', p.image_url,
      'sortOrder', p.sort_order
    ) ORDER BY p.sort_order
  ) as panels
FROM brochures b
LEFT JOIN panels p ON p.brochure_id = b.id
WHERE b.id = $1
GROUP BY b.id;
```

### Get Brochure by Share Token
```sql
SELECT
  b.*,
  json_agg(
    json_build_object(
      'id', p.id,
      'position', p.position,
      'imageUrl', p.image_url,
      'sortOrder', p.sort_order
    ) ORDER BY p.sort_order
  ) as panels
FROM brochures b
LEFT JOIN panels p ON p.brochure_id = b.id
WHERE b.share_token = $1
GROUP BY b.id;
```

### Update Panel Arrangement
```sql
-- Update all panels in a transaction
BEGIN;
UPDATE panels SET position = $2, sort_order = $3 WHERE id = $1;
UPDATE panels SET position = $4, sort_order = $5 WHERE id = $6;
-- ... for all 6 panels
COMMIT;
```

### Increment View Count (excludes owner)
```sql
UPDATE brochures
SET view_count = view_count + 1
WHERE id = $1
AND (user_id IS NULL OR user_id != $2);
```
