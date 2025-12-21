import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/prismaClient';
import { getTenantBySlug } from '@/src/utils/tenant';
import { requireTenantRole } from '@/src/middleware/auth';

export async function POST(req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const user = await requireTenantRole(req, params.tenantSlug, ['FINANCE', 'OWNER', 'MANAGER']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantBySlug(params.tenantSlug);
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const body = await req.json();
  if (!body.invoiceId || !body.fileUrl) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  // TODO: Virus-scan file and validate content-type/size

  const proof = await prisma.paymentProof.create({
    data: {
      tenantId: tenant.id,
      invoiceId: body.invoiceId,
      status: 'PENDING',
      fileUrl: body.fileUrl,
      submittedByUserId: user.id,
      method: body.method ?? 'AIRTEL',
      meta: body.meta ?? {},
    },
  });

  await prisma.auditLog.create({
    data: { tenantId: tenant.id, action: 'PAYMENT_PROOF_CREATED', actorUserId: user.id, entityId: proof.id, entityType: 'PaymentProof' },
  });

  return NextResponse.json({ paymentProofId: proof.id, status: 'PENDING' });
}
