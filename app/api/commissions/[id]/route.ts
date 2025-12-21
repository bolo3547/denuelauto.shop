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

    const { status, paymentMethod, transactionRef, notes } = data;

    // Check if commission exists and belongs to tenant
    const existingCommission = await prisma.commission.findFirst({
      where: {
        id: params.id,
        tenantId
      }
    });

    if (!existingCommission) {
      return NextResponse.json(
        { error: 'Commission not found' },
        { status: 404 }
      );
    }

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
      'PENDING': ['APPROVED', 'DISPUTED', 'CANCELLED'],
      'APPROVED': ['PAID', 'DISPUTED', 'CANCELLED'],
      'DISPUTED': ['APPROVED', 'CANCELLED'],
      'PAID': [], // Final state
      'CANCELLED': [] // Final state
    };

    if (!validTransitions[existingCommission.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${existingCommission.status} to ${status}` },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    // Set payment details if marking as paid
    if (status === 'PAID') {
      updateData.paidAt = new Date();
      updateData.paymentMethod = paymentMethod;
      updateData.transactionRef = transactionRef;
    }

    if (notes) {
      updateData.notes = notes;
    }

    const commission = await prisma.commission.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({ commission });
  } catch (error) {
    console.error('Failed to update commission:', error);
    return NextResponse.json(
      { error: 'Failed to update commission' },
      { status: 500 }
    );
  }
}