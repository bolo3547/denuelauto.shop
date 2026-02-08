import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/prismaClient';

export async function POST(req: NextRequest, { params }: { params: { invoiceId: string } }) {
  const body = await req.json();
  if (!body.fileUrl) return NextResponse.json({ error: 'fileUrl required' }, { status: 400 });

  // Validate invoice exists and belongs to registration flow
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.invoiceId },
  });
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  // Basic rate limiting: check if a proof was submitted in the last 60 seconds
  const recentProof = await prisma.paymentProof.findFirst({
    where: {
      invoiceId: params.invoiceId,
      createdAt: { gte: new Date(Date.now() - 60 * 1000) },
    },
  });
  if (recentProof) {
    return NextResponse.json({ error: 'Please wait before submitting another proof' }, { status: 429 });
  }

  const proof = await prisma.paymentProof.create({
    data: {
      tenantId: null,
      invoiceId: params.invoiceId,
      status: 'PENDING',
      fileUrl: body.fileUrl,
      method: body.method ?? 'AIRTEL',
      meta: body.meta ?? {},
    },
  });

  await prisma.auditLog.create({ data: { action: 'REG_PAYMENT_PROOF_CREATED', entityType: 'PaymentProof', entityId: proof.id } });
  return NextResponse.json({ paymentProofId: proof.id, status: 'PENDING' });
}
