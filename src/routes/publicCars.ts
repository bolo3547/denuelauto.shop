import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { publicInquiryLimiter, publicWatchlistLimiter } from '../middleware/rateLimit';

const prisma = new PrismaClient();
const router = Router();

// Public catalog listing: /t/:slug/public/cars
router.get('/t/:slug/public/cars', async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const q = req.query;
  // Attribution cookie from agent param
  const agentRef = q.agent || q.agentRef;
  if (agentRef) {
    // set cookie for 30 days
    res.cookie('agent_ref', agentRef, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: false });
    // try to find affiliate and record click
    try {
      const aff = await prisma.affiliate.findFirst({ where: { tenantId: tenant.id, referralCode: typeof agentRef === 'string' ? agentRef : Array.isArray(agentRef) ? agentRef[0] : '' } });
      if (aff) {
        await prisma.affiliateClick.create({ data: { tenantId: tenant.id, affiliateId: aff.id, ip: req.ip, ua: req.headers['user-agent'] || '' } as any });
      }
    } catch (err) { /** ignore errors */ }
  }

  // Build filters
  const where: any = { tenantId: tenant.id, publishToPublic: true, status: 'published' };
  if (q.make) where.make = q.make;
  if (q.model) where.model = q.model;
  // support body type filter (called 'type' from frontend)
  if (q.type) where.bodyType = q.type;
  // keyword search across model, title, stockNo
  if (q.q) {
    const keyword = String(q.q);
    where.OR = [
      { model: { contains: keyword, mode: 'insensitive' } },
      { title: { contains: keyword, mode: 'insensitive' } },
      { stockNo: { contains: keyword } }
    ];
  }
  if (q.minYear || q.maxYear) where.year = {};
  if (q.minYear) where.year.gte = Number(q.minYear);
  if (q.maxYear) where.year.lte = Number(q.maxYear);
  // support filtering by local price or USD price
  if (q.minPrice || q.maxPrice) where.priceLocalZmw = {};
  if (q.minPrice) where.priceLocalZmw.gte = Number(q.minPrice);
  if (q.maxPrice) where.priceLocalZmw.lte = Number(q.maxPrice);
  if (q.minPriceUsd || q.maxPriceUsd) where.priceUsd = {};
  if (q.minPriceUsd) where.priceUsd.gte = Number(q.minPriceUsd);
  if (q.maxPriceUsd) where.priceUsd.lte = Number(q.maxPriceUsd);

  // Pagination params (server-side)
  const page = Math.max(1, Number(q.page) || 1);
  let limit = Number(q.limit) || 12;
  if (limit <= 0) limit = 12;
  if (limit > 200) limit = 200; // cap to avoid heavy queries

  try {
    const total = await prisma.car.count({ where });
    const items = await prisma.car.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ items, total, page, limit });
  } catch (err) {
    console.error('Error fetching public cars:', err);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

// Browse endpoint that returns pagination + available filters: /t/:slug/public/cars/browse
router.get('/t/:slug/public/cars/browse', async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const q = req.query as any;

  const where: any = { tenantId: tenant.id, publishToPublic: true, status: 'published' };
  if (q.make) where.make = String(q.make);
  if (q.model) where.model = String(q.model);
  if (q.type) where.bodyType = String(q.type);
  if (q.q) {
    const keyword = String(q.q);
    where.OR = [
      { model: { contains: keyword, mode: 'insensitive' } },
      { title: { contains: keyword, mode: 'insensitive' } },
      { stockNo: { contains: keyword } },
    ];
  }

  // Year range
  if (q.yearMin || q.yearMax) where.year = {};
  if (q.yearMin) where.year.gte = Number(q.yearMin);
  if (q.yearMax) where.year.lte = Number(q.yearMax);

  // Mileage filters
  if (q.minMileage || q.maxMileage) where.mileage = {};
  if (q.minMileage) where.mileage.gte = Number(q.minMileage);
  if (q.maxMileage) where.mileage.lte = Number(q.maxMileage);

  // price filters
  if (q.minPriceUsd || q.maxPriceUsd) where.priceUsd = {};
  if (q.minPriceUsd) where.priceUsd.gte = Number(q.minPriceUsd);
  if (q.maxPriceUsd) where.priceUsd.lte = Number(q.maxPriceUsd);

  // fuel/transmission/color
  if (q.fuelType) where.fuelType = { in: (Array.isArray(q.fuelType) ? q.fuelType : String(q.fuelType).split(',')).map((s: string) => s.trim()) };
  if (q.transmission) where.transmission = { in: (Array.isArray(q.transmission) ? q.transmission : String(q.transmission).split(',')).map((s: string) => s.trim()) };
  if (q.colors) where.color = { in: (Array.isArray(q.colors) ? q.colors : String(q.colors).split(',')).map((s: string) => s.trim()) };
  if (q.bodyTypes) where.bodyType = { in: (Array.isArray(q.bodyTypes) ? q.bodyTypes : String(q.bodyTypes).split(',')).map((s: string) => s.trim()) };

  // location
  if (q.city) where.city = String(q.city);
  if (q.country) where.country = String(q.country);

  // Sorting
  const sortBy = String(q.sortBy || 'updatedAt');
  const sortOrder = (String(q.sortOrder || 'desc') as 'asc' | 'desc');
  const mapSortField: Record<string, string> = {
    price: 'priceUsd',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    year: 'year',
    mileage: 'mileage'
  };
  const orderField = mapSortField[sortBy] || 'updatedAt';
  const orderBy: any = { [orderField]: sortOrder };

  // Pagination
  const page = Math.max(1, Number(q.page) || 1);
  let limit = Number(q.limit) || 20;
  if (limit <= 0) limit = 20;
  if (limit > 200) limit = 200;

  try {
    const total = await prisma.car.count({ where });
    const items = await prisma.car.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: orderBy });

    // Compute available filter buckets: top makes and top models for UI
    const makesAgg = await prisma.car.groupBy({ by: ['make'], where, _count: { make: true } });
    const modelsAgg = await prisma.car.groupBy({ by: ['model'], where, _count: { model: true } });

    const filters = {
      makes: makesAgg.map(m => ({ value: m.make || 'Unknown', count: (m as any)._count?.make || 0 })),
      models: modelsAgg.map(m => ({ value: m.model || 'Unknown', count: (m as any)._count?.model || 0 })),
    };

    // Pagination pages
    const pages = Math.ceil(total / limit);

    res.json({ cars: items, pagination: { total, pages, page, limit }, filters });
  } catch (err) {
    console.error('Error fetching public cars (browse):', err);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

// Public car detail: /t/:slug/public/cars/:idOrStock
router.get('/t/:slug/public/cars/:idOrStock', async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const idOrStock = req.params.idOrStock;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const car = await prisma.car.findFirst({ where: { tenantId: tenant.id, OR: [{ id: idOrStock }, { stockNo: idOrStock }] } });
  if (!car) return res.status(404).json({ error: 'Car not found' });
  // if agent referral cookie set: record click
  const agentRef = req.cookies?.agent_ref || req.query.agent;
  if (agentRef) {
    try {
      const aff = await prisma.affiliate.findFirst({ where: { tenantId: tenant.id, referralCode: String(agentRef) } });
      if (aff) await prisma.affiliateClick.create({ data: { tenantId: tenant.id, affiliateId: aff.id, carId: car.id, ip: req.ip, ua: req.headers['user-agent'] || '' } as any });
    } catch (err) {}
  }
  // attach an active proforma id if any
  const activePf = await prisma.proformaInvoice.findFirst({ where: { tenantId: tenant.id, carId: car.id, status: { in: ['sent', 'part_paid'] } } });
  const carWithPf = { ...car, activeProformaId: activePf ? activePf.id : null };
  res.json(carWithPf);
});

// Export country guide: /t/:slug/export/:country
router.get('/t/:slug/export/:country', async (req: Request, res: Response) => {
  const { slug, country } = req.params;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const guide = await prisma.countryGuide.findFirst({ where: { tenantId: tenant.id, countryCode: country.toUpperCase(), isActive: true } });
  if (!guide) return res.status(404).json({ error: 'Guide not found for country' });
  // fetch relevant cars filtered for export
  const cars = await prisma.car.findMany({ where: { tenantId: tenant.id, publishToExport: true } });
  res.json({ guide, cars });
});

// public fx rate: GET /t/:slug/public/fx
router.get('/t/:slug/public/fx', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const fx = (tenant.settings as any)?.fx || {}; // { usd_to_zmw }
  res.json({ fx, updatedAt: tenant.updatedAt });
});

// Inquiry endpoint: POST /t/:slug/public/cars/inquiry
router.post('/t/:slug/public/cars/inquiry', publicInquiryLimiter, async (req: Request, res: Response) => {
  const inquirySchema = z.object({ name: z.string(), phone: z.string(), email: z.string().optional(), message: z.string().optional(), carId: z.string().optional() });
  const parsed = inquirySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });
  const { name, phone, email = '', message = '', carId } = parsed.data;
  const tenant = await prisma.tenant.findUnique({ where: { slug: req.params.slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const agentRef = req.cookies?.agent_ref || req.query.agent;
  let assignedTo = undefined as string | undefined;
  if (agentRef) {
    const agent = await prisma.agent.findFirst({ where: { tenantId: tenant.id, referralCode: String(agentRef) } });
    if (agent) assignedTo = agent.id;
  }
  const leadEmail = email || '';
  const assignedToConnect = assignedTo ? { connect: { id: assignedTo } } : undefined;
  const lead = await prisma.lead.create({ data: { tenantId: tenant.id, carId, source: 'public', name, email: leadEmail, phone, message, assignedTo: assignedToConnect } as any });
  res.status(201).json(lead);
});

// Reserve endpoint: creates lead + optional deposit intent - POST /t/:slug/public/cars/reserve
router.post('/t/:slug/public/cars/reserve', publicInquiryLimiter, async (req: Request, res: Response) => {
  const reserveSchema = z.object({ name: z.string(), phone: z.string(), email: z.string().optional(), message: z.string().optional(), carId: z.string().optional(), depositIntent: z.boolean().optional() });
  const parsed = reserveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });
  const { name, phone, email = '', message = '', carId } = parsed.data;
  const tenant = await prisma.tenant.findUnique({ where: { slug: req.params.slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  // Create lead
  const leadEmail = email || '';
  const lead = await prisma.lead.create({ data: { tenantId: tenant.id, carId, source: 'public', name, email: leadEmail, phone, message } });
  // Create deposit payment intent if requested
  let depositCreated = false;
  if (parsed.data.depositIntent && lead.id) {
    try {
      await prisma.paymentintent.create({
        data: {
          tenantId: tenant.id,
          provider: 'internal',
          amount: 0, // Amount to be set by admin
          currency: 'ZMW',
          status: 'requires_action',
          metadata: { leadId: lead.id, carId, type: 'deposit' },
        },
      });
      depositCreated = true;
    } catch {
      // Non-critical: continue without deposit intent
    }
  }
  res.status(201).json({ lead, depositCreated });
});

// Watchlist subscription: POST /t/:slug/public/watchlist
router.post('/t/:slug/public/watchlist', publicWatchlistLimiter, async (req: Request, res: Response) => {
  const { carId, email, phone, alert_types } = req.body as { carId: string; email?: string; phone?: string; alert_types?: string[] };
  const tenant = await prisma.tenant.findUnique({ where: { slug: req.params.slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const car = await prisma.car.findFirst({ where: { id: carId, tenantId: tenant.id } });
  if (!car) return res.status(404).json({ error: 'Car not found' });
  // must be published for alerts to be meaningful
  if (!(car.publishToPublic || car.publishToExport)) return res.status(400).json({ error: 'Car is not public/export published' });
  if (!email && !phone && !req.headers.authorization) return res.status(400).json({ error: 'Provide email or phone or be logged in' });

  // optional auth to attach buyerId
  let userId: string | undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const payload: any = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
      userId = payload.id;
    } catch (err) {
      // ignore invalid token
    }
  }

  // Upsert: find existing by tenant+car+email OR tenant+car+phone OR buyerId
  const whereClause: any = { tenantId: tenant.id, carId };
  if (userId) whereClause.userId = userId; else if (email) whereClause.email = email; else if (phone) whereClause.phone = phone;
  let existing = await prisma.watchlist.findFirst({ where: whereClause });
  if (existing) {
    const updated = await prisma.watchlist.update({ where: { id: existing.id }, data: { alertTypes: alert_types || ['price_drop'] } });
    return res.status(200).json(updated);
  }
  const watchlistEmail = email || undefined;
  const created = await prisma.watchlist.create({ data: { tenantId: tenant.id, carId, email: watchlistEmail, phone, alertTypes: alert_types || ['price_drop'] } });
  res.status(201).json(created);
});

// Save searches: POST /t/:slug/public/saved-searches
router.post('/t/:slug/public/saved-searches', publicWatchlistLimiter, async (req: Request, res: Response) => {
  const { query, email, phone } = req.body as { query: any; email?: string; phone?: string };
  const tenant = await prisma.tenant.findUnique({ where: { slug: req.params.slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  if (!query) return res.status(400).json({ error: 'query required' });
  const savedEmail = email || undefined;
  const created = await prisma.savedSearch.create({ data: { tenantId: tenant.id, email: savedEmail, phone, queryJson: query } });
  res.status(201).json(created);
});

// Compare cars: GET /t/:slug/public/cars/compare?ids=id1,id2
router.get('/t/:slug/public/cars/compare', async (req: Request, res: Response) => {
  const tenant = await prisma.tenant.findUnique({ where: { slug: req.params.slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const ids = (req.query.ids as string)?.split(',') || [];
  const cars = await prisma.car.findMany({ where: { tenantId: tenant.id, id: { in: ids } } });
  res.json(cars);
});

// Instant offer: POST /t/:slug/public/instant-offer
router.post('/t/:slug/public/instant-offer', async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const { make, model, year, mileage, condition } = req.body;
  // Mock valuation logic: base price from year and make
  const base = 20000;
  const age = Math.max(0, new Date().getFullYear() - (year || new Date().getFullYear()));
  const yearMultiplier = age * 0.05; // 5% per year depreciation
  const mileageMultiplier = (Number(mileage || 0) / 10000) * 0.02; // 2% per 10k
  const conditionAdj = condition === 'excellent' ? 1.05 : condition === 'good' ? 1 : condition === 'fair' ? 0.9 : 0.8;
  let offer = base * (1 - yearMultiplier - mileageMultiplier) * conditionAdj;
  if (offer < 1000) offer = 1000;
  // Round
  offer = Math.round(offer / 50) * 50;
  res.json({ offer, currency: 'USD', validDays: 7 });
});

// Create a consignment listing for selling: POST /t/:slug/public/consignments
router.post('/t/:slug/public/consignments', async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const { ownerName, phone, email, carJson } = req.body;
  if (!ownerName || !phone || !carJson) return res.status(400).json({ error: 'Missing fields' });
  try {
    const consignmentEmail = email || undefined;
    const consignment = await prisma.consignment.create({ data: { tenantId: tenant.id, ownerName, phone, email: consignmentEmail, carJson, status: 'new', commissionPct: 0 } as any });
    res.status(201).json(consignment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create consignment' });
  }
});

// Public deals: GET /t/:slug/public/deals - returns agentDeal-linked cars or cheap cars
router.get('/t/:slug/public/deals', async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  try {
    // Find agent deals and include car information
    const deals = await prisma.agentDeal.findMany({ where: { tenantId: tenant.id }, include: { car: true } });
    // Also include cars with price thresholds as deals
    const cheapCars = await prisma.car.findMany({ where: { tenantId: tenant.id, OR: [{ priceUsd: { lt: 15000 } }, { priceLocalZmw: { lt: 200000 } }], publishToPublic: true } });
    // Merge unique cars from deals and cheapCars
    const merged: any[] = [];
    const seen = new Set<string>();
    for (const d of deals) { if (d.car && !seen.has(d.car.id)) { merged.push(d.car); seen.add(d.car.id); } }
    for (const c of cheapCars) { if (!seen.has(c.id)) { merged.push(c); seen.add(c.id); } }
    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: 'failed to fetch deals' });
  }
});

// Create a public appointment/test drive booking: POST /t/:slug/public/appointments
router.post('/t/:slug/public/appointments', async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const { name, phone, email, carId, scheduleAt, purpose } = req.body as any;
  if (!name || !phone || !scheduleAt) return res.status(400).json({ error: 'missing fields' });
  const appointmentEmail = email || undefined;
  const td = await prisma.testDrive.create({ data: { tenantId: tenant.id, carId, name, phone, email: appointmentEmail, scheduleAt: new Date(scheduleAt), status: 'requested', message: purpose || 'appointment' } as any });
  res.status(201).json(td);
});

export default router;

// Aggregates endpoint: counts for makes, types, and price buckets
router.get('/t/:slug/public/aggregates', async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const where: any = { tenantId: tenant.id, publishToPublic: true, status: 'published' };

  try {
    // Counts by make
    const makes = await prisma.car.groupBy({
      by: ['make'],
      where,
      _count: { make: true }
    });

    // Counts by bodyType
    const types = await prisma.car.groupBy({
      by: ['bodyType'],
      where,
      _count: { bodyType: true }
    });

    // Price buckets in USD
    const buckets = [
      { key: 'Under $500', min: null, max: 500 },
      { key: '$500 - $1,000', min: 500, max: 1000 },
      { key: '$1,000 - $1,500', min: 1000, max: 1500 },
      { key: '$1,500 - $2,000', min: 1500, max: 2000 },
      { key: '$2,000 - $2,500', min: 2000, max: 2500 },
      { key: '$2,500 - $4,000', min: 2500, max: 4000 },
      { key: 'Over $4,000', min: 4000, max: null }
    ];

    const priceBuckets: Array<{ key: string; count: number }> = [];
    for (const b of buckets) {
      const pwhere: any = { ...where };
      if (b.min !== null && b.max !== null) pwhere.priceUsd = { gte: b.min, lt: b.max };
      else if (b.min === null && b.max !== null) pwhere.priceUsd = { lt: b.max };
      else if (b.min !== null && b.max === null) pwhere.priceUsd = { gte: b.min };
      const cnt = await prisma.car.count({ where: pwhere });
      priceBuckets.push({ key: b.key, count: cnt });
    }

    // normalize make/type results
    const makeCounts = makes.map(m => ({ make: m.make || 'Unknown', count: (m as any)._count?.make || 0 }));
    const typeCounts = types.map(t => ({ type: t.bodyType || 'Unknown', count: (t as any)._count?.bodyType || 0 }));

    res.json({ makes: makeCounts, types: typeCounts, priceBuckets });
  } catch (err) {
    console.error('Error fetching aggregates:', err);
    res.status(500).json({ error: 'Failed to fetch aggregates' });
  }
});

    // Stock summary endpoint for the public dashboard: /t/:slug/public/stock
    router.get('/t/:slug/public/stock', async (req: Request, res: Response) => {
      const slug = req.params.slug;
      const tenant = await prisma.tenant.findUnique({ where: { slug } });
      if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

      const where: any = { tenantId: tenant.id, publishToPublic: true, status: 'published' };
      try {
        const total = await prisma.car.count({ where });

        // Group by country (locations)
        const locationsRaw = await prisma.car.groupBy({ by: ['country'], where, _count: { country: true } });
        const locations = await Promise.all(locationsRaw.map(async (l) => {
          const recentCount = await prisma.car.count({ where: { ...where, country: l.country, createdAt: { gte: new Date(Date.now() - 24*60*60*1000) } } });
          const count = (l as any)._count?.country || 0;
          return { name: l.country || 'Unknown', count, percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0, recent: recentCount };
        }));

        // Group by bodyType (categories)
        const categoriesRaw = await prisma.car.groupBy({ by: ['bodyType'], where, _count: { bodyType: true } });
        const categories = categoriesRaw.map(c => ({ name: c.bodyType || 'Other', count: (c as any)._count?.bodyType || 0, percentage: total > 0 ? Math.round(((c as any)._count?.bodyType || 0) / total * 1000) / 10 : 0 }));

        // Recent updates (last 10 updated cars)
        const recent = await prisma.car.findMany({ where, orderBy: { updatedAt: 'desc' }, take: 10, select: { updatedAt: true, title: true, make: true, model: true, stockNo: true, country: true } });
        const recentUpdates = recent.map(r => ({ time: r.updatedAt, action: r.title || `${r.make} ${r.model} ${r.stockNo ?? ''}`, location: r.country }));

        // Top makes (top N)
        const makesRaw = await prisma.car.groupBy({ by: ['make'], where, _count: { make: true } });
        const makesSorted = makesRaw.map(m => ({ make: m.make || 'Unknown', count: (m as any)._count?.make || 0 })).sort((a,b) => b.count - a.count).slice(0, 10);
        const topMakes = makesSorted.map(m => ({ make: m.make, count: m.count, percentage: total > 0 ? Math.round((m.count / total) * 1000) / 10 : 0 }));

        res.json({ totalCars: total, locations, categories, recentUpdates, topMakes });
      } catch (err) {
        console.error('Error fetching stock summary:', err);
        res.status(500).json({ error: 'Failed to fetch stock summary' });
      }
    });
