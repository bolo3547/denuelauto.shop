import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function processJob(job: any) {
  try {
    console.log('Processing job', job.id, job.type);
    if (job.type === 'hold_expiry') {
      const tenantId = job.tenantId;
      const now = new Date();
      const expired = await prisma.hold.findMany({ where: { tenantId, status: 'active', expiresAt: { lte: now } } });
      for (const h of expired) {
        await prisma.hold.update({ where: { id: h.id }, data: { status: 'released' } as any });
        await prisma.car.updateMany({ where: { id: h.carId, tenantId, status: 'reserved' }, data: { status: 'published' } });
      }
      await prisma.backgroundJob.update({ where: { id: job.id }, data: { status: 'done' } });
    } else if (job.type === 'billing_entitlements_refresh') {
      const tenants = await prisma.tenant.findMany();
      for (const t of tenants) {
        console.log('Refreshing entitlements for', t.id);
        // call to compute entitlements
        try {
          const subs = await prisma.billingSubscription.findMany({ where: { tenantId: t.id, status: 'active' } });
          // simple logic: pick latest plan
          const last = subs.sort((a, b) => (a.updatedAt.getTime() - b.updatedAt.getTime())).pop();
          if (last) {
            // set entitlements based on plan key
            await prisma.entitlements.upsert({ where: { tenantId: t.id }, update: { modulesJson: last.entitlementsJson as any }, create: { tenantId: t.id, modulesJson: last.entitlementsJson as any } });
          }
        } catch (err) { console.error(err); }
      }
      await prisma.backgroundJob.update({ where: { id: job.id }, data: { status: 'done' } });
    } else if (job.type === 'domain_cert_renewal') {
      // find domains expiring soon; mock renew
      const soon = await prisma.customDomain.findMany({ where: { status: 'active' } });
      for (const d of soon) {
        await prisma.customDomain.update({ where: { id: d.id }, data: { certMeta: { renewedAt: new Date() } as any } });
      }
      await prisma.backgroundJob.update({ where: { id: job.id }, data: { status: 'done' } });
    } else {
      // special: ussd_cleanup job
      if (job.type === 'ussd_cleanup') {
        const now = new Date();
        const expired = await prisma.ussdCart.findMany({ where: { holdExpiresAt: { lte: now }, status: 'held' } });
        for (const c of expired) {
          await prisma.ussdCart.update({ where: { id: c.id }, data: { status: 'expired' } });
          await prisma.hold.updateMany({ where: { tenantId: c.tenantId, buyerId: c.msisdn, status: 'active' }, data: { status: 'released' } }).catch(() => null);
        }
        await prisma.backgroundJob.update({ where: { id: job.id }, data: { status: 'done' } });
      }
      // mark done
      await prisma.backgroundJob.update({ where: { id: job.id }, data: { status: 'done' } });
    }
  } catch (err: any) {
    await prisma.backgroundJob.update({ where: { id: job.id }, data: { attempts: job.attempts + 1, lastError: err.message, nextRunAt: new Date(Date.now() + 1000 * 60 * 5) } });
  }
}

async function run() {
  console.log('Job runner started');
  setInterval(async () => {
    const now = new Date();
    const job = await prisma.backgroundJob.findFirst({ where: { status: 'queued', nextRunAt: { lte: now } }, orderBy: { nextRunAt: 'asc' } });
    if (job) {
      await prisma.backgroundJob.update({ where: { id: job.id }, data: { status: 'running' } });
      await processJob(job);
    }
  }, 10000);
}

run().catch((e) => { console.error(e); process.exit(1); });
