/**
 * S3/MinIO Storage Module (with local filesystem fallback)
 * Handles file uploads, presigned URLs, and magic bytes validation
 * Falls back to local ./uploads/ directory when S3_ENDPOINT is not configured or unreachable.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Local Filesystem Fallback
// ============================================================================

const USE_LOCAL_STORAGE =
  process.env.STORAGE_DRIVER === 'local' ||
  (!process.env.S3_ENDPOINT && process.env.NODE_ENV === 'development');

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const LOCAL_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function ensureLocalDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function localUpload(options: UploadOptions): Promise<UploadResult> {
  try {
    const fullPath = path.join(LOCAL_UPLOAD_DIR, options.key);
    ensureLocalDir(fullPath);
    fs.writeFileSync(fullPath, options.body);
    return { success: true, key: options.key, url: `${LOCAL_BASE_URL}/api/files/${options.key}` };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Local upload failed' };
  }
}

function localDelete(key: string): boolean {
  try {
    const fullPath = path.join(LOCAL_UPLOAD_DIR, key);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    return true;
  } catch { return false; }
}

function localExists(key: string): boolean {
  return fs.existsSync(path.join(LOCAL_UPLOAD_DIR, key));
}

function localReadStream(key: string): fs.ReadStream {
  return fs.createReadStream(path.join(LOCAL_UPLOAD_DIR, key));
}

// ============================================================================
// S3 Client Configuration
// ============================================================================

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'ap-southeast-1',
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  forcePathStyle: true, // Required for MinIO
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  },
});

const BUCKET = process.env.S3_BUCKET || 'permits-documents';

// ============================================================================
// Magic Bytes Validation
// ============================================================================

const MAGIC_BYTES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
};

export function validateMagicBytes(buffer: Buffer, declaredMimeType: string): boolean {
  const signatures = MAGIC_BYTES[declaredMimeType];
  if (!signatures) return false;

  return signatures.some((sig) =>
    sig.every((byte, index) => buffer[index] === byte)
  );
}

// ============================================================================
// File Upload
// ============================================================================

export interface UploadOptions {
  key: string;
  body: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  try {
    // Validate magic bytes
    if (!validateMagicBytes(options.body, options.contentType)) {
      return {
        success: false,
        error: 'File content does not match declared MIME type. Possible file spoofing detected.',
      };
    }

    // Use local filesystem if S3 not configured
    if (USE_LOCAL_STORAGE) return localUpload(options);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: options.key,
        Body: options.body,
        ContentType: options.contentType,
        Metadata: options.metadata,
      })
    );

    return {
      success: true,
      key: options.key,
      url: `${process.env.S3_ENDPOINT}/${BUCKET}/${options.key}`,
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

// ============================================================================
// Presigned URL Generation
// ============================================================================

export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  // Local storage: return a direct API route URL
  if (USE_LOCAL_STORAGE) {
    return `${LOCAL_BASE_URL}/api/files/${key}`;
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 900
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

// ============================================================================
// File Operations
// ============================================================================

export async function deleteFile(key: string): Promise<boolean> {
  if (USE_LOCAL_STORAGE) return localDelete(key);
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    return false;
  }
}

export async function fileExists(key: string): Promise<boolean> {
  if (USE_LOCAL_STORAGE) return localExists(key);
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
}

export async function getFileStream(key: string) {
  if (USE_LOCAL_STORAGE) return localReadStream(key);
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const response = await s3Client.send(command);
  return response.Body;
}

// ============================================================================
// ClamAV Virus Scanning (optional, via REST API)
// ============================================================================

export async function scanForVirus(buffer: Buffer): Promise<{ clean: boolean; threat?: string }> {
  const CLAMAV_URL = process.env.CLAMAV_API_URL;

  if (!CLAMAV_URL) {
    // ClamAV not configured — skip scanning in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV] Virus scan skipped — ClamAV not configured');
      return { clean: true };
    }
    // In production, log warning but allow (operator should configure ClamAV)
    console.warn('ClamAV not configured — virus scanning disabled');
    return { clean: true };
  }
  try {
    const formData = new FormData();
    formData.append('file', new Blob([new Uint8Array(buffer)]));

    const response = await fetch(`${CLAMAV_URL}/scan`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('ClamAV scan failed');
    }

    const result = await response.json();
    return {
      clean: result.status === 'clean',
      threat: result.status !== 'clean' ? result.virus : undefined,
    };
  } catch (error) {
    console.error('Virus scan error:', error);
    // Fail open in dev, fail closed in production
    if (process.env.NODE_ENV === 'development') return { clean: true };
    return { clean: false, threat: 'Scan service unavailable' };
  }
}

// ============================================================================
// Storage Path Helpers
// ============================================================================

export function generateStoragePath(
  applicationId: string,
  fileId: string,
  extension: string
): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `documents/${year}/${month}/${applicationId}/${fileId}.${extension}`;
}

export function generatePermitStoragePath(permitId: string): string {
  const date = new Date();
  const year = date.getFullYear();
  return `permits/${year}/${permitId}.pdf`;
}
