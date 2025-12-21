import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/prismaClient';

export async function POST(req: NextRequest) {
  const input = await req.json();
  const base: Record<string, number> = { BASIC: 5000_00, PRO: 10000_00, ENTERPRISE: 25000_00 };
  let subtotal = base[input.plan] ?? base.BASIC;
  subtotal += (Number(input.staffCount) || 0) * 500_00;
  subtotal += (Number(input.branches) || 0) * 1000_00;
  const addOnMap: Record<string, number> = { AGENT_PWA: 2000_00, POS: 1500_00, EXPORTS: 1000_00, BACKUPS: 1200_00 };
  (input.addOns ?? []).forEach((a: string) => { subtotal += addOnMap[a] ?? 0; });
  let discount = 0;
  if (input.promoCode === 'PROMO10') discount = Math.round(subtotal * 0.10);
  const total = subtotal - discount;

  const reg = await prisma.tenantRegistration.upsert({
    where: { email: input.email ?? `pending-${Date.now()}@example.com` },
    update: { data: input, subtotalMinor: subtotal, discountMinor: discount, totalMinor: total, status: 'PENDING' },
    create: { data: input, subtotalMinor: subtotal, discountMinor: discount, totalMinor: total, status: 'PENDING' },
  });

  const invoice = await prisma.invoice.upsert({
    where: { externalRef: `REG-${reg.id}` },
    update: {},
    create: {
      tenantId: null,
      buyerId: null,
      currency: 'ZMW',
      totalMinor: total,
      paid: false,
      externalRef: `REG-${reg.id}`,
      lines: { create: [{ description: `Registration ${input.plan}`, quantity: 1, unitMinor: total }] },
    },
  });

  return NextResponse.json({ invoiceId: invoice.id, totalMinor: invoice.totalMinor });
}
