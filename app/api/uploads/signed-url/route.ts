import { NextRequest, NextResponse } from 'next/server';

// Allowed file types and max size for upload validation
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'video/mp4', 'video/webm',
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const filename = url.searchParams.get('filename');
  const contentType = url.searchParams.get('contentType');
  const fileSize = parseInt(url.searchParams.get('fileSize') || '0', 10);
  const tenantId = url.searchParams.get('tenantId') || 'default';

  if (!filename || !contentType) {
    return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({
      error: `File type "${contentType}" is not allowed. Accepted: ${ALLOWED_TYPES.join(', ')}`,
    }, { status: 400 });
  }

  // Validate file size
  if (fileSize > MAX_FILE_SIZE) {
    return NextResponse.json({
      error: `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
    }, { status: 400 });
  }

  // Sanitize filename and enforce tenant-specific prefix
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `uploads/${tenantId}/${Date.now()}-${sanitizedFilename}`;

  const s3Endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000';
  const s3Bucket = process.env.S3_BUCKET || 'uploads';

  // Generate pre-signed URL using AWS SDK if configured
  if (process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY) {
    try {
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
      const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

      const s3Client = new S3Client({
        endpoint: s3Endpoint,
        region: process.env.S3_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
        },
        forcePathStyle: true,
      });

      const command = new PutObjectCommand({
        Bucket: s3Bucket,
        Key: key,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes

      return NextResponse.json({
        uploadUrl: signedUrl,
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        publicUrl: `${s3Endpoint}/${s3Bucket}/${key}`,
        key,
      });
    } catch (err) {
      console.error('Failed to generate pre-signed URL:', err);
    }
  }

  // Fallback for development (non-signed upload)
  return NextResponse.json({
    uploadUrl: `${s3Endpoint}/${s3Bucket}/${key}`,
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    publicUrl: `${s3Endpoint}/${s3Bucket}/${key}`,
    key,
    note: 'Development mode: using non-signed URL. Configure S3_ACCESS_KEY and S3_SECRET_KEY for production.',
  });
}
