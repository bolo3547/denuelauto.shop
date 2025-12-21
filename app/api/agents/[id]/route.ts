import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyTenantAccess } from '@/middleware/tenantAuth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await verifyTenantAccess(request);
    
    const agent = await prisma.agent.findFirst({
      where: {
        id: params.id,
        tenantId
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        referrals: {
          include: {
            car: {
              select: {
                make: true,
                model: true,
                year: true,
                stockNo: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        commissions: {
          include: {
            sale: {
              include: {
                customer: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                },
                car: {
                  select: {
                    make: true,
                    model: true,
                    year: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            referrals: true,
            sales: true,
            commissions: true
          }
        }
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Failed to fetch agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await verifyTenantAccess(request);
    const data = await request.json();

    const {
      baseCommission,
      bonusCommission,
      tier,
      isActive
    } = data;

    // Check if agent exists and belongs to tenant
    const existingAgent = await prisma.agent.findFirst({
      where: {
        id: params.id,
        tenantId
      }
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const agent = await prisma.agent.update({
      where: { id: params.id },
      data: {
        baseCommission,
        bonusCommission,
        tier,
        isActive,
        updatedAt: new Date()
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

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Failed to update agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await verifyTenantAccess(request);

    // Check if agent exists and belongs to tenant
    const existingAgent = await prisma.agent.findFirst({
      where: {
        id: params.id,
        tenantId
      }
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if agent has pending commissions
    const pendingCommissions = await prisma.commission.count({
      where: {
        agentId: params.id,
        status: { in: ['PENDING', 'APPROVED'] }
      }
    });

    if (pendingCommissions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete agent with pending commissions' },
        { status: 400 }
      );
    }

    await prisma.agent.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Failed to delete agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}