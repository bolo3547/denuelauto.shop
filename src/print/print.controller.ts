import { Router, Request, Response } from 'express';
import printService from './print.service';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { requireStepUp } from '../middleware/stepUp';

const router = Router();

const TEMPLATE_PERMS: Record<string, string> = {
  proforma: 'proformas.read',
  commercial_invoice: 'proformas.read',
  packing_list: 'shipments.manage',
  receipt: 'payments.read',
};

router.get('/print/:template/:id', authMiddleware, async (req: Request, res: Response) => {
  const { template, id } = req.params;
  const format = (req.query.format as string) || 'html';
  const perm = TEMPLATE_PERMS[template];
  if (!perm) return res.status(400).json({ error: 'Unsupported template' });
  try {
    const hasPerm = requirePermission(perm);
    let allowed = true;
    await new Promise<void>((resolve, reject) => {
      hasPerm(req, res, (err?: any) => {
        if (err) return reject(err);
        resolve();
      });
    }).catch(() => {
      allowed = false;
    });
    if (!allowed) return;

    if (['commercial_invoice', 'packing_list'].includes(template)) {
      const data = await printService.mapData(template, id);
      const alreadyPaid = (data as any).proforma?.status === 'paid' || (data as any).shipment?.is_paid || (data as any).payment?.status === 'paid';
      if (alreadyPaid) {
        try {
          await new Promise<void>((resolve, reject) => {
            requireStepUp(req, res, (err?: any) => {
              if (err) return reject(err);
              resolve();
            });
          });
        } catch (err) {
          return;
        }
      }
    }

    const data = await printService.mapData(template, id);
    const html = await printService.compile(template, data);
    if (format === 'pdf') {
      const pdf = await printService.toPdf(html);
      res.setHeader('Content-Type', 'application/pdf');
      const filename = `${(data as any).tenant?.slug || 'tenant'}-${template}-${((data as any).proforma?.number || (data as any).invoice?.number || (data as any).shipment?.ref || (data as any).payment?.ref || id)}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('X-Doc-Hash', (data as any).doc_hash || '');
      res.send(pdf);
    } else {
      res.setHeader('X-Doc-Hash', (data as any).doc_hash || '');
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    }
  } catch (err: any) {
    res.status(400).json({ error: 'print failed', details: err.message || err });
  }
});

export default router;
