import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/prismaClient';

export async function POST(req: NextRequest, { params }: { params: { invoiceId: string } }) {
  const body = await req.json();
  if (!body.fileUrl) return NextResponse.json({ error: 'fileUrl required' }, { status: 400 });

  // TODO: validate invoice belongs to registration flow; CSRF/rate limiting
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
