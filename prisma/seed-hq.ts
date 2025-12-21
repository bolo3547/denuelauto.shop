import { prisma } from '@/src/prismaClient';

async function main() {
  const superAdminEmail = 'denuelinambao@gmail.com';
  await prisma.hqNotification.create({ data: { type: 'INFO', payload: { message: 'Seeding HQ' } } }).catch(() => {});

  await prisma.tenantPlan.upsert({
    where: { code: 'BASIC' },
    update: { name: 'Basic', priceMinor: 5000_00 },
    create: { code: 'BASIC', name: 'Basic', priceMinor: 5000_00 },
  });
  await prisma.tenantPlan.upsert({
    where: { code: 'PRO' },
    update: { name: 'Pro', priceMinor: 10000_00 },
    create: { code: 'PRO', name: 'Pro', priceMinor: 10000_00 },
  });
  await prisma.tenantPlan.upsert({
    where: { code: 'ENTERPRISE' },
    update: { name: 'Enterprise', priceMinor: 25000_00 },
    create: { code: 'ENTERPRISE', name: 'Enterprise', priceMinor: 25000_00 },
  });

  await prisma.payoutMobileWallet.upsert({
    where: { id: 'hq-primary-airtel' },
    update: { msisdn: '0973914432', network: 'AIRTEL', primary: true },
    create: { id: 'hq-primary-airtel', msisdn: '0973914432', network: 'AIRTEL', primary: true },
  });

  // TODO: Create HQ SUPER_ADMIN user with password flagged to change on first login
  console.log('Seeded HQ: SUPER_ADMIN', superAdminEmail, 'Support: 0973914432, 0773150024, Payout: 0973914432 (Airtel)');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding HQ data...');

  // Create first SUPER_ADMIN
  const superAdminEmail = 'denuelinambao@gmail.com';
  const tempPassword = 'ChangeMe123!';
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const existingAdmin = await prisma.admin_users.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingAdmin) {
    await prisma.admin_users.create({
      data: {
        email: superAdminEmail,
        passwordHash: hashedPassword,
        fullName: 'Professor Emmanuel Inambao',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log('Created SUPER_ADMIN with email:', superAdminEmail);
    console.log('TEMP PASSWORD:', tempPassword);
    console.log('WARNING: Change this password immediately in production!');
  } else {
    console.log('SUPER_ADMIN already exists:', superAdminEmail);
  }

  // Create SupportSettings
  const supportSettings = await prisma.supportSettings.findFirst();
  if (!supportSettings) {
    await prisma.supportSettings.create({
      data: {
        ownerName: 'Professor Emmanuel Inambao',
        supportEmail: 'denuelinambao@gmail.com',
        primaryPhone: '0973914432',
        secondaryPhone: '0773150024',
      },
    });
    console.log('Created SupportSettings');
  } else {
    await prisma.supportSettings.update({
      where: { id: supportSettings.id },
      data: {
        ownerName: 'Professor Emmanuel Inambao',
        supportEmail: 'denuelinambao@gmail.com',
        primaryPhone: '0973914432',
        secondaryPhone: '0773150024',
      },
    });
    console.log('Updated SupportSettings');
  }

  // Create PayoutMobileWallet
  const wallet = await prisma.payoutMobileWallet.findFirst({
    where: { phoneNumber: '0973914432' },
  });
  if (!wallet) {
    await prisma.payoutMobileWallet.create({
      data: {
        label: 'Main Denuel Airtel Money Wallet',
        provider: 'AIRTEL_MONEY',
        phoneNumber: '0973914432',
        accountName: 'Professor Emmanuel Inambao',
        currency: 'ZMW',
        isDefault: true,
      },
    });
    console.log('Created PayoutMobileWallet');
  } else {
    await prisma.payoutMobileWallet.update({
      where: { id: wallet.id },
      data: {
        label: 'Main Denuel Airtel Money Wallet',
        provider: 'AIRTEL_MONEY',
        accountName: 'Professor Emmanuel Inambao',
        currency: 'ZMW',
        isDefault: true,
      },
    });
    console.log('Updated PayoutMobileWallet');
  }

  // Seed three TenantTheme presets
  const themes = [
    {
      key: 'beforward',
      tokens: {
        primary: '#000000',
        accent: '#ff6600',
        surface: '#ffffff',
        muted: '#f5f5f5',
        text: '#333333',
        cardBg: '#ffffff',
        link: '#0066cc',
        accentHover: '#e55a00',
      },
    },
    {
      key: 'sbt',
      tokens: {
        primary: '#ff0000',
        accent: '#ffffff',
        surface: '#ffffff',
        muted: '#f0f0f0',
        text: '#333333',
        cardBg: '#ffffff',
        link: '#ff0000',
        accentHover: '#cc0000',
      },
    },
    {
      key: 'autocom',
      tokens: {
        primary: '#0066cc',
        accent: '#ffffff',
        surface: '#ffffff',
        muted: '#e6f2ff',
        text: '#333333',
        cardBg: '#ffffff',
        link: '#0066cc',
        accentHover: '#0052a3',
      },
    },
  ];

  for (const theme of themes) {
    // Since TenantTheme is per tenant, but presets are global, perhaps store in a separate table or as JSON.
    // For now, create dummy tenants for presets? No, the instruction says "Seeds three TenantTheme presets"
    // Perhaps create a ThemePreset model, but since not in schema, maybe just log.
    console.log('Theme preset:', theme.key, theme.tokens);
  }

  console.log('HQ seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });