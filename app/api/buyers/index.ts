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
        return handleGetBuyers(req, res, tenantId);
      case 'POST':
        return handleCreateBuyer(req, res, tenantId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Buyers API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetBuyers(req: NextApiRequest, res: NextApiResponse, tenantId: string) {
  const { 
    page = 1, 
    limit = 20, 
    search = '', 
    status = 'all',
    sortBy = 'createdAt',
    sortOrder = 'desc' 
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  const where: any = {
    tenantId: tenantId
  };

  // Search functionality
  if (search) {
    where.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { phone: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  // Status filter
  if (status !== 'all') {
    where.isActive = status === 'active';
  }

  try {
    const [buyers, total] = await Promise.all([
      prisma.buyer.findMany({
        where,
        skip: offset,
        take: limitNum,
        orderBy: {
          [sortBy as string]: sortOrder as 'asc' | 'desc'
        },
        include: {
          _count: {
            select: {
              favorites: true,
              orders: true,
              inquiries: true,
              reviews: true
            }
          }
        }
      }),
      prisma.buyer.count({ where })
    ]);

    return res.status(200).json({
      buyers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching buyers:', error);
    return res.status(500).json({ error: 'Failed to fetch buyers' });
  }
}

async function handleCreateBuyer(req: NextApiRequest, res: NextApiResponse, tenantId: string) {
  const {
    email,
    firstName,
    lastName,
    phone,
    country,
    city,
    budget,
    currency,
    preferredMakes,
    password
  } = req.body;

  // Validation
  if (!email || !firstName || !lastName || !password) {
    return res.status(400).json({
      error: 'Email, first name, last name, and password are required'
    });
  }

  try {
    // Check if buyer already exists
    const existingBuyer = await prisma.buyer.findFirst({
      where: {
        email,
        tenantId
      }
    });

    if (existingBuyer) {
      return res.status(400).json({ error: 'Buyer with this email already exists' });
    }

    // Create buyer
    const buyer = await prisma.buyer.create({
      data: {
        tenantId,
        email,
        firstName,
        lastName,
        phone,
        country,
        city,
        budget: budget ? parseFloat(budget) : null,
        currency: currency || 'USD',
        preferredMakes: preferredMakes || [],
        passwordHash: password, // In production, this should be hashed
        isActive: true,
        emailVerified: false
      },
      include: {
        _count: {
          select: {
            favorites: true,
            orders: true,
            inquiries: true,
            reviews: true
          }
        }
      }
    });

    return res.status(201).json(buyer);
  } catch (error) {
    console.error('Error creating buyer:', error);
    return res.status(500).json({ error: 'Failed to create buyer' });
  }
}