import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * HQ Seed Script - Idempotent
 * Creates super admin, system settings, payout wallets, tenant plans, and theme presets
 */
async function seedHQ() {
  console.log('🚀 Seeding HQ data...');

  try {
    // 1. Create SUPER_ADMIN user
    const superAdminEmail = 'denuelinambao@gmail.com';
    const tempPassword = 'ChangeMe123!';
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const superAdmin = await prisma.user.upsert({
      where: { email: superAdminEmail },
      update: {
        // Don't update password if user exists
        role: 'SUPER_ADMIN',
        isActive: true,
      },
      create: {
        id: 'super-admin-001',
        email: superAdminEmail,
        name: 'Denuel Inambao',
        role: 'SUPER_ADMIN',
        passwordHash: hashedPassword,
        isActive: true,
        emailVerifiedAt: new Date(),
        createdAt: new Date(),
      },
    });

    console.log(`✅ Super Admin created: ${superAdmin.email}`);
    console.log(`⚠️  SECURITY WARNING: Change password for ${superAdminEmail} immediately!`);
    console.log(`   Temporary password: ${tempPassword}`);

    // 2. Create Support Settings (upsert pattern)
    const supportSettings = await prisma.systemSetting.upsert({
      where: { key: 'support_contact' },
      update: {
        value: {
          ownerName: 'Denuel Inambao',
          supportEmail: 'support@denuelauto.com',
          supportPhone: '+260973914432',
          emergencyPhone: '+260973914432',
          businessHours: '24/7',
          timezone: 'Africa/Lusaka',
        },
      },
      create: {
        key: 'support_contact',
        value: {
          ownerName: 'Denuel Inambao',
          supportEmail: 'support@denuelauto.com',
          supportPhone: '+260973914432',
          emergencyPhone: '+260973914432',
          businessHours: '24/7',
          timezone: 'Africa/Lusaka',
        },
      },
    });

    console.log('✅ Support settings configured');

    // 3. Create System Payout Mobile Wallet
    const systemPayout = await prisma.payoutMobileWallet.upsert({
      where: { 
        phoneNumber_provider: {
          phoneNumber: '0973914432',
          provider: 'AIRTEL_MONEY'
        }
      },
      update: {
        status: 'ACTIVE',
      },
      create: {
        id: 'system-payout-001',
        tenantId: null, // System-level payout
        provider: 'AIRTEL_MONEY',
        phoneNumber: '0973914432',
        amountMinor: 0,
        currency: 'ZMW',
        status: 'ACTIVE',
        metadata: {
          isSystemWallet: true,
          description: 'System payout wallet for Denuel Auto',
        },
      },
    });

    console.log('✅ System payout wallet configured');

    // 4. Create Tenant Plans
    const plans = [
      {
        id: 'plan-starter',
        name: 'Starter',
        priceMinor: 2500000, // $25.00 USD
        currency: 'USD',
        billingCycle: 'MONTHLY',
        features: {
          maxCars: 50,
          maxAgents: 2,
          maxPhotosPerCar: 10,
          agentsEnabled: true,
          buyerPortalEnabled: false,
          serviceEnabled: false,
          advancedAnalytics: false,
          customTheme: false,
        },
      },
      {
        id: 'plan-professional',
        name: 'Professional',
        priceMinor: 7500000, // $75.00 USD
        currency: 'USD',
        billingCycle: 'MONTHLY',
        features: {
          maxCars: 200,
          maxAgents: 10,
          maxPhotosPerCar: 20,
          agentsEnabled: true,
          buyerPortalEnabled: true,
          serviceEnabled: true,
          advancedAnalytics: true,
          customTheme: true,
        },
      },
      {
        id: 'plan-enterprise',
        name: 'Enterprise',
        priceMinor: 15000000, // $150.00 USD
        currency: 'USD',
        billingCycle: 'MONTHLY',
        features: {
          maxCars: 1000,
          maxAgents: 50,
          maxPhotosPerCar: 50,
          agentsEnabled: true,
          buyerPortalEnabled: true,
          serviceEnabled: true,
          advancedAnalytics: true,
          customTheme: true,
          apiAccess: true,
          whitelabeling: true,
        },
      },
    ];

    for (const plan of plans) {
      await prisma.tenantPlan.upsert({
        where: { id: plan.id },
        update: plan,
        create: plan,
      });
    }

    console.log('✅ Tenant plans created');

    // 5. Create Theme Presets
    const themePresets = [
      {
        id: 'theme-be-forward',
        name: 'Professional Blue Theme',
        preset: 'BE_FORWARD',
        primaryColor: '#1E40AF',
        secondaryColor: '#DC2626',
        accentColor: '#F59E0B',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        fontFamily: 'Arial',
        borderRadius: '0.25rem',
      },
      {
        id: 'theme-sbt-japan',
        name: 'SBT Japan Style',
        preset: 'SBT_JAPAN',
        primaryColor: '#DC2626',
        secondaryColor: '#1E40AF',
        accentColor: '#059669',
        backgroundColor: '#F9FAFB',
        textColor: '#111827',
        fontFamily: 'Helvetica',
        borderRadius: '0.375rem',
      },
      {
        id: 'theme-autocom',
        name: 'AutoCom Style',
        preset: 'AUTOCOM',
        primaryColor: '#059669',
        secondaryColor: '#7C3AED',
        accentColor: '#DC2626',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        fontFamily: 'Inter',
        borderRadius: '0.5rem',
      },
      {
        id: 'theme-denuel-default',
        name: 'Denuel Auto Default',
        preset: 'CUSTOM',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        fontFamily: 'Inter',
        borderRadius: '0.375rem',
      },
    ];

    for (const theme of themePresets) {
      await prisma.themePreset.upsert({
        where: { id: theme.id },
        update: theme,
        create: theme,
      });
    }

    console.log('✅ Theme presets created');

    // 6. Create Feature Flags
    const featureFlags = [
      { key: 'agent_offline_sync', value: true, description: 'Enable agent offline sync functionality' },
      { key: 'payment_proof_upload', value: true, description: 'Enable payment proof upload system' },
      { key: 'mobile_money_integration', value: false, description: 'Enable live mobile money API integration' },
      { key: 'whatsapp_business_api', value: false, description: 'Enable WhatsApp Business API integration' },
      { key: 'ai_lead_scoring', value: false, description: 'Enable AI-powered lead scoring' },
      { key: 'advanced_analytics', value: true, description: 'Enable advanced analytics dashboard' },
    ];

    for (const flag of featureFlags) {
      await prisma.systemSetting.upsert({
        where: { key: `feature_${flag.key}` },
        update: { value: flag.value },
        create: {
          key: `feature_${flag.key}`,
          value: flag.value,
          metadata: { description: flag.description },
        },
      });
    }

    console.log('✅ Feature flags configured');

    // 7. Create System Notifications Templates
    const notificationTemplates = [
      {
        id: 'payment-proof-approved',
        type: 'PAYMENT_PROOF_APPROVED',
        template: {
          subject: 'Payment Proof Approved - {{invoiceNumber}}',
          body: 'Your payment proof for invoice {{invoiceNumber}} has been approved. Amount: {{amount}} {{currency}}',
          channels: ['EMAIL', 'SMS', 'PUSH'],
        },
      },
      {
        id: 'payment-proof-rejected',
        type: 'PAYMENT_PROOF_REJECTED',
        template: {
          subject: 'Payment Proof Rejected - {{invoiceNumber}}',
          body: 'Your payment proof for invoice {{invoiceNumber}} was rejected. Reason: {{rejectionReason}}',
          channels: ['EMAIL', 'SMS', 'PUSH'],
        },
      },
    ];

    for (const template of notificationTemplates) {
      await prisma.systemSetting.upsert({
        where: { key: `notification_template_${template.id}` },
        update: { value: template.template },
        create: {
          key: `notification_template_${template.id}`,
          value: template.template,
          metadata: { type: template.type },
        },
      });
    }

    console.log('✅ Notification templates created');

    console.log('🎉 HQ seed completed successfully!');
    console.log('⚠️  NEXT STEPS:');
    console.log('   1. Change super admin password immediately');
    console.log('   2. Configure S3 credentials for file uploads');
    console.log('   3. Set up Airtel/MTN API keys for mobile money');
    console.log('   4. Configure SMTP settings for emails');
    console.log('   5. Set up WhatsApp Business API credentials');

  } catch (error) {
    console.error('❌ Error seeding HQ data:', error);
    throw error;
  }
}

async function main() {
  await seedHQ();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { seedHQ };