import { prisma } from '../prismaClient';
import notifications, { NotificationTemplates } from '../utils/notifications';

export async function approvePaymentProof(proofId: string, actor: { id?: string; type?: string } = {}) {
  const proof = await prisma.paymentProof.findUnique({ where: { id: proofId } });
  if (!proof) throw new Error('Payment proof not found');

  // mark approved and invoice paid
  await prisma.$transaction([
    prisma.paymentProof.update({ where: { id: proofId }, data: { status: 'APPROVED' } as any }),
    prisma.proformaInvoice.update({ where: { id: proof.invoiceId }, data: { status: 'PAID' } as any }).catch(() => null),
    prisma.auditLog.create({ data: { action: 'PAYMENT_PROOF_APPROVED', entityType: 'PaymentProof', entityId: proof.id, actorId: actor.id || 'system', actorType: actor.type || 'admin' } as any }),
  ]);

  // Notify buyer if linked to invoice
  const invoice = await prisma.proformaInvoice.findUnique({ where: { id: proof.invoiceId }, include: { buyers: true } }).catch(() => null);
  if (invoice && invoice.buyerId) {
    const b = invoice.buyers as any;
    const buyerName = b?.name || `${b?.firstName || ''} ${b?.lastName || ''}`.trim() || 'Buyer';
    const amount = Number(invoice.total || invoice.amount || 0);
    const currency = invoice.currency || 'USD';
    const ev = NotificationTemplates.paymentReceived(amount, currency, buyerName);
    await notifications.notifyBuyer(invoice.tenantId, invoice.buyerId, ev).catch(() => null);
  }

  // Notify submitter user if present
  if (proof.submittedByUserId) {
    await notifications.notifyUser(proof.tenantId, proof.submittedByUserId, {
      type: 'payment_proof_approved',
      title: 'Payment proof approved',
      message: `Your payment proof has been approved and the invoice marked as paid.`,
    } as any).catch(() => null);
  }

  return { ok: true };
}

export async function rejectPaymentProof(proofId: string, actor: { id?: string; type?: string } = {}, reason?: string) {
  const proof = await prisma.paymentProof.findUnique({ where: { id: proofId } });
  if (!proof) throw new Error('Payment proof not found');

  await prisma.$transaction([
    prisma.paymentProof.update({ where: { id: proofId }, data: { status: 'REJECTED', rejectionReason: reason || null } as any }),
    prisma.auditLog.create({ data: { action: 'PAYMENT_PROOF_REJECTED', entityType: 'PaymentProof', entityId: proof.id, actorId: actor.id || 'system', actorType: actor.type || 'admin' } as any }),
  ]);

  // notify buyer via invoice (include reason in message)
  const invoice = await prisma.proformaInvoice.findUnique({ where: { id: proof.invoiceId }, include: { buyers: true } }).catch(() => null);
  if (invoice && invoice.buyerId) {
    const ev = {
      type: 'payment_proof_rejected',
      title: 'Payment proof rejected',
      message: `Your payment proof for invoice ${invoice.proformaNo || invoice.id} was rejected. ${reason || ''}`,
      metadata: { reason }
    } as any;
    await notifications.notifyBuyer(invoice.tenantId, invoice.buyerId, ev).catch(() => null);
  }

  if (proof.submittedByUserId) {
    await notifications.notifyUser(proof.tenantId, proof.submittedByUserId, {
      type: 'payment_proof_rejected',
      title: 'Payment proof rejected',
      message: `Your payment proof was rejected. ${reason || ''}`,
      metadata: { reason }
    } as any).catch(() => null);
  }

  return { ok: true };
}

export default { approvePaymentProof, rejectPaymentProof };
