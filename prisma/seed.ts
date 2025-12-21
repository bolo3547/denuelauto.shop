import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Sample Dealer',
      slug: 'sample-dealer',
      theme: { primaryColor: '#0057e7' },
      settings: {
        payments: { card_enabled: true, paypal_enabled: true },
        warranty: { exporter_enabled: true, terms_url: 'https://example.com/warranty-terms.pdf' },
        loyalty: { points_per_usd: 1, min_redeem_points: 50 },
        fx: { usd_to_zmw: 24.5 }
      },
    },
  });
  console.log('Created tenant:', tenant.slug);

  // Branches
  const branch1 = await prisma.branch.create({ data: { tenantId: tenant.id, name: 'Lusaka', address: 'Main Road, Lusaka', phone: '0123456789' } });
  const branch2 = await prisma.branch.create({ data: { tenantId: tenant.id, name: 'Kitwe', address: 'Industrial, Kitwe', phone: '0987654321' } });
  console.log('Created branches');

  // Backend user for tenant admin
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.create({ data: { tenantId: tenant.id, email: 'admin@sample-dealer.com', passwordHash, role: 'dealer_owner' } });

  // Create agent users first, then agents
  const agentUser1 = await prisma.user.create({ data: { tenantId: tenant.id, email: 'agent-a@sample-dealer.com', passwordHash, role: 'agent' } });
  const agentUser2 = await prisma.user.create({ data: { tenantId: tenant.id, email: 'agent-b@sample-dealer.com', passwordHash, role: 'agent' } });

  // Agents (linked to users)
  const agent1 = await prisma.agent.create({
    data: {
      userId: agentUser1.id,
      tenantId: tenant.id,
      agentCode: 'AGENT-A',
      name: 'Agent A',
      email: 'agent-a@sample-dealer.com',
      phone: '0777777777',
      baseCommission: 5.0,
      status: 'ACTIVE',
      referralCode: 'REF-AGENT-A'
    }
  });
  const agent2 = await prisma.agent.create({
    data: {
      userId: agentUser2.id,
      tenantId: tenant.id,
      agentCode: 'AGENT-B',
      name: 'Agent B',
      email: 'agent-b@sample-dealer.com',
      phone: '0777777778',
      baseCommission: 7.0,
      status: 'ACTIVE',
      referralCode: 'REF-AGENT-B'
    }
  });
  console.log('Created users and agents');

  // Buyers
  const buyer = await prisma.buyer.create({ data: { tenantId: tenant.id, firstName: 'Buyer', lastName: 'One', email: 'buyer@example.com', phone: '077700001' } });
  console.log('Created buyer');

  // Export Ports and rules
  const port1 = await prisma.exportPort.create({ data: { tenantId: tenant.id, name: 'Dar es Salaam', country: 'Tanzania' } });
  await prisma.exportPriceRule.create({ data: { tenantId: tenant.id, portId: port1.id, baseUsd: 100, freightUsd: 800, insuranceRatePct: 1.5 } });
  console.log('Created export ports');

  // Sample cars
  const car1 = await prisma.car.create({
    data: {
      tenantId: tenant.id,
      stockNo: 'SAMPLE-001',
      vin: 'JH4KA8260MC000000',
      make: 'Toyota',
      model: 'Corolla',
      year: 2018,
      bodyType: 'Sedan',
      transmission: 'Automatic',
      steering: 'RHD',
      colorExt: 'White',
      condition: 'used',
      priceLocalZmw: 120000.0,
      priceUsd: 6000.0,
      status: 'published',
      shortCode: 'D1234',
      publishToPublic: true,
      publishToExport: true,
      locationBranchId: branch1.id
    },
  });

  const car2 = await prisma.car.create({
    data: {
      tenantId: tenant.id,
      stockNo: 'SAMPLE-002',
      vin: 'JH4DA8260MC000000',
      make: 'Nissan',
      model: 'Note',
      year: 2019,
      bodyType: 'Hatchback',
      transmission: 'CVT',
      steering: 'RHD',
      colorExt: 'Silver',
      condition: 'used',
      priceLocalZmw: 90000.0,
      priceUsd: 4500.0,
      status: 'published',
      shortCode: 'D6678',
      publishToPublic: true,
      publishToExport: true,
      locationBranchId: branch2.id
    },
  });

  const car3 = await prisma.car.create({
    data: {
      tenantId: tenant.id,
      stockNo: 'SAMPLE-003',
      make: 'Honda',
      model: 'Fit',
      year: 2020,
      bodyType: 'Hatchback',
      transmission: 'Automatic',
      steering: 'RHD',
      colorExt: 'Blue',
      condition: 'used',
      priceLocalZmw: 150000.0,
      priceUsd: 7500.0,
      status: 'published',
      shortCode: 'D9999',
      publishToPublic: true,
      publishToExport: false,
      locationBranchId: branch1.id
    },
  });

  const car4 = await prisma.car.create({
    data: {
      tenantId: tenant.id,
      stockNo: 'SAMPLE-004',
      make: 'Mazda',
      model: 'CX-5',
      year: 2021,
      bodyType: 'SUV',
      transmission: 'Automatic',
      steering: 'RHD',
      colorExt: 'Black',
      condition: 'used',
      priceLocalZmw: 280000.0,
      priceUsd: 12000.0,
      status: 'draft',
      shortCode: 'D4444',
      publishToPublic: false,
      publishToExport: false,
      locationBranchId: branch1.id
    },
  });
  console.log('Created cars');

  // Car Dimensions
  await prisma.carDimension.create({ data: { tenantId: tenant.id, carId: car1.id, cbm: 6.0 } });
  await prisma.carDimension.create({ data: { tenantId: tenant.id, carId: car2.id, cbm: 5.2 } });

  // Leads
  await prisma.lead.create({ data: { tenantId: tenant.id, carId: car1.id, source: 'public', name: 'Lead One', email: 'lead1@example.com', phone: '076000001', message: 'Interested in this car' } });
  await prisma.lead.create({ data: { tenantId: tenant.id, carId: car2.id, source: 'agent', name: 'Lead Two', email: 'lead2@example.com', phone: '076000002' } });
  console.log('Created leads');

  // Quote
  await prisma.quote.create({
    data: {
      tenant: { connect: { id: tenant.id } },
      car: { connect: { id: car1.id } },
      quoteNo: 'QT-0001',
      amount: 120000.0,
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      status: 'open'
    }
  });

  // Proforma
  const proforma = await prisma.proformaInvoice.create({
    data: {
      tenantId: tenant.id,
      carId: car1.id,
      buyerId: buyer.id,
      agentId: agent1.id,
      proformaNo: 'PF-0001',
      currency: 'USD',
      amount: 6000.0,
      status: 'sent'
    }
  });

  // Payment
  await prisma.payment.create({ data: { tenantId: tenant.id, ref: 'PAY-001', carId: car1.id, proformaId: proforma.id, buyerId: buyer.id, method: 'bank', currency: 'USD', amount: 6000.0, status: 'pending', hash: 'demo' } });
  console.log('Created payments');

  // FX Settings
  await prisma.fxSetting.upsert({ where: { tenantId: tenant.id }, create: { tenantId: tenant.id, usdToLocal: 24.5, minMarginPct: 3.0 }, update: {} });

  // Affiliate (simplified)
  await prisma.affiliate.create({ data: { tenantId: tenant.id, name: 'Partner Affiliate' } });

  // AgentDeal
  await prisma.agentDeal.create({ 
    data: { 
      tenantId: tenant.id, 
      agentId: agent1.id, 
      carId: car1.id, 
      stage: 'in_transit', 
      commissionPercent: 5.0, 
      commissionAmount: 300.0, 
      locked: true, 
      lockedAt: new Date() 
    } 
  });

  // CommissionStatement (simplified - only basic fields)
  await prisma.commissionStatement.create({ 
    data: { 
      tenantId: tenant.id, 
      agentId: agent1.id
    } 
  });
  console.log('Created agent deals');

  // Additional tenants for multi-tenant testing
  const retailTenant = await prisma.tenant.create({ data: { name: 'Retail Dealer', slug: 'retail', settings: {} } });
  const rentalTenant = await prisma.tenant.create({ data: { name: 'Rental Dealer', slug: 'rental', settings: {} } });
  console.log('Created additional tenants');

  console.log('\n✅ Seed complete.');
  console.log('\nDemo credentials:');
  console.log('  Admin: admin@sample-dealer.com / password123');
  console.log('  Agent A: agent-a@sample-dealer.com / password123');
  console.log('  Agent B: agent-b@sample-dealer.com / password123');
  console.log('  Tenant slug: sample-dealer');

  // HQ Super Admin
  const superAdminEmail = 'denuelinambao@gmail.com';
  const superAdminName = 'Professor Emmanuel Inambao';
  const existingAdmin = await prisma.admin_users.findUnique({ where: { email: superAdminEmail } }).catch(() => null);
  if (!existingAdmin) {
    const hqPasswordHash = await bcrypt.hash('please-change-me', 10);
    await prisma.admin_users.create({ data: { email: superAdminEmail, passwordHash: hqPasswordHash, fullName: superAdminName, role: 'SUPER_ADMIN', isActive: true } });
    console.log('Created SUPER_ADMIN:', superAdminEmail);
  } else {
    await prisma.admin_users.update({ where: { email: superAdminEmail }, data: { fullName: superAdminName, role: 'SUPER_ADMIN', isActive: true } }).catch(() => null);
    console.log('Updated existing SUPER_ADMIN:', superAdminEmail);
  }
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
