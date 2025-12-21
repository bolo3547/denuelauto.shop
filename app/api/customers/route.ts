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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const source = searchParams.get('source') || '';
    const priority = searchParams.get('priority') || '';
    const assignedTo = searchParams.get('assignedTo') || '';

    // Build where clause for filtering
    const where: any = {
      tenantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } }
        ]
      }),
      ...(status && { status }),
      ...(source && { source }),
      ...(priority && { priority }),
      ...(assignedTo && { assignedToId: assignedTo })
    };

    // Get customers with pagination and filtering
    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          inquiries: {
            orderBy: { createdAt: 'desc' },
            take: 5, // Latest 5 inquiries
            include: {
              car: {
                select: {
                  stockNo: true,
                  make: true,
                  model: true,
                  year: true
                }
              }
            }
          },
          _count: {
            select: {
              inquiries: true
            }
          }
        }
      }),
      prisma.customer.count({ where })
    ]);

    // Get summary statistics
    const stats = await prisma.customer.aggregate({
      where: { tenantId },
      _count: { id: true }
    });

    const statusStats = await prisma.customer.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { id: true }
    });

    const sourceStats = await prisma.customer.groupBy({
      by: ['source'],
      where: { tenantId },
      _count: { id: true }
    });

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: {
        total: stats._count.id,
        byStatus: statusStats,
        bySource: sourceStats
      }
    });

  } catch (error) {
    console.error('GET /api/customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
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

    const customerData = await request.json();

    // Validate required fields
    if (!customerData.name || !customerData.email || !customerData.phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, phone' },
        { status: 400 }
      );
    }

    // Check for existing customer with same email
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        tenantId,
        email: customerData.email
      }
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 409 }
      );
    }

    // Create the customer
    const customer = await prisma.customer.create({
      data: {
        tenantId,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        whatsapp: customerData.whatsapp || null,
        source: customerData.source || 'MANUAL',
        status: customerData.status || 'NEW',
        priority: customerData.priority || 'MEDIUM',
        assignedToId: customerData.assignedToId || null,
        interestedCars: customerData.interestedCars || [],
        budget: customerData.budget || null,
        location: customerData.location || null,
        notes: customerData.notes || null,
        tags: customerData.tags || []
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        inquiries: true,
        _count: {
          select: {
            inquiries: true
          }
        }
      }
    });

    return NextResponse.json(customer, { status: 201 });

  } catch (error) {
    console.error('POST /api/customers error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
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
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Check if customer exists and belongs to tenant
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        tenantId
      }
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Check for email conflicts if email is being updated
    if (updateData.email && updateData.email !== existingCustomer.email) {
      const emailConflict = await prisma.customer.findFirst({
        where: {
          tenantId,
          email: updateData.email,
          id: { not: id }
        }
      });

      if (emailConflict) {
        return NextResponse.json(
          { error: 'Email already exists for another customer' },
          { status: 409 }
        );
      }
    }

    // Update the customer
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
        lastContactAt: updateData.updateLastContact ? new Date() : undefined
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        inquiries: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            car: {
              select: {
                stockNo: true,
                make: true,
                model: true,
                year: true
              }
            }
          }
        },
        _count: {
          select: {
            inquiries: true
          }
        }
      }
    });

    return NextResponse.json(updatedCustomer);

  } catch (error) {
    console.error('PUT /api/customers error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
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
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    // Check if customer exists and belongs to tenant
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId
      }
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Delete customer and related inquiries (cascade)
    await prisma.customer.delete({
      where: { id: customerId }
    });

    return NextResponse.json({
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/customers error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}