import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTenantCrmData(tenantSlug: string) {
  try {
    // Find the tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug }
    });

    if (!tenant) {
      throw new Error(`Tenant with slug '${tenantSlug}' not found`);
    }

    console.log(`🌱 Seeding CRM data for tenant: ${tenant.name} (${tenantSlug})`);

    // Check if agents already exist for this tenant
    const existingAgents = await prisma.agent.count({
      where: { tenantId: tenant.id }
    });

    if (existingAgents > 0) {
      console.log(`✅ Tenant ${tenantSlug} already has ${existingAgents} agents. Skipping agent seeding.`);
      return;
    }

    // Create sample agents
    const sampleAgents = [
      {
        name: 'John Mukamana',
        email: `john.mukamana@${tenantSlug}.com`,
        phone: '+260971234567',
        referralCode: `JM${tenantSlug.toUpperCase().slice(0, 3)}`,
        country: 'Zambia',
        commissionPercent: 5.0,
        status: 'ACTIVE',
        skills: ['sedan', 'suv', 'luxury'],
        maxLeadsPerDay: 15,
        workingHours: {
          start: '08:00',
          end: '18:00',
          timezone: 'Africa/Lusaka',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      },
      {
        name: 'Sarah Mwanza',
        email: `sarah.mwanza@${tenantSlug}.com`,
        phone: '+260977654321',
        referralCode: `SM${tenantSlug.toUpperCase().slice(0, 3)}`,
        country: 'Zambia',
        commissionPercent: 4.5,
        status: 'ACTIVE',
        skills: ['hatchback', 'sedan', 'family'],
        maxLeadsPerDay: 12,
        workingHours: {
          start: '09:00',
          end: '17:00',
          timezone: 'Africa/Lusaka',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        }
      },
      {
        name: 'David Banda',
        email: `david.banda@${tenantSlug}.com`,
        phone: '+260969876543',
        referralCode: `DB${tenantSlug.toUpperCase().slice(0, 3)}`,
        country: 'Zambia',
        commissionPercent: 6.0,
        status: 'ACTIVE',
        skills: ['luxury', 'suv', 'truck', 'commercial'],
        maxLeadsPerDay: 10,
        workingHours: {
          start: '07:00',
          end: '19:00',
          timezone: 'Africa/Lusaka',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      }
    ];

    const createdAgents = [];
    for (const agentData of sampleAgents) {
      const agent = await prisma.agent.create({
        data: {
          ...agentData,
          tenantId: tenant.id
        }
      });
      createdAgents.push(agent);
      console.log(`✅ Created agent: ${agent.name} (${agent.email})`);
    }

    // Create some sample leads for demonstration
    const sampleLeads = [
      {
        source: 'WEBSITE',
        status: 'NEW',
        priority: 'HIGH',
        name: 'Michael Phiri',
        email: 'michael.phiri@example.com',
        phone: '+260974111222',
        message: 'Interested in a reliable sedan under $15,000',
        country: 'Zambia',
        budget: 15000,
        tags: ['cash-buyer', 'urgent']
      },
      {
        source: 'PHONE',
        status: 'CONTACTED',
        priority: 'MEDIUM',
        name: 'Grace Tembo',
        email: 'grace.tembo@example.com',
        phone: '+260976333444',
        message: 'Looking for a family SUV with good fuel economy',
        country: 'Zambia',
        budget: 25000,
        tags: ['family', 'financing-needed'],
        agentId: createdAgents[0].id,
        assignedAt: new Date(),
        lastContactedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // tomorrow
      },
      {
        source: 'REFERRAL',
        status: 'QUALIFIED',
        priority: 'HIGH',
        name: 'James Sikazwe',
        email: 'james.sikazwe@example.com',
        phone: '+260978555666',
        message: 'Referred by John Mwamba. Looking for luxury vehicle',
        country: 'Zambia',
        budget: 45000,
        tags: ['luxury', 'vip', 'referral'],
        agentId: createdAgents[2].id,
        assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        lastContactedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        nextFollowUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // day after tomorrow
      }
    ];

    for (const leadData of sampleLeads) {
      const lead = await prisma.lead.create({
        data: {
          ...leadData,
          tenantId: tenant.id
        }
      });
      console.log(`✅ Created sample lead: ${lead.name} (${lead.status})`);

      // Create activity log for assigned leads
      if (lead.agentId) {
        await prisma.agentActivityLog.create({
          data: {
            tenantId: tenant.id,
            agentId: lead.agentId,
            leadId: lead.id,
            action: 'LEAD_ASSIGNED',
            description: `Lead ${lead.name} assigned to agent`,
            metadata: {
              leadSource: lead.source,
              priority: lead.priority,
              assignmentMethod: 'MANUAL'
            }
          }
        });
      }
    }

    console.log(`🎉 Successfully seeded CRM data for tenant: ${tenantSlug}`);
    console.log(`   - Created ${createdAgents.length} agents`);
    console.log(`   - Created ${sampleLeads.length} sample leads`);

  } catch (error) {
    console.error(`❌ Error seeding CRM data for tenant ${tenantSlug}:`, error);
    throw error;
  }
}

// CLI usage: npx tsx scripts/seed-tenant-crm.ts <tenant-slug>
if (require.main === module) {
  const tenantSlug = process.argv[2];
  
  if (!tenantSlug) {
    console.error('❌ Please provide a tenant slug: npm run seed-tenant-crm <slug>');
    process.exit(1);
  }

  seedTenantCrmData(tenantSlug)
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}