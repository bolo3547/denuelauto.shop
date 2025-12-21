import { NextRequest, NextResponse } from 'next/server';

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
  return NextResponse.json({ subtotalMinor: subtotal, discountMinor: discount, totalMinor: total });
}
