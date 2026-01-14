import sharp from 'sharp';
import { r2Client, getPublicUrl, generateFileKey } from '../lib/storage.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const bucketName = process.env.R2_BUCKET_NAME || 'openbrochure-dev';

// Thumbnail dimensions
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 300;
const THUMBNAIL_QUALITY = 80;

export interface ThumbnailResult {
  thumbnailUrl: string;
  thumbnailKey: string;
}

/**
 * Generate a thumbnail from an image buffer
 * Uses the cover panel image to create a representative thumbnail
 */
export async function generateThumbnail(
  imageBuffer: Buffer,
  userId: string | null,
  brochureId: string
): Promise<ThumbnailResult> {
  if (!r2Client) {
    throw new Error('R2 storage not configured');
  }

  // Generate thumbnail using sharp
  const thumbnailBuffer = await sharp(imageBuffer)
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: THUMBNAIL_QUALITY })
    .toBuffer();

  // Generate unique key for thumbnail
  const thumbnailKey = generateFileKey(userId, `thumbnail-${brochureId}.jpg`);

  // Upload to R2
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: thumbnailKey,
    Body: thumbnailBuffer,
    ContentType: 'image/jpeg',
  });

  await r2Client.send(command);

  return {
    thumbnailUrl: getPublicUrl(thumbnailKey),
    thumbnailKey,
  };
}

/**
 * Generate a thumbnail from a URL by fetching and processing the image
 */
export async function generateThumbnailFromUrl(
  imageUrl: string,
  userId: string | null,
  brochureId: string
): Promise<ThumbnailResult> {
  // Fetch the image
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  return generateThumbnail(imageBuffer, userId, brochureId);
}

/**
 * Generate a composite thumbnail from multiple panel images
 * Creates a 2x3 grid preview of all panels
 */
export async function generateCompositeThumbnail(
  panelImages: Buffer[],
  userId: string | null,
  brochureId: string
): Promise<ThumbnailResult> {
  if (!r2Client) {
    throw new Error('R2 storage not configured');
  }

  if (panelImages.length === 0) {
    throw new Error('No panel images provided');
  }

  // Calculate grid dimensions (2 columns, 3 rows for 6 panels)
  const cols = 2;
  const rows = 3;
  const cellWidth = Math.floor(THUMBNAIL_WIDTH / cols);
  const cellHeight = Math.floor(THUMBNAIL_HEIGHT / rows);

  // Resize each panel to fit in a cell
  const resizedPanels = await Promise.all(
    panelImages.slice(0, 6).map(async (buffer, index) => {
      const resized = await sharp(buffer)
        .resize(cellWidth, cellHeight, {
          fit: 'cover',
          position: 'center',
        })
        .toBuffer();

      return {
        input: resized,
        left: (index % cols) * cellWidth,
        top: Math.floor(index / cols) * cellHeight,
      };
    })
  );

  // Create composite image
  const thumbnailBuffer = await sharp({
    create: {
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite(resizedPanels)
    .jpeg({ quality: THUMBNAIL_QUALITY })
    .toBuffer();

  // Generate unique key for thumbnail
  const thumbnailKey = generateFileKey(userId, `thumbnail-${brochureId}.jpg`);

  // Upload to R2
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: thumbnailKey,
    Body: thumbnailBuffer,
    ContentType: 'image/jpeg',
  });

  await r2Client.send(command);

  return {
    thumbnailUrl: getPublicUrl(thumbnailKey),
    thumbnailKey,
  };
}
