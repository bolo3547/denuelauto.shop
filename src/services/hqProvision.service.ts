import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { sendEmail } from '../utils/notifications';

const prisma = new PrismaClient();

export type ProvisionInput = {
  businessName?: string;
  contactName?: string;
  contactEmail?: string;
  businessType?: string;
  country?: string;
  primaryColor?: string;
};

export async function provisionTenant(input: ProvisionInput) {
  return await prisma.$transaction(async (tx) => {
    const slugBase = (input.businessName || input.contactName || `tenant-${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = slugBase;
    let counter = 1;
    while (await tx.tenant.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${counter++}`;
    }

    const tenant = await tx.tenant.create({ data: {
      name: input.businessName || input.contactName || 'Tenant',
      slug,
      theme: { primary: input.primaryColor || '#000000', accent: '#fff', surface: '#fff', text: '#000' },
      settings: { businessType: input.businessType || 'dealer', country: input.country || 'Zambia' }
    } as any });

    await tx.tenantsubscription.create({ data: { tenantId: tenant.id, plan: 'trial' } as any });

    const passwordHash = await bcrypt.hash('changeme', 10);
    const adminUser = await tx.user.create({ data: { tenantId: tenant.id, email: input.contactEmail, name: input.contactName || 'Admin', role: 'admin', passwordHash, status: 'active' } as any });

    await tx.branch.create({ data: { tenantId: tenant.id, name: 'Main Branch', address: '' } as any });

    try {
      if (input.contactEmail) {
        await sendEmail(input.contactEmail, 'Welcome', 'Your tenant has been created.');
      }
    } catch (e) {
      // ignore notification errors
    }

    return { tenant, adminUser };
  });
}

export default { provisionTenant };
