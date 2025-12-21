import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';

const prisma = new PrismaClient();

export class WarrantyService {
  // compute warranty price on a proforma; for simplicity: 2% of car FOB or a flat rate
  async computeWarrantyAmount(tenantId: string, proformaId: string) {
    const pf = await prisma.proformaInvoice.findUnique({ where: { id: proformaId } });
    if (!pf) throw new Error('Proforma not found');
    const items = (pf as any).lineItemsJson?.items || [];
    let subtotal = 0;
    for (const it of items) { if (it.amount) subtotal += Number(it.amount); }
    // warranty: 2% of subtotal, min 50 USD
    const amount = Math.max(50, Number(new Decimal(subtotal).mul(0.02).toFixed(2)));
    return amount;
  }

  async upsertWarranty(tenantId: string, proformaId: string, selected: boolean) {
    const amount = await this.computeWarrantyAmount(tenantId, proformaId);
    const existing = await prisma.warrantySelection.findFirst({ where: { tenantId, proformaId } });
    if (existing) {
      const updated = await prisma.warrantySelection.update({ where: { id: existing.id }, data: { selected, addedAmountUsd: selected ? amount : 0 } });
      await this.recalcProformaTotals(tenantId, proformaId);
      return updated;
    }
    const created = await prisma.warrantySelection.create({ data: { tenantId, proformaId, selected, addedAmountUsd: selected ? amount : 0 } });
    await this.recalcProformaTotals(tenantId, proformaId);
    return created;
  }

  async recalcProformaTotals(tenantId: string, proformaId: string) {
    const pf = await prisma.proformaInvoice.findUnique({ where: { id: proformaId } });
    if (!pf) throw new Error('Proforma not found');
    const items = (pf as any).lineItemsJson?.items || [];
    const warranty = await prisma.warrantySelection.findFirst({ where: { tenantId, proformaId } });
    // remove existing warranty line if present
    const filtered = (items as any[]).filter((it: any) => it.name !== 'Exporter Warranty');
    if (warranty && warranty.selected) {
      filtered.push({ name: 'Exporter Warranty', amount: Number(warranty.addedAmountUsd) });
    }
    let total = 0;
    for (const it of filtered) { if (it.amount) total += Number(it.amount); }
    const updated = await prisma.proformaInvoice.update({ where: { id: proformaId }, data: { lineItemsJson: { items: filtered }, total } });
    return updated;
  }
}

export default new WarrantyService();
