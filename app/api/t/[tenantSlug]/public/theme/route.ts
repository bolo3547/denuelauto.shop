import { NextResponse } from 'next/server';
import { prisma } from '@/src/prismaClient';

export async function GET(_: Request, { params }: { params: { tenantSlug: string } }) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: params.tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  const theme = await prisma.tenantTheme.findUnique({ where: { tenantId: tenant.id } });
  if (!theme) return NextResponse.json({ primary: '#1D4ED8', secondary: '#FFFFFF', accent: '#60A5FA', background: '#FFFFFF', text: '#0F172A', logoUrl: null, preset: 'AUTOCOM' });
  return NextResponse.json({ preset: theme.preset, primary: theme.primary, secondary: theme.secondary, accent: theme.accent, background: theme.background, text: theme.text, logoUrl: theme.logoUrl });
}
