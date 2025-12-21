import { NextResponse } from 'next/server';
import { prisma } from '@/src/prismaClient';

export async function GET(_: Request, { params }: { params: { invoiceId: string } }) {
  const invoice = await prisma.invoice.findUnique({ where: { id: params.invoiceId } });
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ paid: invoice.paid, totalMinor: invoice.totalMinor });
}
