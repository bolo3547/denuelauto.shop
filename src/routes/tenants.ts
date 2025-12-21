import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
const router = Router();

// GET /api/tenants
router.get('/', async (req: Request, res: Response) => {
  const tenants = await prisma.tenant.findMany();
  res.json(tenants);
});

// GET /api/tenants/:slug/theme
router.get('/:slug/theme', async (req: Request, res: Response) => {
  const tenant = await prisma.tenant.findUnique({ where: { slug: req.params.slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json({ theme: tenant.theme });
});

// POST /api/tenants/register - self-service registration for new dealerships (wizard)
router.post('/register', async (req: Request, res: Response) => {
  const { 
    name, 
    email, 
    password, 
    phone, 
    country,
    businessType,
    branches,
    users,
    expectedInventory,
    features,
    paymentMethods,
    theme,
    monthlyPrice
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    // Generate a unique slug from the dealership name
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // Check if slug exists, append number if needed
    let existingSlug = await prisma.tenant.findUnique({ where: { slug } });
    let counter = 1;
    while (existingSlug) {
      slug = `${slug}-${counter}`;
      existingSlug = await prisma.tenant.findUnique({ where: { slug } });
      counter++;
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Build theme object with branding
    const tenantTheme = {
      primaryColor: theme?.colors?.primary || '#0057e7',
      headerColor: theme?.colors?.header || '#1a1a2e',
      footerColor: theme?.colors?.footer || '#16213e',
      bodyColor: theme?.colors?.body || '#ffffff',
      accentColor: theme?.colors?.accent || '#00c853',
      logo: theme?.logo || '',
    };

    // Build settings object
    const tenantSettings = {
      country: country || 'Zambia',
      phone: phone || '',
      businessType: businessType || 'used',
      expectedInventory: expectedInventory || '50-100',
      enabledFeatures: features || {},
      paymentMethods: paymentMethods || { cash: true, bank: true },
      plan: {
        monthlyPrice: monthlyPrice || 49,
        branches: branches || 1,
        users: users || 3,
        features: features || {},
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14-day trial
      },
    };

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        theme: tenantTheme,
        settings: tenantSettings,
      },
    });

    // Create admin user for this tenant
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email,
        passwordHash,
        role: 'dealer_owner',
      },
    });

    // Create branches based on user selection
    const branchCount = branches || 1;
    for (let i = 0; i < branchCount; i++) {
      await prisma.branch.create({
        data: {
          tenantId: tenant.id,
          name: i === 0 ? 'Main Branch' : `Branch ${i + 1}`,
          address: '',
        },
      });
    }

    console.log(`✅ New tenant registered: ${name} (${slug}) - Plan: $${monthlyPrice}/mo`);

    res.status(201).json({
      ok: true,
      tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
      user: { id: user.id, email: user.email, role: user.role },
      plan: {
        monthlyPrice: monthlyPrice || 49,
        trialDays: 14,
      },
    });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/tenants - create new tenant (onboarding)
router.post('/', async (req: Request, res: Response) => {
  const data = req.body;
  if (!data || !data.tenant || !data.tenant.name || !data.tenant.slug) return res.status(400).json({ error: 'Missing tenant data' });
  try {
    // ensure slug uniqueness
    const existing = await prisma.tenant.findUnique({ where: { slug: data.tenant.slug } });
    if (existing) return res.status(409).json({ error: 'Tenant slug already exists' });
    // create tenant
    const t = await prisma.tenant.create({ data: {
      name: data.tenant.name,
      slug: data.tenant.slug,
      theme: data.dealerSiteSettings || {},
      settings: {
        payments: data.paymentSettings || {},
        export: data.exportSettings || {},
      },
    } as any });
    res.status(201).json({ ok: true, tenant: { id: t.id, slug: t.slug, name: t.name } });
  } catch (err) {
    console.error('Create tenant failed', err);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// PATCH /api/tenants/:slug/theme - update theme
router.patch('/:slug/theme', async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const body = req.body;
  if (!body) return res.status(400).json({ error: 'Missing theme payload' });
  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    const updated = await prisma.tenant.update({ where: { id: tenant.id }, data: { theme: body } as any });
    res.json({ ok: true, theme: updated.theme });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update theme' });
  }
});

export default router;
