import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyTenantAccess } from '@/middleware/tenantAuth';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await verifyTenantAccess(request);
    const data = await request.json();

    const { status, saleId } = data;

    // Check if referral exists and belongs to tenant
    const existingReferral = await prisma.referral.findFirst({
      where: {
        id: params.id,
        tenantId
      },
      include: {
        agent: true
      }
    });

    if (!existingReferral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    // If converting referral, create commission
    let commission = null;
    if (status === 'CONVERTED' && saleId) {
      // Get sale details
      const sale = await prisma.sale.findFirst({
        where: {
          id: saleId,
          tenantId
        }
      });

      if (!sale) {
        return NextResponse.json(
          { error: 'Sale not found' },
          { status: 404 }
        );
      }

      // Calculate commission amount
      const commissionAmount = (sale.salePrice * existingReferral.commissionRate) / 100;

      // Create commission record
      commission = await prisma.commission.create({
        data: {
          agentId: existingReferral.agentId,
          tenantId,
          saleId,
          saleAmount: sale.salePrice,
          commissionRate: existingReferral.commissionRate,
          commissionAmount,
          status: 'PENDING'
        }
      });

      // Update agent stats
      await prisma.agent.update({
        where: { id: existingReferral.agentId },
        data: {
          totalSales: { increment: 1 },
          totalCommission: { increment: commissionAmount }
        }
      });
    }

    // Update referral
    const referral = await prisma.referral.update({
      where: { id: params.id },
      data: {
        status,
        saleId,
        convertedAt: status === 'CONVERTED' ? new Date() : null,
        commissionPaid: status === 'CONVERTED' ? false : existingReferral.commissionPaid,
        updatedAt: new Date()
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
        },
        sale: {
          select: {
            saleNumber: true,
            salePrice: true
          }
        }
      }
    });

    return NextResponse.json({ referral, commission });
  } catch (error) {
    console.error('Failed to update referral:', error);
    return NextResponse.json(
      { error: 'Failed to update referral' },
      { status: 500 }
    );
  }
}