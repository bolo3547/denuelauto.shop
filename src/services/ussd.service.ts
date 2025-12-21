import redisClient from '../config/redis';
import { PrismaClient } from '@prisma/client';
import { buildMenu, endMessage, parseTouchInput } from '../utils/ussd';
import crypto from 'crypto';

const prisma = new PrismaClient();

const TTL = 180; // seconds

export async function getSession(sessionId: string) {
  const raw = await redisClient.get(`ussd:${sessionId}`);
  return raw ? JSON.parse(raw) : null;
}

export async function saveSession(sessionId: string, session: any) {
  session.lastSeenAt = new Date().toISOString();
  await redisClient.setEx(`ussd:${sessionId}`, TTL, JSON.stringify(session));
}

export async function clearSession(sessionId: string) {
  await redisClient.del(`ussd:${sessionId}`);
}

export async function buildWelcome(tenantId: string) {
  const lines = [
    'Welcome to Denuel',
    '1) Type of cars',
    '2) How make payment',
    '3) Check Order',
    '4) Next page',
    '0) Help',
  ];
  return buildMenu(lines, 1);
}

export async function browseQuickList(tenantId: string, category?: string) {
  // Return top 3 cars in this tenant, quick list
  const cars = await prisma.car.findMany({ where: { tenantId, publishToPublic: true }, take: 3, orderBy: { updatedAt: 'desc' } });
  const lines = cars.map((c) => `${c.shortCode} ${c.make} ${c.model} ${c.year} ZMW ${c.priceLocalZmw}`);
  return buildMenu(lines, 1);
}

export async function findCarByShortCode(tenantId: string, shortCode: string) {
  return prisma.car.findFirst({ where: { tenantId, shortCode } });
}

export async function holdCar(tenantId: string, msisdn: string, stockNo: string) {
  // check availability
  const car = await prisma.car.findFirst({ where: { tenantId, stockNo, status: { not: 'sold' } } });
  if (!car) return { ok: false, reason: 'not_found' };
  // check existing hold
  const existing = await prisma.ussdCart.findFirst({ where: { tenantId, stockNo, status: 'held' } });
  if (existing) return { ok: false, reason: 'held' };
  const holdExpires = new Date(Date.now() + 30 * 60 * 1000);
  const cart = await prisma.ussdCart.create({ data: { tenantId, msisdn, stockNo, holdExpiresAt: holdExpires, status: 'held' } });
  // find or create buyer by phone
  let buyer = await prisma.buyer.findFirst({ where: { tenantId, phone: msisdn } });
  if (!buyer) {
    buyer = await prisma.buyer.create({ data: { tenantId, name: msisdn, phone: msisdn } as any });
  }
  // create hold record
  await prisma.hold.create({ data: { tenantId, carId: car.id, buyerId: buyer.id, amountUsd: car.priceUsd ?? 0, expiresAt: holdExpires, status: 'active' } as any });
  return { ok: true, cart, car };
}

export async function releaseExpiredHolds() {
  // find expired holds in ussd carts
  const now = new Date();
  const expired = await prisma.ussdCart.findMany({ where: { holdExpiresAt: { lte: now }, status: 'held' } });
  for (const c of expired) {
    await prisma.ussdCart.update({ where: { id: c.id }, data: { status: 'expired' } });
    await prisma.hold.updateMany({ where: { tenantId: c.tenantId, buyerId: c.msisdn, status: 'active' }, data: { status: 'released' } }).catch(() => null);
  }
}

export async function tenantFromChannel(text: string) {
  // Try extracting a tenant slug/code from a USSD channel prefix like *384*23*TEN#
  if (!text) return null;
  // remove leading * and trailing # if present
  const cleaned = text.replace(/^\*/, '').replace(/#$/, '');
  const parts = cleaned.split('*');
  // the last segment might be a tenant code like TEN
  const last = parts[parts.length-1];
  if (!last) return null;
  // find tenant by slug or by ussd channel
  const channel = await prisma.ussdChannel.findFirst({ where: { shortcode: { contains: last } } });
  if (channel) return channel.tenantId;
  const tenant = await prisma.tenant.findFirst({ where: { slug: last } });
  if (tenant) return tenant.id;
  return null;
}

export function msisdnHash(msisdn: string) {
  return crypto.createHash('sha256').update(msisdn).digest('hex');
}

export async function recordUssdAudit(tenantId: string | undefined, msisdn: string | undefined, event: string, data?: any) {
  try {
    const hash = msisdn ? msisdnHash(msisdn) : '';
    await prisma.ussdAudit.create({ data: { tenantId: tenantId ?? '', msisdnHash: hash, event, dataJson: data } as any });
  } catch (e) {
    console.error('Failed to write UssdAudit', e);
  }
}

export default { getSession, saveSession, clearSession, buildWelcome, browseQuickList, findCarByShortCode, holdCar, releaseExpiredHolds, tenantFromChannel, recordUssdAudit };
