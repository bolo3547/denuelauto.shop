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
    
    const theme = await prisma.theme.findFirst({
      where: {
        id: params.id,
        OR: [
          { tenantId },
          { isGlobal: true }
        ]
      }
    });

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ theme });
  } catch (error) {
    console.error('Failed to fetch theme:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theme' },
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
      name,
      description,
      themeConfig,
      isActive
    } = data;

    // Check if theme exists and belongs to tenant
    const existingTheme = await prisma.theme.findFirst({
      where: {
        id: params.id,
        tenantId
      }
    });

    if (!existingTheme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    // If setting as active, deactivate other themes
    if (isActive) {
      await prisma.theme.updateMany({
        where: { 
          tenantId,
          isActive: true,
          id: { not: params.id }
        },
        data: { isActive: false }
      });
    }

    const theme = await prisma.theme.update({
      where: { id: params.id },
      data: {
        name,
        description,
        themeConfig,
        isActive,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ theme });
  } catch (error) {
    console.error('Failed to update theme:', error);
    return NextResponse.json(
      { error: 'Failed to update theme' },
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

    // Check if theme exists and belongs to tenant
    const existingTheme = await prisma.theme.findFirst({
      where: {
        id: params.id,
        tenantId
      }
    });

    if (!existingTheme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    // Cannot delete active theme
    if (existingTheme.isActive) {
      return NextResponse.json(
        { error: 'Cannot delete active theme' },
        { status: 400 }
      );
    }

    await prisma.theme.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Theme deleted successfully' });
  } catch (error) {
    console.error('Failed to delete theme:', error);
    return NextResponse.json(
      { error: 'Failed to delete theme' },
      { status: 500 }
    );
  }
}