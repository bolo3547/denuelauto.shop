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

    switch (req.method) {
      case 'GET':
        return handleGetOrders(req, res, tenantId);
      case 'POST':
        return handleCreateOrder(req, res, tenantId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Orders API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetOrders(req: NextApiRequest, res: NextApiResponse, tenantId: string) {
  const { 
    buyerId,
    page = 1, 
    limit = 20, 
    status = 'all',
    sortBy = 'createdAt',
    sortOrder = 'desc' 
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  const where: any = {};

  // Filter by buyer if specified
  if (buyerId) {
    // Verify buyer belongs to tenant
    const buyer = await prisma.buyer.findFirst({
      where: {
        id: buyerId as string,
        tenantId: tenantId
      }
    });

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    where.buyerId = buyerId as string;
  } else {
    // If no buyerId specified, get all orders for tenant
    where.buyer = {
      tenantId: tenantId
    };
  }

  // Status filter
  if (status !== 'all') {
    where.status = status;
  }

  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: offset,
        take: limitNum,
        orderBy: {
          [sortBy as string]: sortOrder as 'asc' | 'desc'
        },
        include: {
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
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
      prisma.order.count({ where })
    ]);

    return res.status(200).json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function handleCreateOrder(req: NextApiRequest, res: NextApiResponse, tenantId: string) {
  const {
    buyerId,
    carId,
    shippingAddress,
    shippingCity,
    shippingCountry,
    shippingCost,
    importDuty,
    otherFees,
    notes
  } = req.body;

  // Validation
  if (!buyerId || !carId) {
    return res.status(400).json({
      error: 'Buyer ID and Car ID are required'
    });
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

    // Verify car exists, belongs to tenant, and is available
    const car = await prisma.car.findFirst({
      where: {
        id: carId,
        tenantId: tenantId,
        status: 'AVAILABLE'
      }
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found or not available' });
    }

    // Check if car is already ordered
    const existingOrder = await prisma.order.findFirst({
      where: {
        carId: carId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED']
        }
      }
    });

    if (existingOrder) {
      return res.status(400).json({ error: 'Car is already ordered' });
    }

    // Calculate total amount
    const carPrice = parseFloat(car.price.toString());
    const shipping = shippingCost ? parseFloat(shippingCost) : 0;
    const duty = importDuty ? parseFloat(importDuty) : 0;
    const fees = otherFees ? parseFloat(otherFees) : 0;
    const totalAmount = carPrice + shipping + duty + fees;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId,
        carId,
        totalAmount: totalAmount,
        carPrice: carPrice,
        shippingCost: shipping,
        importDuty: duty,
        otherFees: fees,
        shippingAddress,
        shippingCity,
        shippingCountry,
        notes,
        status: 'PENDING'
      },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
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

    // Update car status to reserved
    await prisma.car.update({
      where: { id: carId },
      data: { status: 'RESERVED' }
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
}