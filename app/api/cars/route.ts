import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Filter parameters
    const search = searchParams.get('search') || '';
    const make = searchParams.get('make') || '';
    const model = searchParams.get('model') || '';
    const yearFrom = searchParams.get('yearFrom');
    const yearTo = searchParams.get('yearTo');
    const priceFrom = searchParams.get('priceFrom');
    const priceTo = searchParams.get('priceTo');
    const condition = searchParams.get('condition') || '';
    const availability = searchParams.get('availability') || '';

    // Build where clause for filtering
    const where: any = {
      tenantId,
      ...(search && {
        OR: [
          { stockNo: { contains: search, mode: 'insensitive' } },
          { make: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { vin: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(make && { make: { contains: make, mode: 'insensitive' } }),
      ...(model && { model: { contains: model, mode: 'insensitive' } }),
      ...(yearFrom && { year: { gte: parseInt(yearFrom) } }),
      ...(yearTo && { year: { lte: parseInt(yearTo) } }),
      ...(priceFrom && { priceUsd: { gte: parseFloat(priceFrom) } }),
      ...(priceTo && { priceUsd: { lte: parseFloat(priceTo) } }),
      ...(condition && { condition }),
      ...(availability && { availability })
    };

    // Get cars with pagination and filtering
    const [cars, totalCount] = await Promise.all([
      prisma.car.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: true,
          _count: {
            select: {
              images: true,
              videos: true
            }
          }
        }
      }),
      prisma.car.count({ where })
    ]);

    // Get summary statistics
    const stats = await prisma.car.aggregate({
      where: { tenantId },
      _count: { id: true },
      _avg: { priceUsd: true }
    });

    const availabilityStats = await prisma.car.groupBy({
      by: ['availability'],
      where: { tenantId },
      _count: { id: true }
    });

    const conditionStats = await prisma.car.groupBy({
      by: ['condition'],
      where: { tenantId },
      _count: { id: true }
    });

    return NextResponse.json({
      cars,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: {
        total: stats._count.id,
        averagePrice: stats._avg.priceUsd,
        byAvailability: availabilityStats,
        byCondition: conditionStats
      }
    });

  } catch (error) {
    console.error('GET /api/cars error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
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

    const carData = await request.json();

    // Validate required fields
    if (!carData.stockNo || !carData.make || !carData.model || !carData.year) {
      return NextResponse.json(
        { error: 'Missing required fields: stockNo, make, model, year' },
        { status: 400 }
      );
    }

    // Check for duplicate stock number within tenant
    const existingCar = await prisma.car.findFirst({
      where: {
        tenantId,
        stockNo: carData.stockNo
      }
    });

    if (existingCar) {
      return NextResponse.json(
        { error: 'Stock number already exists' },
        { status: 409 }
      );
    }

    // Create the car
    const car = await prisma.car.create({
      data: {
        tenantId,
        createdById: userId,
        stockNo: carData.stockNo,
        vin: carData.vin || null,
        make: carData.make,
        model: carData.model,
        grade: carData.grade || null,
        year: parseInt(carData.year),
        bodyType: carData.bodyType || null,
        transmission: carData.transmission || 'Manual',
        drivetrain: carData.drivetrain || 'FWD',
        fuelType: carData.fuelType || 'Petrol',
        engineCc: carData.engineCc ? parseInt(carData.engineCc) : null,
        mileageKm: carData.mileageKm ? parseInt(carData.mileageKm) : null,
        colorExt: carData.colorExt || null,
        colorInt: carData.colorInt || null,
        steering: carData.steering || 'Left',
        condition: carData.condition || 'used',
        priceLocalZmw: carData.priceLocalZmw ? parseFloat(carData.priceLocalZmw) : null,
        priceUsd: carData.priceUsd ? parseFloat(carData.priceUsd) : null,
        remarks: carData.remarks || null,
        publishToPublic: carData.publishToPublic || false,
        publishToExport: carData.publishToExport || false,
        availability: 'available'
      },
      include: {
        images: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(car, { status: 201 });

  } catch (error) {
    console.error('POST /api/cars error:', error);
    return NextResponse.json(
      { error: 'Failed to create car' },
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
      return NextResponse.json({ error: 'Car ID is required' }, { status: 400 });
    }

    // Check if car exists and belongs to tenant
    const existingCar = await prisma.car.findFirst({
      where: {
        id,
        tenantId
      }
    });

    if (!existingCar) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Check for stock number conflicts if stock number is being updated
    if (updateData.stockNo && updateData.stockNo !== existingCar.stockNo) {
      const stockConflict = await prisma.car.findFirst({
        where: {
          tenantId,
          stockNo: updateData.stockNo,
          id: { not: id }
        }
      });

      if (stockConflict) {
        return NextResponse.json(
          { error: 'Stock number already exists' },
          { status: 409 }
        );
      }
    }

    // Update the car
    const updatedCar = await prisma.car.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
        year: updateData.year ? parseInt(updateData.year) : undefined,
        engineCc: updateData.engineCc ? parseInt(updateData.engineCc) : undefined,
        mileageKm: updateData.mileageKm ? parseInt(updateData.mileageKm) : undefined,
        priceLocalZmw: updateData.priceLocalZmw ? parseFloat(updateData.priceLocalZmw) : undefined,
        priceUsd: updateData.priceUsd ? parseFloat(updateData.priceUsd) : undefined
      },
      include: {
        images: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedCar);

  } catch (error) {
    console.error('PUT /api/cars error:', error);
    return NextResponse.json(
      { error: 'Failed to update car' },
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
    const carId = searchParams.get('id');
    const carIds = searchParams.get('ids')?.split(',') || [];

    if (!carId && carIds.length === 0) {
      return NextResponse.json({ error: 'Car ID(s) required' }, { status: 400 });
    }

    const idsToDelete = carId ? [carId] : carIds;

    // Check if all cars exist and belong to tenant
    const existingCars = await prisma.car.findMany({
      where: {
        id: { in: idsToDelete },
        tenantId
      }
    });

    if (existingCars.length !== idsToDelete.length) {
      return NextResponse.json({ error: 'Some cars not found' }, { status: 404 });
    }

    // Delete the cars
    const deleteResult = await prisma.car.deleteMany({
      where: {
        id: { in: idsToDelete },
        tenantId
      }
    });

    return NextResponse.json({
      message: `${deleteResult.count} car(s) deleted successfully`,
      deletedCount: deleteResult.count
    });

  } catch (error) {
    console.error('DELETE /api/cars error:', error);
    return NextResponse.json(
      { error: 'Failed to delete car(s)' },
      { status: 500 }
    );
  }
}