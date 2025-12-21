import { NextResponse } from 'next/server';
import { prisma } from '@/src/prismaClient';

export async function GET(_: Request, { params }: { params: { tenantSlug: string; stockNo: string } }) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: params.tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  const item = await prisma.stock.findFirst({ where: { tenantId: tenant.id, stockNo: params.stockNo }, include: { images: true, videos: true } });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}
