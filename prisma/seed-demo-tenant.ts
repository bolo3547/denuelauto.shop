import { prisma } from '@/src/prismaClient';

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-dealer' },
    update: { name: 'Demo Dealer' },
    create: { slug: 'demo-dealer', name: 'Demo Dealer' },
  });

  await prisma.tenantTheme.upsert({
    where: { tenantId: tenant.id },
    update: { preset: 'AUTOCOM', primary: '#1D4ED8', secondary: '#FFFFFF', accent: '#60A5FA', background: '#FFFFFF', text: '#0F172A' },
    create: { tenantId: tenant.id, preset: 'AUTOCOM', primary: '#1D4ED8', secondary: '#FFFFFF', accent: '#60A5FA', background: '#FFFFFF', text: '#0F172A' },
  });

  await prisma.tenantSettings.upsert({
    where: { tenantId: tenant.id },
    update: { supportPhones: '0973914432,0773150024', payoutPrimaryWallet: '0973914432' },
    create: { tenantId: tenant.id, supportPhones: '0973914432,0773150024', payoutPrimaryWallet: '0973914432' },
  });

  for (let i = 0; i < 10; i++) {
    await prisma.stock.upsert({
      where: { tenantId_stockNo: { tenantId: tenant.id, stockNo: `DEMO-${i}` } },
      update: { title: `Demo Car ${i}`, priceMinor: (5000 + i * 100) * 100 },
      create: { tenantId: tenant.id, stockNo: `DEMO-${i}`, title: `Demo Car ${i}`, priceMinor: (5000 + i * 100) * 100, coverUrl: 'https://picsum.photos/seed/demo/400/300' },
    });
  }

  await prisma.agent.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'agent@demo.local' } },
    update: { name: 'Demo Agent' },
    create: { tenantId: tenant.id, email: 'agent@demo.local', name: 'Demo Agent', passwordHash: '$2b$10$DEMO_SEED_HASH_PLACEHOLDER_CHANGE_IN_PRODUCTION' },
  });

  await prisma.lead.create({
    data: { tenantId: tenant.id, source: 'PUBLIC', status: 'NEW', name: 'Buyer', email: 'buyer@example.com', message: 'Interested in DEMO-1' },
  });

  await prisma.shippingRate.upsert({
    where: { id: 'demo-rate-lusaka' },
    update: { destination: 'Zambia', port: 'Dar', rateMinor: 1500_00, tenantId: tenant.id },
    create: { id: 'demo-rate-lusaka', destination: 'Zambia', port: 'Dar', rateMinor: 1500_00, tenantId: tenant.id },
  });

  console.log('Seeded demo tenant:', tenant.slug);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
