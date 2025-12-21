import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Demo Tenant Seed Script - Idempotent
 * Creates demo dealership with sample data
 */
async function seedDemoTenant() {
  console.log('🚀 Seeding Demo Tenant data...');

  try {
    // 1. Create Demo Tenant
    const demoTenant = await prisma.tenant.upsert({
      where: { slug: 'demo-dealer' },
      update: {
        name: 'Demo Auto Dealership',
        settings: {
          businessName: 'Demo Auto Dealership',
          contactEmail: 'demo@denuelauto.com',
          contactPhone: '+260971234567',
          address: '123 Demo Street, Lusaka, Zambia',
          businessRegistration: 'DEMO12345',
          timezone: 'Africa/Lusaka',
          currency: 'ZMW',
          language: 'en',
        },
      },
      create: {
        id: 'tenant-demo-001',
        name: 'Demo Auto Dealership',
        slug: 'demo-dealer',
        settings: {
          businessName: 'Demo Auto Dealership',
          contactEmail: 'demo@denuelauto.com',
          contactPhone: '+260971234567',
          address: '123 Demo Street, Lusaka, Zambia',
          businessRegistration: 'DEMO12345',
          timezone: 'Africa/Lusaka',
          currency: 'ZMW',
          language: 'en',
          features: {
            agentsEnabled: true,
            buyerPortalEnabled: true,
            serviceEnabled: true,
            advancedAnalytics: true,
          },
        },
      },
    });

    console.log(`✅ Demo tenant created: ${demoTenant.slug}`);

    // 2. Create Tenant Theme (Denuel Auto Default)
    await prisma.tenantTheme.upsert({
      where: { tenantId: demoTenant.id },
      update: {
        preset: 'CUSTOM',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        isActive: true,
      },
      create: {
        tenantId: demoTenant.id,
        preset: 'CUSTOM',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        fontFamily: 'Inter',
        borderRadius: '0.375rem',
        isActive: true,
      },
    });

    console.log('✅ Demo tenant theme configured');

    // 3. Create Demo Admin User
    const demoAdminEmail = 'admin@demo-dealer.com';
    const demoPassword = 'demo123';
    const hashedDemoPassword = await bcrypt.hash(demoPassword, 12);

    const demoAdmin = await prisma.user.upsert({
      where: { email: demoAdminEmail },
      update: {
        tenantId: demoTenant.id,
        role: 'TENANT_ADMIN',
        isActive: true,
      },
      create: {
        id: 'demo-admin-001',
        email: demoAdminEmail,
        name: 'Demo Administrator',
        tenantId: demoTenant.id,
        role: 'TENANT_ADMIN',
        passwordHash: hashedDemoPassword,
        isActive: true,
        emailVerifiedAt: new Date(),
      },
    });

    console.log(`✅ Demo admin created: ${demoAdmin.email} (password: ${demoPassword})`);

    // 4. Create Sample Cars
    const sampleCars = [
      {
        id: 'demo-car-001',
        stockNo: 'DEMO001',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        priceUsd: 25000,
        mileageKm: 45000,
        fuelType: 'GASOLINE',
        transmission: 'AUTOMATIC',
        bodyType: 'SEDAN',
        color: 'Silver',
        engineSize: '2.5L',
        description: 'Excellent condition Toyota Camry with full service history. Perfect for family use.',
        features: ['Air Conditioning', 'Power Steering', 'Electric Windows', 'ABS Brakes', 'Airbags'],
        images: [
          'https://via.placeholder.com/800x600/3B82F6/FFFFFF?text=Toyota+Camry+Front',
          'https://via.placeholder.com/800x600/10B981/FFFFFF?text=Toyota+Camry+Interior',
        ],
        location: 'Lusaka Yard A',
        status: 'AVAILABLE',
        published: true,
      },
      {
        id: 'demo-car-002',
        stockNo: 'DEMO002',
        make: 'Honda',
        model: 'Accord',
        year: 2019,
        priceUsd: 22000,
        mileageKm: 52000,
        fuelType: 'GASOLINE',
        transmission: 'AUTOMATIC',
        bodyType: 'SEDAN',
        color: 'Black',
        engineSize: '1.5L Turbo',
        description: 'Reliable Honda Accord with low mileage and excellent fuel economy.',
        features: ['Turbo Engine', 'Leather Seats', 'Sunroof', 'Navigation', 'Backup Camera'],
        images: [
          'https://via.placeholder.com/800x600/DC2626/FFFFFF?text=Honda+Accord+Front',
          'https://via.placeholder.com/800x600/F59E0B/FFFFFF?text=Honda+Accord+Side',
        ],
        location: 'Lusaka Yard B',
        status: 'AVAILABLE',
        published: true,
      },
    ];

    for (const car of sampleCars) {
      await prisma.car.upsert({
        where: { 
          tenantId_stockNo: {
            tenantId: demoTenant.id,
            stockNo: car.stockNo,
          }
        },
        update: {
          ...car,
          tenantId: demoTenant.id,
        },
        create: {
          ...car,
          tenantId: demoTenant.id,
        },
      });
    }

    console.log('✅ Sample cars created');

    // 5. Create Demo Agent
    const demoAgentEmail = 'agent@demo-dealer.com';
    const agentPassword = 'agent123';
    const hashedAgentPassword = await bcrypt.hash(agentPassword, 12);

    const demoAgent = await prisma.agent.upsert({
      where: { 
        email_tenantId: {
          email: demoAgentEmail,
          tenantId: demoTenant.id,
        }
      },
      update: {
        status: 'ACTIVE',
        commissionRate: 0.025, // 2.5%
      },
      create: {
        id: 'demo-agent-001',
        tenantId: demoTenant.id,
        email: demoAgentEmail,
        phone: '+260971234568',
        firstName: 'Demo',
        lastName: 'Agent',
        status: 'ACTIVE',
        commissionRate: 0.025, // 2.5%
        mobileWallet: '0971234568',
        walletProvider: 'AIRTEL_MONEY',
        passwordHash: hashedAgentPassword,
        emailVerifiedAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    console.log(`✅ Demo agent created: ${demoAgent.email} (password: ${agentPassword})`);

    // 6. Create Sample Leads
    const sampleLeads = [
      {
        id: 'demo-lead-001',
        firstName: 'John',
        lastName: 'Mukasa',
        email: 'john.mukasa@example.com',
        phone: '+260971111111',
        whatsapp: '+260971111111',
        status: 'NEW',
        priority: 'HIGH',
        source: 'WEBSITE',
        assignedAgentId: demoAgent.id,
        interestedCarId: 'demo-car-001',
        budget: 25000,
        notes: 'Interested in Toyota Camry. Looking for family car with good fuel economy.',
        nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      },
      {
        id: 'demo-lead-002',
        firstName: 'Sarah',
        lastName: 'Banda',
        email: 'sarah.banda@example.com',
        phone: '+260971111112',
        status: 'CONTACTED',
        priority: 'MEDIUM',
        source: 'PHONE',
        assignedAgentId: demoAgent.id,
        interestedCarId: 'demo-car-002',
        budget: 22000,
        notes: 'Called about Honda Accord. Needs financing options.',
        lastContactedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        nextFollowUpAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      },
    ];

    for (const lead of sampleLeads) {
      await prisma.lead.upsert({
        where: { 
          phone_tenantId: {
            phone: lead.phone,
            tenantId: demoTenant.id,
          }
        },
        update: {
          ...lead,
          tenantId: demoTenant.id,
        },
        create: {
          ...lead,
          tenantId: demoTenant.id,
        },
      });
    }

    console.log('✅ Sample leads created');

    // 7. Create Lead History Entries
    const leadHistoryEntries = [
      {
        leadId: 'demo-lead-001',
        action: 'CREATED',
        notes: 'Lead created from website inquiry form',
        createdBy: demoAgent.id,
      },
      {
        leadId: 'demo-lead-001',
        action: 'ASSIGNED',
        oldValue: null,
        newValue: demoAgent.id,
        notes: 'Assigned to demo agent for follow-up',
        createdBy: demoAdmin.id,
      },
      {
        leadId: 'demo-lead-002',
        action: 'CREATED',
        notes: 'Lead created from phone inquiry',
        createdBy: demoAgent.id,
      },
      {
        leadId: 'demo-lead-002',
        action: 'STATUS_CHANGE',
        oldValue: 'NEW',
        newValue: 'CONTACTED',
        notes: 'Initial phone call completed. Discussed financing options.',
        createdBy: demoAgent.id,
      },
    ];

    for (const history of leadHistoryEntries) {
      await prisma.leadHistory.create({
        data: {
          ...history,
          tenantId: demoTenant.id,
        },
      });
    }

    console.log('✅ Lead history created');

    // 8. Create Sample Shipping Rates (Placeholder)
    const shippingRates = [
      {
        id: 'demo-shipping-001',
        fromPort: 'Dar es Salaam',
        toPort: 'Durban',
        priceUsd: 1200,
        transitDays: 14,
        carrier: 'Demo Shipping Line',
        carType: 'SEDAN',
      },
      {
        id: 'demo-shipping-002',
        fromPort: 'Mombasa',
        toPort: 'Dar es Salaam',
        priceUsd: 800,
        transitDays: 7,
        carrier: 'Demo Shipping Line',
        carType: 'SEDAN',
      },
    ];

    for (const rate of shippingRates) {
      await prisma.shippingRate.upsert({
        where: { id: rate.id },
        update: rate,
        create: {
          ...rate,
          tenantId: demoTenant.id,
        },
      });
    }

    console.log('✅ Sample shipping rates created');

    // 9. Create Sample Invoice
    const sampleInvoice = await prisma.invoice.upsert({
      where: { invoiceNumber: 'DEMO-INV-001' },
      update: {
        tenantId: demoTenant.id,
      },
      create: {
        id: 'demo-invoice-001',
        tenantId: demoTenant.id,
        invoiceNumber: 'DEMO-INV-001',
        amountMinor: 5000000, // $50.00 USD
        currency: 'USD',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        description: 'Demo monthly subscription - Professional plan',
        metadata: {
          planId: 'plan-professional',
          billingPeriod: 'monthly',
        },
      },
    });

    console.log('✅ Sample invoice created');

    // 10. Create Agent Activity Log Entry
    await prisma.agentActivityLog.create({
      data: {
        tenantId: demoTenant.id,
        agentId: demoAgent.id,
        action: 'CREATE_LEAD',
        entityType: 'Lead',
        entityId: 'demo-lead-001',
        payload: {
          leadData: {
            firstName: 'John',
            lastName: 'Mukasa',
            phone: '+260971111111',
            source: 'WEBSITE',
          },
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Demo Seed Script',
      },
    });

    console.log('✅ Agent activity logged');

    console.log('🎉 Demo tenant seed completed successfully!');
    console.log('📊 Demo Data Summary:');
    console.log(`   - Tenant: ${demoTenant.name} (${demoTenant.slug})`);
    console.log(`   - Admin: ${demoAdmin.email} (password: ${demoPassword})`);
    console.log(`   - Agent: ${demoAgent.email} (password: ${agentPassword})`);
    console.log(`   - Cars: ${sampleCars.length} vehicles`);
    console.log(`   - Leads: ${sampleLeads.length} leads`);
    console.log(`   - Invoice: ${sampleInvoice.invoiceNumber}`);
    console.log('');
    console.log('🌐 Access URLs:');
    console.log(`   - Tenant Admin: /t/demo-dealer/admin`);
    console.log(`   - Agent Portal: /t/demo-dealer/agent`);
    console.log(`   - Public Catalog: /t/demo-dealer`);

  } catch (error) {
    console.error('❌ Error seeding demo tenant data:', error);
    throw error;
  }
}

async function main() {
  await seedDemoTenant();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { seedDemoTenant };