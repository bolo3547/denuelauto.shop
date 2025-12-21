import express, { Request, Response } from 'express';
import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { authMiddleware } from '../middleware/auth';
import { tmpdir } from 'os';
import { writeFile } from 'fs/promises';
import { spawnSync } from 'child_process';
import { prisma } from '../config/db';

const router = express.Router();
const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_BUCKET = process.env.S3_BUCKET;
const s3 = new S3Client({ endpoint: S3_ENDPOINT, forcePathStyle: true });

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

// POST /api/uploads/sign
router.post('/sign', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { invoiceId, filename, contentType, paymentMethod, amount, notes } = req.body || {};
    const user = req.user!;

    if (!invoiceId || !filename) return res.status(400).json({ error: 'invoiceId and filename are required' });

    const invoice = await prisma.proformainvoice.findUnique({ where: { id: invoiceId } });
    if (!invoice || invoice.tenantId !== user.tenantId) return res.status(404).json({ error: 'Invoice not found' });

    const safeName = sanitizeFileName(filename);
    const key = `payment-proofs/${user.tenantId}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
    const fileUrl = `${S3_ENDPOINT?.replace(/\/$/, '')}/${S3_BUCKET}/${key}`;

    const proof = await prisma.paymentProof.create({ data: {
      tenantId: user.tenantId,
      invoiceId,
      status: 'pending_upload',
      fileUrl,
      submittedByUserId: user.id,
      method: paymentMethod || undefined,
      meta: { amount: amount || undefined, notes: notes || undefined }
    } });

    const put = new PutObjectCommand({ Bucket: S3_BUCKET!, Key: key, ContentType: contentType || 'application/octet-stream' });
    const uploadUrl = await getSignedUrl(s3, put, { expiresIn: 900 });

    return res.json({ uploadUrl, fileUrl, proofId: proof.id });
  } catch (err: any) {
    console.error('uploads/sign error', err);
    return res.status(500).json({ error: err?.message || 'Internal error' });
  }
});

// POST /api/uploads/confirm
router.post('/confirm', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { proofId } = req.body || {};
    const user = req.user!;

    if (!proofId) return res.status(400).json({ error: 'proofId required' });

    const proof = await prisma.paymentProof.findUnique({ where: { id: proofId } });
    if (!proof || proof.tenantId !== user.tenantId) return res.status(404).json({ error: 'Proof not found' });

    const key = proof.fileUrl.split(`/${S3_BUCKET}/`)[1];
    if (!key) return res.status(400).json({ error: 'Invalid fileUrl' });

    await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET!, Key: key }));

    const get = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET!, Key: key }));
    const bodyStream: any = get.Body as any;
    const chunks: Buffer[] = [];
    for await (const chunk of bodyStream) chunks.push(Buffer.from(chunk));
    const buffer = Buffer.concat(chunks);

    const tempPath = `${tmpdir()}/${proof.id}-${Date.now()}`;
    await writeFile(tempPath, buffer);

    let result: any = spawnSync('clamdscan', ['--stdout', tempPath]);
    if (result.error) {
      result = spawnSync('clamscan', ['--stdout', tempPath]);
    }

    if (result.error) {
      await prisma.paymentProof.update({ where: { id: proofId }, data: { status: 'pending_scan' } });
      return res.json({ ok: true, message: 'File present; pending virus scan (no scanner installed on server)' });
    }

    const out = (result.stdout || '').toString();
    const exit = result.status;
    if (exit !== 0) {
      await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET!, Key: key }));
      await prisma.paymentProof.update({ where: { id: proofId }, data: { status: 'failed', meta: { scanOutput: out } } });
      return res.status(400).json({ ok: false, message: 'File failed virus scan and was removed' });
    }

    await prisma.paymentProof.update({ where: { id: proofId }, data: { status: 'succeeded', meta: { scanOutput: out } } });
    return res.json({ ok: true, message: 'File scanned and approved' });
  } catch (err: any) {
    console.error('uploads/confirm error', err);
    return res.status(500).json({ error: err?.message || 'Internal error' });
  }
});

export default router;
