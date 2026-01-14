import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Check which storage backend to use
const useSupabaseStorage = process.env.USE_SUPABASE_STORAGE === 'true';

// Supabase Storage S3 config
const supabaseS3Url = process.env.SUPABASE_S3_URL;
const supabaseS3AccessKey = process.env.SUPABASE_S3_ACCESS_KEY;
const supabaseS3SecretKey = process.env.SUPABASE_S3_SECRET_KEY;
const supabaseS3Region = process.env.SUPABASE_S3_REGION || 'local';
const supabaseBucket = 'brochures';

// R2 config
const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY;
const secretAccessKey = process.env.R2_SECRET_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME || 'openbrochure-dev';
const publicUrl = process.env.R2_PUBLIC_URL;

// Check if storage is configured
const isSupabaseConfigured = useSupabaseStorage && supabaseS3Url && supabaseS3AccessKey && supabaseS3SecretKey;
const isR2Configured = !useSupabaseStorage && accountId && accessKeyId && secretAccessKey;

// Create the appropriate S3 client
let storageClient: S3Client | null = null;
let bucketName: string;

if (isSupabaseConfigured) {
  storageClient = new S3Client({
    region: supabaseS3Region,
    endpoint: supabaseS3Url,
    credentials: {
      accessKeyId: supabaseS3AccessKey!,
      secretAccessKey: supabaseS3SecretKey!,
    },
    forcePathStyle: true,
  });
  bucketName = supabaseBucket;
} else if (isR2Configured) {
  storageClient = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  });
  bucketName = r2BucketName;
} else {
  bucketName = r2BucketName;
}

// Export for backward compatibility
export const r2Client = storageClient;

/**
 * Generate a presigned URL for uploading a file
 */
export async function getUploadPresignedUrl(
  fileKey: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  if (!storageClient) {
    throw new Error('Storage not configured. Set USE_SUPABASE_STORAGE=true with Supabase S3 credentials, or configure R2.');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    ContentType: contentType,
  });

  return getSignedUrl(storageClient, command, { expiresIn });
}

/**
 * Generate a presigned URL for downloading a file
 */
export async function getDownloadPresignedUrl(
  fileKey: string,
  expiresIn = 3600
): Promise<string> {
  if (!storageClient) {
    throw new Error('Storage not configured. Set USE_SUPABASE_STORAGE=true with Supabase S3 credentials, or configure R2.');
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });

  return getSignedUrl(storageClient, command, { expiresIn });
}

/**
 * Delete a file from storage
 */
export async function deleteFile(fileKey: string): Promise<void> {
  if (!storageClient) {
    throw new Error('Storage not configured. Set USE_SUPABASE_STORAGE=true with Supabase S3 credentials, or configure R2.');
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });

  await storageClient.send(command);
}

/**
 * Get the public URL for a file
 */
export function getPublicUrl(fileKey: string): string {
  if (isSupabaseConfigured) {
    // Supabase Storage public URL format
    const baseUrl = supabaseS3Url!.replace('/storage/v1/s3', '/storage/v1/object/public');
    return `${baseUrl}/${bucketName}/${fileKey}`;
  }
  if (publicUrl) {
    return `${publicUrl}/${fileKey}`;
  }
  return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${fileKey}`;
}

/**
 * Generate a unique file key for uploads
 */
export function generateFileKey(userId: string | null, filename: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');

  if (userId) {
    return `users/${userId}/${timestamp}-${randomSuffix}-${safeFilename}`;
  }
  return `anonymous/${timestamp}-${randomSuffix}-${safeFilename}`;
}
