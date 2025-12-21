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
    const { tenantSlug, carId } = req.query;

    // Validate tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug as string },
      select: { id: true, name: true, slug: true, contactEmail: true, contactPhone: true }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    // Get car details
    const car = await prisma.car.findFirst({
      where: {
        id: carId as string,
        tenantId: tenant.id
      },
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        features: true,
        _count: {
          select: {
            favorites: true,
            views: true,
            inquiries: true
          }
        }
      }
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Record car view (analytics)
    await prisma.carView.create({
      data: {
        carId: car.id,
        ipAddress: req.headers['x-forwarded-for'] as string || 
                   req.headers['x-real-ip'] as string || 
                   req.connection.remoteAddress || 
                   'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      }
    }).catch(() => {
      // Ignore errors for analytics - don't fail the request
    });

    // Get similar cars (same make, similar price range)
    const priceRange = parseFloat(car.price.toString()) * 0.2; // 20% price range
    const similarCars = await prisma.car.findMany({
      where: {
        tenantId: tenant.id,
        id: { not: car.id },
        status: 'AVAILABLE',
        make: car.make,
        price: {
          gte: parseFloat(car.price.toString()) - priceRange,
          lte: parseFloat(car.price.toString()) + priceRange
        }
      },
      take: 6,
      include: {
        images: {
          take: 1,
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            favorites: true,
            views: true
          }
        }
      }
    });

    return res.status(200).json({
      car,
      similarCars,
      dealer: tenant
    });
  } catch (error) {
    console.error('Car details API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}