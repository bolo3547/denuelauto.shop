import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/prismaClient';

export async function GET(req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const size = 20;
  const tenant = await prisma.tenant.findUnique({ where: { slug: params.tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  const [items, total] = await Promise.all([
    prisma.stock.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: 'desc' }, skip: (page-1)*size, take: size }),
    prisma.stock.count({ where: { tenantId: tenant.id } }),
  ]);
  return NextResponse.json({ items, page, total, hasMore: page*size < total });
}
