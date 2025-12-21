import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const BUCKET = process.env.S3_BUCKET;
const REGION = process.env.S3_REGION;
let s3: S3Client | null = null;
if (BUCKET && REGION) s3 = new S3Client({ region: REGION });

export async function saveBuffer(tenantSlug: string, filename: string, buffer: Buffer, contentType = 'image/webp') {
  if (s3) {
    const key = `${tenantSlug}/${filename}`;
    await s3.send(new PutObjectCommand({ Bucket: BUCKET!, Key: key, Body: buffer, ContentType: contentType, ACL: 'public-read' }));
    const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
    return url;
  }
  // fallback to local public uploads
  const outDir = path.join(process.cwd(), 'public', 'uploads', tenantSlug);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const dest = path.join(outDir, filename);
  await fs.promises.writeFile(dest, buffer);
  const url = `/uploads/${tenantSlug}/${filename}`;
  return url;
}

export default { saveBuffer };
