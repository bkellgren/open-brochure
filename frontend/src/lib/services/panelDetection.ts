import type { PanelPosition } from '@open-brochure/shared';
import { PANEL_POSITIONS } from '@open-brochure/shared';

export interface DetectedPanel {
  position: PanelPosition;
  imageDataUrl: string;
  sortOrder: number;
}

/**
 * Default panel positions for a tri-fold brochure
 * Standard layout: 3 columns x 2 rows (front and back)
 */
const PANEL_LAYOUT: PanelPosition[][] = [
  // Front side (when folded, Cover is rightmost visible panel)
  ['inside_flap', 'back', 'cover'],
  // Back side (inside panels when unfolded)
  ['left_panel', 'center_panel', 'right_panel'],
];

/**
 * Detect and extract 6 panels from an image
 * Assumes standard tri-fold layout: 3 columns x 2 rows
 */
export async function detectPanelsFromImage(imageUrl: string): Promise<DetectedPanel[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const panels = extractPanels(img);
        resolve(panels);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}

/**
 * Extract 6 panels from a loaded image
 */
function extractPanels(img: HTMLImageElement): DetectedPanel[] {
  const panels: DetectedPanel[] = [];

  // Determine if image is single-sided or double-sided based on aspect ratio
  const aspectRatio = img.width / img.height;
  const isSingleSided = aspectRatio > 2; // Wide image = likely single row (one side)
  const isDoubleSided = aspectRatio < 2 && img.height > img.width * 0.5; // Taller = two rows

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  if (isSingleSided || (!isDoubleSided && aspectRatio > 1)) {
    // Single row of 3 panels (one side only)
    const panelWidth = Math.floor(img.width / 3);
    const panelHeight = img.height;
    canvas.width = panelWidth;
    canvas.height = panelHeight;

    // Extract front side panels
    PANEL_LAYOUT[0].forEach((position, col) => {
      ctx.clearRect(0, 0, panelWidth, panelHeight);
      ctx.drawImage(
        img,
        col * panelWidth,
        0,
        panelWidth,
        panelHeight,
        0,
        0,
        panelWidth,
        panelHeight
      );

      panels.push({
        position,
        imageDataUrl: canvas.toDataURL('image/jpeg', 0.9),
        sortOrder: PANEL_POSITIONS[position].sortOrder,
      });
    });

    // Create placeholder panels for the back side
    PANEL_LAYOUT[1].forEach((position) => {
      // Create a blank panel with placeholder
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, panelWidth, panelHeight);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Panel not provided', panelWidth / 2, panelHeight / 2);

      panels.push({
        position,
        imageDataUrl: canvas.toDataURL('image/jpeg', 0.9),
        sortOrder: PANEL_POSITIONS[position].sortOrder,
      });
    });
  } else {
    // Two rows of 3 panels (both sides)
    const panelWidth = Math.floor(img.width / 3);
    const panelHeight = Math.floor(img.height / 2);
    canvas.width = panelWidth;
    canvas.height = panelHeight;

    // Extract all 6 panels
    PANEL_LAYOUT.forEach((row, rowIndex) => {
      row.forEach((position, col) => {
        ctx.clearRect(0, 0, panelWidth, panelHeight);
        ctx.drawImage(
          img,
          col * panelWidth,
          rowIndex * panelHeight,
          panelWidth,
          panelHeight,
          0,
          0,
          panelWidth,
          panelHeight
        );

        panels.push({
          position,
          imageDataUrl: canvas.toDataURL('image/jpeg', 0.9),
          sortOrder: PANEL_POSITIONS[position].sortOrder,
        });
      });
    });
  }

  // Sort by sort order
  return panels.sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Create a panel from a data URL
 */
export function createPanelFromDataUrl(
  dataUrl: string,
  position: PanelPosition
): DetectedPanel {
  return {
    position,
    imageDataUrl: dataUrl,
    sortOrder: PANEL_POSITIONS[position].sortOrder,
  };
}

/**
 * Convert a File to a data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
