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

    const commissions = await prisma.commission.findMany({
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
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ commissions });
  } catch (error) {
    console.error('Failed to fetch commissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commissions' },
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
      saleId,
      commissionRate,
      notes
    } = data;

    // Verify agent and sale exist
    const [agent, sale] = await Promise.all([
      prisma.agent.findFirst({
        where: { id: agentId, tenantId }
      }),
      prisma.sale.findFirst({
        where: { id: saleId, tenantId }
      })
    ]);

    if (!agent || !sale) {
      return NextResponse.json(
        { error: 'Agent or sale not found' },
        { status: 404 }
      );
    }

    // Check if commission already exists for this sale
    const existingCommission = await prisma.commission.findFirst({
      where: {
        agentId,
        saleId
      }
    });

    if (existingCommission) {
      return NextResponse.json(
        { error: 'Commission already exists for this sale' },
        { status: 400 }
      );
    }

    // Calculate commission amount
    const finalCommissionRate = commissionRate || agent.baseCommission;
    const commissionAmount = (sale.salePrice * finalCommissionRate) / 100;

    const commission = await prisma.commission.create({
      data: {
        agentId,
        tenantId,
        saleId,
        saleAmount: sale.salePrice,
        commissionRate: finalCommissionRate,
        commissionAmount,
        status: 'PENDING',
        notes
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
      }
    });

    return NextResponse.json({ commission }, { status: 201 });
  } catch (error) {
    console.error('Failed to create commission:', error);
    return NextResponse.json(
      { error: 'Failed to create commission' },
      { status: 500 }
    );
  }
}