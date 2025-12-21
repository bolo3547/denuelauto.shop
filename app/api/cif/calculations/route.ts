import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [calculations, totalCount] = await Promise.all([
      prisma.cIFCalculation.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          car: {
            select: {
              stockNo: true,
              make: true,
              model: true,
              year: true
            }
          },
          createdBy: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.cIFCalculation.count({ where: { tenantId } })
    ]);

    return NextResponse.json({
      calculations,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('GET /api/cif/calculations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calculations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');
    
    if (!tenantId || !userId) {
      return NextResponse.json({ error: 'Tenant ID and User ID required' }, { status: 400 });
    }

    const calculationData = await request.json();

    // Validate required fields
    if (!calculationData.carValue || !calculationData.originPort || !calculationData.destinationPort) {
      return NextResponse.json(
        { error: 'Missing required fields: carValue, originPort, destinationPort' },
        { status: 400 }
      );
    }

    // Create the calculation
    const calculation = await prisma.cIFCalculation.create({
      data: {
        tenantId,
        createdById: userId,
        carId: calculationData.carId || null,
        customerName: calculationData.customerName || null,
        carValue: parseFloat(calculationData.carValue),
        currency: calculationData.currency || 'USD',
        originPort: calculationData.originPort,
        destinationPort: calculationData.destinationPort,
        shippingMethod: calculationData.shippingMethod || 'roro',
        freight: parseFloat(calculationData.freight || '0'),
        insurance: parseFloat(calculationData.insurance || '0'),
        portCharges: parseFloat(calculationData.portCharges || '0'),
        inspectionFees: parseFloat(calculationData.inspectionFees || '0'),
        documentationFees: parseFloat(calculationData.documentationFees || '0'),
        agentFees: parseFloat(calculationData.agentFees || '0'),
        importDuty: parseFloat(calculationData.importDuty || '0'),
        exciseDuty: parseFloat(calculationData.exciseDuty || '0'),
        vat: parseFloat(calculationData.vat || '0'),
        additionalCosts: calculationData.additionalCosts || [],
        cifValue: parseFloat(calculationData.cifValue || '0'),
        totalLandingCost: parseFloat(calculationData.totalLandingCost || '0')
      },
      include: {
        car: {
          select: {
            stockNo: true,
            make: true,
            model: true,
            year: true
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(calculation, { status: 201 });

  } catch (error) {
    console.error('POST /api/cif/calculations error:', error);
    return NextResponse.json(
      { error: 'Failed to save calculation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');
    
    if (!tenantId || !userId) {
      return NextResponse.json({ error: 'Tenant ID and User ID required' }, { status: 400 });
    }

    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Calculation ID is required' }, { status: 400 });
    }

    // Check if calculation exists and belongs to tenant
    const existingCalc = await prisma.cIFCalculation.findFirst({
      where: {
        id,
        tenantId
      }
    });

    if (!existingCalc) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
    }

    // Update the calculation
    const updatedCalculation = await prisma.cIFCalculation.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
        carValue: updateData.carValue ? parseFloat(updateData.carValue) : undefined,
        freight: updateData.freight ? parseFloat(updateData.freight) : undefined,
        insurance: updateData.insurance ? parseFloat(updateData.insurance) : undefined,
        portCharges: updateData.portCharges ? parseFloat(updateData.portCharges) : undefined,
        inspectionFees: updateData.inspectionFees ? parseFloat(updateData.inspectionFees) : undefined,
        documentationFees: updateData.documentationFees ? parseFloat(updateData.documentationFees) : undefined,
        agentFees: updateData.agentFees ? parseFloat(updateData.agentFees) : undefined,
        importDuty: updateData.importDuty ? parseFloat(updateData.importDuty) : undefined,
        exciseDuty: updateData.exciseDuty ? parseFloat(updateData.exciseDuty) : undefined,
        vat: updateData.vat ? parseFloat(updateData.vat) : undefined,
        cifValue: updateData.cifValue ? parseFloat(updateData.cifValue) : undefined,
        totalLandingCost: updateData.totalLandingCost ? parseFloat(updateData.totalLandingCost) : undefined
      },
      include: {
        car: {
          select: {
            stockNo: true,
            make: true,
            model: true,
            year: true
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedCalculation);

  } catch (error) {
    console.error('PUT /api/cif/calculations error:', error);
    return NextResponse.json(
      { error: 'Failed to update calculation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');
    
    if (!tenantId || !userId) {
      return NextResponse.json({ error: 'Tenant ID and User ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const calcId = searchParams.get('id');

    if (!calcId) {
      return NextResponse.json({ error: 'Calculation ID required' }, { status: 400 });
    }

    // Check if calculation exists and belongs to tenant
    const existingCalc = await prisma.cIFCalculation.findFirst({
      where: {
        id: calcId,
        tenantId
      }
    });

    if (!existingCalc) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
    }

    // Delete the calculation
    await prisma.cIFCalculation.delete({
      where: { id: calcId }
    });

    return NextResponse.json({
      message: 'Calculation deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/cif/calculations error:', error);
    return NextResponse.json(
      { error: 'Failed to delete calculation' },
      { status: 500 }
    );
  }
}