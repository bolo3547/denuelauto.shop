import { approvePaymentProof } from '../src/services/paymentProofs.service';
import { prisma } from '../src/prismaClient';

describe('PaymentProofs service', () => {
  it('approves a payment proof and notifies buyer and submitter', async () => {
    // create tenant, buyer, user, invoice, proof
    const tenant = await prisma.tenant.create({ data: { name: 'TP', slug: 'tp' } as any });
    const buyer = await prisma.buyers.create({ data: { email: 'b@example.com', firstName: 'B', lastName: 'User', tenantId: tenant.id } as any });
    const user = await prisma.user.create({ data: { email: 'u@example.com', tenantId: tenant.id, role: 'user' } as any });
    const invoice = await prisma.proformaInvoice.create({ data: { tenantId: tenant.id, carId: 'C1', proformaNo: 'PF-1', amount: 1000, total: 1000, buyerId: buyer.id, currency: 'USD' } as any });
    const proof = await prisma.paymentProof.create({ data: { tenantId: tenant.id, invoiceId: invoice.id, status: 'pending_upload', submittedByUserId: user.id } as any });

    await approvePaymentProof(proof.id, { id: 'test', type: 'test' });

    const updated = await prisma.paymentProof.findUnique({ where: { id: proof.id } });
    expect(updated?.status).toBe('APPROVED');

    const notes = await prisma.tenantNotification.findMany({ where: { tenantId: tenant.id } });
    expect(notes.length).toBeGreaterThan(0);
    const titles = notes.map(n => n.title);
    expect(titles).toContain('Payment Received');
  });

  it('rejects a payment proof and persists reason and notifies with reason', async () => {
    const tenant = await prisma.tenant.create({ data: { name: 'TP2', slug: 'tp2' } as any });
    const buyer = await prisma.buyers.create({ data: { email: 'b2@example.com', firstName: 'B2', lastName: 'User', tenantId: tenant.id } as any });
    const user = await prisma.user.create({ data: { email: 'u2@example.com', tenantId: tenant.id, role: 'user' } as any });
    const invoice = await prisma.proformaInvoice.create({ data: { tenantId: tenant.id, carId: 'C2', proformaNo: 'PF-2', amount: 500, total: 500, buyerId: buyer.id, currency: 'USD' } as any });
    const proof = await prisma.paymentProof.create({ data: { tenantId: tenant.id, invoiceId: invoice.id, status: 'pending_upload', submittedByUserId: user.id } as any });

    const reason = 'Insufficient evidence';
    const { rejectPaymentProof } = require('../src/services/paymentProofs.service');
    await rejectPaymentProof(proof.id, { id: 'test', type: 'test' }, reason);

    const updated = await prisma.paymentProof.findUnique({ where: { id: proof.id } });
    expect(updated?.status).toBe('REJECTED');
    expect(updated?.rejectionReason).toBe(reason);

    const notes = await prisma.tenantNotification.findMany({ where: { tenantId: tenant.id } });
    expect(notes.length).toBeGreaterThan(0);
    const msgs = notes.map(n => n.message);
    expect(msgs.some(m => m.includes('Insufficient evidence'))).toBeTruthy();
  });
});
