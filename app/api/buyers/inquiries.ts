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
        return handleGetInquiries(req, res, tenantId);
      case 'POST':
        return handleCreateInquiry(req, res, tenantId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Inquiries API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetInquiries(req: NextApiRequest, res: NextApiResponse, tenantId: string) {
  const { 
    buyerId,
    page = 1, 
    limit = 20, 
    type = 'all',
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
    // If no buyerId specified, get all inquiries for tenant
    where.buyer = {
      tenantId: tenantId
    };
  }

  // Type filter
  if (type !== 'all') {
    where.type = type;
  }

  // Status filter
  if (status !== 'all') {
    where.status = status === 'resolved';
  }

  try {
    const [inquiries, total] = await Promise.all([
      prisma.buyerInquiry.findMany({
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
            select: {
              id: true,
              stockNo: true,
              make: true,
              model: true,
              year: true,
              price: true
            }
          }
        }
      }),
      prisma.buyerInquiry.count({ where })
    ]);

    return res.status(200).json({
      inquiries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
}

async function handleCreateInquiry(req: NextApiRequest, res: NextApiResponse, tenantId: string) {
  const {
    buyerId,
    carId,
    type,
    subject,
    message,
    contactPreference
  } = req.body;

  // Validation
  if (!buyerId || !type || !subject || !message) {
    return res.status(400).json({
      error: 'Buyer ID, type, subject, and message are required'
    });
  }

  const validTypes = ['GENERAL', 'CAR_SPECIFIC', 'SHIPPING', 'PAYMENT', 'TECHNICAL_SUPPORT'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      error: 'Invalid inquiry type'
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

    // If carId is provided, verify car exists and belongs to tenant
    if (carId) {
      const car = await prisma.car.findFirst({
        where: {
          id: carId,
          tenantId: tenantId
        }
      });

      if (!car) {
        return res.status(404).json({ error: 'Car not found' });
      }
    }

    // Create inquiry
    const inquiry = await prisma.buyerInquiry.create({
      data: {
        buyerId,
        carId: carId || null,
        type,
        subject,
        message,
        contactPreference: contactPreference || 'EMAIL',
        isResolved: false
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
          select: {
            id: true,
            stockNo: true,
            make: true,
            model: true,
            year: true,
            price: true
          }
        }
      }
    });

    return res.status(201).json(inquiry);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return res.status(500).json({ error: 'Failed to create inquiry' });
  }
}