import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function createOrderFromCart(tenantId: string, cart: any, payment: any, buyerName?: string) {
  // Create proforma invoice (simple deposit line)
  const stockNo = cart.stockNo;
  const car = await prisma.car.findFirst({ where: { tenantId, stockNo } });
  const stubRef = `BF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  let buyerId = undefined as string | undefined;
  const buyer = await prisma.buyer.findFirst({ where: { tenantId, phone: cart.msisdn } });
  if (buyer) buyerId = buyer.id;
  const proforma = await prisma.proformaInvoice.create({ data: {
    tenantId,
    carId: car?.id ?? '',
    currency: 'ZMW',
    buyerId: buyerId ?? undefined,
    lineItemsJson: [{ label: 'Deposit', amount: Number(payment.amount) }],
    total: Number(payment.amount),
    status: 'part_paid',
    number: stubRef,
  } as any });
  const order = await prisma.order.create({ data: { tenantId, ref: stubRef, msisdn: cart.msisdn, buyerId: buyerId ?? undefined, proformaId: proforma.id, status: 'part_paid' } });
  // mark cart converted
  await prisma.ussdCart.update({ where: { id: cart.id }, data: { status: 'converted' } });
  return { order, proforma };
}

export default { createOrderFromCart };
