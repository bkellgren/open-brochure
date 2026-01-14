/**
 * Core domain types for Open Brochure
 */

// Enums
export type Visibility = 'public' | 'private';

export type PanelPosition =
  | 'cover'
  | 'back'
  | 'inside_flap'
  | 'left_panel'
  | 'center_panel'
  | 'right_panel';

export type AuthProvider = 'google' | 'apple' | 'azure';

export type OriginalFileType = 'image' | 'pdf';

// Panel position metadata for UI
export const PANEL_POSITIONS: Record<PanelPosition, { label: string; sortOrder: number }> = {
  cover: { label: 'Cover', sortOrder: 0 },
  back: { label: 'Back', sortOrder: 1 },
  inside_flap: { label: 'Inside Flap', sortOrder: 2 },
  left_panel: { label: 'Left Panel', sortOrder: 3 },
  center_panel: { label: 'Center Panel', sortOrder: 4 },
  right_panel: { label: 'Right Panel', sortOrder: 5 },
};

// Entity interfaces
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
  originalFileType: OriginalFileType;
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

export interface LibraryBrochure
  extends Pick<
    Brochure,
    'id' | 'name' | 'visibility' | 'thumbnailUrl' | 'viewCount' | 'createdAt' | 'updatedAt'
  > {}

// Panel arrangement for editing
export interface PanelArrangement {
  panelId: string;
  position: PanelPosition;
}
