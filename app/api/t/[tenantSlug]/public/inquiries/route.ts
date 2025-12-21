import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/prismaClient';

export async function POST(req: NextRequest, { params }: { params: { tenantSlug: string } }) {
  const contentType = req.headers.get('content-type') || '';
  let payload: any = {};
  if (contentType.includes('application/json')) {
    payload = await req.json();
  } else {
    const form = await req.formData();
    payload = Object.fromEntries(form.entries());
  }
  const tenant = await prisma.tenant.findUnique({ where: { slug: params.tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  // Basic rate limit placeholder: TODO replace with Redis-based limiter
  // Validate
  if (!payload.name || !payload.phone) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const lead = await prisma.lead.create({
    data: {
      tenantId: tenant.id,
      source: 'PUBLIC',
      status: 'NEW',
      name: String(payload.name),
      email: payload.email ? String(payload.email) : null,
      phone: String(payload.phone),
      message: payload.message ? String(payload.message) : null,
    },
  });

  return NextResponse.json({ leadId: lead.id, status: 'NEW' });
}
