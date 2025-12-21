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
    
    // Filter parameters
    const customerId = searchParams.get('customerId');
    const carId = searchParams.get('carId');
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const assignedTo = searchParams.get('assignedTo') || '';

    // Build where clause for filtering
    const where: any = {
      tenantId,
      ...(customerId && { customerId }),
      ...(carId && { carId }),
      ...(status && { status }),
      ...(type && { type }),
      ...(assignedTo && { assignedToId: assignedTo })
    };

    // Get inquiries with pagination and filtering
    const [inquiries, totalCount] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              status: true
            }
          },
          car: {
            select: {
              id: true,
              stockNo: true,
              make: true,
              model: true,
              year: true,
              priceUsd: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          respondedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.inquiry.count({ where })
    ]);

    // Get summary statistics
    const stats = await prisma.inquiry.aggregate({
      where: { tenantId },
      _count: { id: true }
    });

    const statusStats = await prisma.inquiry.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { id: true }
    });

    const typeStats = await prisma.inquiry.groupBy({
      by: ['type'],
      where: { tenantId },
      _count: { id: true }
    });

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: {
        total: stats._count.id,
        byStatus: statusStats,
        byType: typeStats
      }
    });

  } catch (error) {
    console.error('GET /api/inquiries error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
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

    const inquiryData = await request.json();

    // Validate required fields
    if (!inquiryData.customerId || !inquiryData.message) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, message' },
        { status: 400 }
      );
    }

    // Verify customer belongs to tenant
    const customer = await prisma.customer.findFirst({
      where: {
        id: inquiryData.customerId,
        tenantId
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Verify car belongs to tenant if carId is provided
    if (inquiryData.carId) {
      const car = await prisma.car.findFirst({
        where: {
          id: inquiryData.carId,
          tenantId
        }
      });

      if (!car) {
        return NextResponse.json(
          { error: 'Car not found' },
          { status: 404 }
        );
      }
    }

    // Create the inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        tenantId,
        customerId: inquiryData.customerId,
        carId: inquiryData.carId || null,
        message: inquiryData.message,
        type: inquiryData.type || 'GENERAL',
        status: inquiryData.status || 'NEW',
        priority: inquiryData.priority || 'MEDIUM',
        assignedToId: inquiryData.assignedToId || null,
        metadata: inquiryData.metadata || null
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true
          }
        },
        car: {
          select: {
            id: true,
            stockNo: true,
            make: true,
            model: true,
            year: true,
            priceUsd: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(inquiry, { status: 201 });

  } catch (error) {
    console.error('POST /api/inquiries error:', error);
    return NextResponse.json(
      { error: 'Failed to create inquiry' },
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

    const { id, response, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
    }

    // Check if inquiry exists and belongs to tenant
    const existingInquiry = await prisma.inquiry.findFirst({
      where: {
        id,
        tenantId
      }
    });

    if (!existingInquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    // Prepare update data
    const updatePayload: any = {
      ...updateData,
      updatedAt: new Date()
    };

    // If response is being added
    if (response && response.trim()) {
      updatePayload.response = response;
      updatePayload.respondedAt = new Date();
      updatePayload.respondedById = userId;
      updatePayload.status = updateData.status || 'RESPONDED';
    }

    // Update the inquiry
    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: updatePayload,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true
          }
        },
        car: {
          select: {
            id: true,
            stockNo: true,
            make: true,
            model: true,
            year: true,
            priceUsd: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        respondedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedInquiry);

  } catch (error) {
    console.error('PUT /api/inquiries error:', error);
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
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
    const inquiryId = searchParams.get('id');

    if (!inquiryId) {
      return NextResponse.json({ error: 'Inquiry ID required' }, { status: 400 });
    }

    // Check if inquiry exists and belongs to tenant
    const existingInquiry = await prisma.inquiry.findFirst({
      where: {
        id: inquiryId,
        tenantId
      }
    });

    if (!existingInquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    // Delete the inquiry
    await prisma.inquiry.delete({
      where: { id: inquiryId }
    });

    return NextResponse.json({
      message: 'Inquiry deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/inquiries error:', error);
    return NextResponse.json(
      { error: 'Failed to delete inquiry' },
      { status: 500 }
    );
  }
}