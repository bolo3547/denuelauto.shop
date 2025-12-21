import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import storage from './storage.service';

// For the prototype, we perform limited checks on provided image buffer.
export default {
  async ingestFromBuffer(buffer: Buffer, tenantSlug: string) {
    try {
      // strip exif: toBuffer with metadata false will re-encode without metadata
      const image = sharp(buffer).rotate();
      const metadata = await image.metadata();
      const width = metadata.width || 0;
      const height = metadata.height || 0;
      const shortest = Math.min(width, height);
      const qualityScore = Math.min(100, Math.round((shortest / 1280) * 100));
      const rejected = shortest < 800 ? true : false;
      // generate derivatives in 'public/uploads/<tenantSlug>' for simplicity
      const basename = `img_${Date.now()}`;
      const thumbBuf = await image.resize(320, 180, { fit: 'cover' }).webp().toBuffer();
      const detailBuf = await image.resize(1280, 720, { fit: 'cover' }).webp().toBuffer();
      const thumbName = `${basename}_thumb.webp`;
      const detailName = `${basename}_detail.webp`;
      const thumbUrl = await storage.saveBuffer(tenantSlug, thumbName, thumbBuf, 'image/webp');
      const detailUrl = await storage.saveBuffer(tenantSlug, detailName, detailBuf, 'image/webp');
      // For watermark we can add overlay in future; for now set watermarkApplied false
      return { qualityScore, urls: { thumb: thumbUrl, detail: detailUrl }, rejected, reason: rejected ? 'low_resolution' : undefined };
    } catch (err) {
      return { qualityScore: 0, urls: {}, rejected: true, reason: 'ingest_error' };
    }
  }
};
