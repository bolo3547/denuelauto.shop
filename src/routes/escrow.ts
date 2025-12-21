import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { requireStepUp } from '../middleware/stepUp';
import { z } from 'zod';
import crypto from 'crypto';

const prisma = new PrismaClient();
const router = Router();

const intentSchema = z.object({ provider: z.string(), amountUsd: z.number() });

// POST /buyer/proformas/:id/escrow/intent
router.post('/proformas/:id/escrow/intent', authMiddleware, async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  const userId = (req as any).user?.id;
  const parsed = intentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const pf = await prisma.proformaInvoice.findFirst({ where: { id: req.params.id, tenantId } });
  if (!pf) return res.status(404).json({ error: 'Proforma not found' });
  // create escrow payment row
  const escrow = await prisma.escrowPayment.create({ data: { tenantId, proformaId: pf.id, buyerId: userId, amountUsd: parsed.data.amountUsd, provider: parsed.data.provider, status: 'pending' } as any });
  res.status(201).json(escrow);
});

// POST /buyer/proformas/:id/escrow/release - accountant step-up required
router.post('/proformas/:id/escrow/release', authMiddleware, requirePermission('payments.verify'), requireStepUp, async (req: Request, res: Response) => {
  const enterprise = (req as any).tenantId || (req as any).user?.tenantId;
  const escrow = await prisma.escrowPayment.findFirst({ where: { proformaId: req.params.id, tenantId: enterprise } });
  if (!escrow) return res.status(404).json({ error: 'Escrow not found' });
  // mark as released
  const updated = await prisma.escrowPayment.update({ where: { id: escrow.id }, data: { status: 'released' } as any });
  res.json(updated);
});

export default router;
