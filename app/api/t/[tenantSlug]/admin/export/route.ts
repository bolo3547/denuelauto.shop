import { NextRequest } from 'next/server';
import { prisma } from '@/src/prismaClient';
import { getTenantBySlug } from '@/src/utils/tenant';
import { requireTenantRole } from '@/src/middleware/auth';

export async function GET(req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const user = await requireTenantRole(req, params.tenantSlug, ['OWNER', 'MANAGER', 'IT']);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const resource = url.searchParams.get('resource') || 'inventory';
  const tenant = await getTenantBySlug(params.tenantSlug);
  if (!tenant) return new Response('Tenant not found', { status: 404 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`id,title,priceMinor\n`));
      const bs = 1000;
      let lastId: string | null = null;
      while (true) {
        const items = await prisma.stock.findMany({
          where: { tenantId: tenant.id },
          orderBy: { id: 'asc' },
          take: bs,
          ...(lastId ? { skip: 1, cursor: { id: lastId } } : {}),
        });
        if (items.length === 0) break;
        for (const it of items) {
          controller.enqueue(encoder.encode(`${it.id},${JSON.stringify(it.title)},${it.priceMinor}\n`));
        }
        lastId = items[items.length - 1].id;
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${resource}.csv"`,
    },
  });
}
