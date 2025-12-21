import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/prismaClient';

export async function GET(req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: params.tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  const items = await prisma.stock.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: 'desc' }, take: 8 });
  return NextResponse.json({ items: items.map(i => ({ stockNo: i.stockNo, title: i.title, priceUsd: Math.round(i.priceMinor/100), coverUrl: i.coverUrl })) });
}
