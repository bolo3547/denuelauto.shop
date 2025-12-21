import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      tenantSlug,
      page = 1,
      limit = 20,
      search = '',
      make = '',
      model = '',
      yearMin = '',
      yearMax = '',
      priceMin = '',
      priceMax = '',
      mileageMax = '',
      fuelType = '',
      transmission = '',
      bodyType = '',
      color = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Validate tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug as string },
      select: { id: true, name: true, slug: true }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      tenantId: tenant.id,
      status: 'AVAILABLE' // Only show available cars
    };

    // Search functionality
    if (search) {
      where.OR = [
        { make: { contains: search as string, mode: 'insensitive' } },
        { model: { contains: search as string, mode: 'insensitive' } },
        { stockNo: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Filters
    if (make) where.make = { contains: make as string, mode: 'insensitive' };
    if (model) where.model = { contains: model as string, mode: 'insensitive' };
    if (fuelType) where.fuelType = fuelType as string;
    if (transmission) where.transmission = transmission as string;
    if (bodyType) where.bodyType = bodyType as string;
    if (color) where.color = { contains: color as string, mode: 'insensitive' };

    // Numeric filters
    if (yearMin || yearMax) {
      where.year = {};
      if (yearMin) where.year.gte = parseInt(yearMin as string);
      if (yearMax) where.year.lte = parseInt(yearMax as string);
    }

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseFloat(priceMin as string);
      if (priceMax) where.price.lte = parseFloat(priceMax as string);
    }

    if (mileageMax) {
      where.mileage = { lte: parseInt(mileageMax as string) };
    }

    const [cars, total, makes, models] = await Promise.all([
      prisma.car.findMany({
        where,
        skip: offset,
        take: limitNum,
        orderBy: {
          [sortBy as string]: sortOrder as 'asc' | 'desc'
        },
        include: {
          images: {
            orderBy: { order: 'asc' }
          },
          _count: {
            select: {
              favorites: true,
              views: true,
              inquiries: true
            }
          }
        }
      }),
      prisma.car.count({ where }),
      // Get available makes for filtering
      prisma.car.groupBy({
        by: ['make'],
        where: { tenantId: tenant.id, status: 'AVAILABLE' },
        _count: { make: true },
        orderBy: { make: 'asc' }
      }),
      // Get available models for filtering
      prisma.car.groupBy({
        by: ['model'],
        where: { 
          tenantId: tenant.id, 
          status: 'AVAILABLE',
          ...(make ? { make: { contains: make as string, mode: 'insensitive' } } : {})
        },
        _count: { model: true },
        orderBy: { model: 'asc' }
      })
    ]);

    return res.status(200).json({
      cars,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      filters: {
        makes: makes.map(m => ({ value: m.make, count: m._count.make })),
        models: models.map(m => ({ value: m.model, count: m._count.model }))
      },
      dealer: tenant
    });
  } catch (error) {
    console.error('Public cars API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}