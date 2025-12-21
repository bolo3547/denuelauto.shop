import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyTenantAccess } from '@/middleware/tenantAuth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const tenantId = await verifyTenantAccess(request);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const agentId = url.searchParams.get('agentId');
    
    const where: any = { tenantId };
    
    if (status) where.status = status;
    if (agentId) where.agentId = agentId;

    const referrals = await prisma.referral.findMany({
      where,
      include: {
        agent: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        car: {
          select: {
            make: true,
            model: true,
            year: true,
            stockNo: true
          }
        },
        sale: {
          select: {
            saleNumber: true,
            salePrice: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ referrals });
  } catch (error) {
    console.error('Failed to fetch referrals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await verifyTenantAccess(request);
    const data = await request.json();

    const {
      agentId,
      customerName,
      customerEmail,
      customerPhone,
      carId,
      source = 'DIRECT',
      commissionRate
    } = data;

    // Verify agent exists and belongs to tenant
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        tenantId,
        isActive: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found or inactive' },
        { status: 404 }
      );
    }

    // Generate unique referral code
    const referralCode = `REF${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    // Use agent's base commission if not specified
    const finalCommissionRate = commissionRate || agent.baseCommission;

    const referral = await prisma.referral.create({
      data: {
        agentId,
        tenantId,
        referralCode,
        customerName,
        customerEmail,
        customerPhone,
        carId,
        source,
        commissionRate: finalCommissionRate
      },
      include: {
        agent: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        car: {
          select: {
            make: true,
            model: true,
            year: true,
            stockNo: true
          }
        }
      }
    });

    // Update agent's total referrals count
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        totalReferrals: { increment: 1 }
      }
    });

    return NextResponse.json({ referral }, { status: 201 });
  } catch (error) {
    console.error('Failed to create referral:', error);
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}