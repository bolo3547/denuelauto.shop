import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyTenantAccess } from '@/middleware/tenantAuth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const tenantId = await verifyTenantAccess(request);
    const url = new URL(request.url);
    const tier = url.searchParams.get('tier');
    const isActive = url.searchParams.get('isActive');
    
    const where: any = { tenantId };
    
    if (tier) where.tier = tier;
    if (isActive !== null) where.isActive = isActive === 'true';

    const agents = await prisma.agent.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: {
            referrals: true,
            sales: true,
            commissions: true
          }
        }
      },
      orderBy: [
        { totalCommission: 'desc' },
        { totalSales: 'desc' }
      ]
    });

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await verifyTenantAccess(request);
    const data = await request.json();

    const {
      userId,
      baseCommission = 5.0,
      bonusCommission = 0.0,
      tier = 'BRONZE'
    } = data;

    // Check if user exists and belongs to tenant
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found or does not belong to tenant' },
        { status: 404 }
      );
    }

    // Check if user is already an agent
    const existingAgent = await prisma.agent.findUnique({
      where: { userId }
    });

    if (existingAgent) {
      return NextResponse.json(
        { error: 'User is already an agent' },
        { status: 400 }
      );
    }

    // Generate unique agent code
    const agentCount = await prisma.agent.count({ where: { tenantId } });
    const agentCode = `AG${String(agentCount + 1).padStart(3, '0')}`;

    const agent = await prisma.agent.create({
      data: {
        userId,
        tenantId,
        agentCode,
        baseCommission,
        bonusCommission,
        tier
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error('Failed to create agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}