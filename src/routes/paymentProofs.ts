import express, { Request, Response } from 'express';
import { authMiddleware, requireMinRole, requireRole } from '../middleware/auth';
import { approvePaymentProof, rejectPaymentProof } from '../services/paymentProofs.service';
import { requirePermission } from '../middleware/permissions';

const router = express.Router();

// Approve a payment proof
router.patch('/:id/approve', authMiddleware, requirePermission('payments.verify'), async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await approvePaymentProof(id, { id: req.user?.id, type: 'admin' });
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('approve payment proof failed', err);
    return res.status(500).json({ error: err?.message || 'Approval failed' });
  }
});

// Reject a payment proof
router.patch('/:id/reject', authMiddleware, requirePermission('payments.verify'), async (req: Request, res: Response) => {
  const id = req.params.id;
  const { reason } = req.body || {};
  try {
    await rejectPaymentProof(id, { id: req.user?.id, type: 'admin' }, reason);
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('reject payment proof failed', err);
    return res.status(500).json({ error: err?.message || 'Reject failed' });
  }
});

export default router;
