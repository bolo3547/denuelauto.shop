import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { authenticateToken, getUserTenant } from '../../../../lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = authenticateToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tenantId = await getUserTenant(user.userId);
    if (!tenantId) {
      return res.status(403).json({ error: 'No tenant access' });
    }

    const { buyerId } = req.query;

    switch (req.method) {
      case 'GET':
        return handleGetFavorites(req, res, tenantId, buyerId as string);
      case 'POST':
        return handleAddFavorite(req, res, tenantId, buyerId as string);
      case 'DELETE':
        return handleRemoveFavorite(req, res, tenantId, buyerId as string);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Favorites API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetFavorites(
  req: NextApiRequest, 
  res: NextApiResponse, 
  tenantId: string, 
  buyerId: string
) {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  try {
    // Verify buyer belongs to tenant
    const buyer = await prisma.buyer.findFirst({
      where: {
        id: buyerId,
        tenantId: tenantId
      }
    });

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: {
          buyerId: buyerId
        },
        skip: offset,
        take: limitNum,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          car: {
            include: {
              images: true,
              tenant: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        }
      }),
      prisma.favorite.count({
        where: {
          buyerId: buyerId
        }
      })
    ]);

    return res.status(200).json({
      favorites,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return res.status(500).json({ error: 'Failed to fetch favorites' });
  }
}

async function handleAddFavorite(
  req: NextApiRequest, 
  res: NextApiResponse, 
  tenantId: string, 
  buyerId: string
) {
  const { carId, notes } = req.body;

  if (!carId) {
    return res.status(400).json({ error: 'Car ID is required' });
  }

  try {
    // Verify buyer belongs to tenant
    const buyer = await prisma.buyer.findFirst({
      where: {
        id: buyerId,
        tenantId: tenantId
      }
    });

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    // Verify car exists and belongs to tenant
    const car = await prisma.car.findFirst({
      where: {
        id: carId,
        tenantId: tenantId
      }
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        buyerId: buyerId,
        carId: carId
      }
    });

    if (existingFavorite) {
      return res.status(400).json({ error: 'Car already in favorites' });
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        buyerId: buyerId,
        carId: carId,
        notes: notes
      },
      include: {
        car: {
          include: {
            images: true,
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    return res.status(201).json(favorite);
  } catch (error) {
    console.error('Error adding favorite:', error);
    return res.status(500).json({ error: 'Failed to add favorite' });
  }
}

async function handleRemoveFavorite(
  req: NextApiRequest, 
  res: NextApiResponse, 
  tenantId: string, 
  buyerId: string
) {
  const { carId } = req.body;

  if (!carId) {
    return res.status(400).json({ error: 'Car ID is required' });
  }

  try {
    // Verify buyer belongs to tenant
    const buyer = await prisma.buyer.findFirst({
      where: {
        id: buyerId,
        tenantId: tenantId
      }
    });

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    // Find and delete favorite
    const favorite = await prisma.favorite.findFirst({
      where: {
        buyerId: buyerId,
        carId: carId
      }
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    await prisma.favorite.delete({
      where: {
        id: favorite.id
      }
    });

    return res.status(200).json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return res.status(500).json({ error: 'Failed to remove favorite' });
  }
}