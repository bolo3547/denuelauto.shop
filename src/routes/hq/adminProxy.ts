import { Router, Request, Response } from 'express';
import { requireHqAdminAuth } from '../../middleware/hqAuth';
import adminApiClient from '../../utils/adminApi';

const router = Router();

// Health check / status proxy to external admin API
router.get('/admin-proxy/status', requireHqAdminAuth, async (req: Request, res: Response) => {
  try {
    const resp = await adminApiClient.get('/status');
    return res.json({ ok: true, external: resp.data });
  } catch (err: any) {
    console.error('admin-proxy/status error', err?.message || err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

export default router;
