import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyTenantAccess } from '@/middleware/tenantAuth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const tenantId = await verifyTenantAccess(request);
    
    const themes = await prisma.theme.findMany({
      where: {
        OR: [
          { tenantId },
          { isGlobal: true }
        ]
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ themes });
  } catch (error) {
    console.error('Failed to fetch themes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await verifyTenantAccess(request);
    const data = await request.json();

    const {
      name,
      description,
      themeConfig,
      isActive = false
    } = data;

    // If setting as active, deactivate other themes
    if (isActive) {
      await prisma.theme.updateMany({
        where: { 
          tenantId,
          isActive: true 
        },
        data: { isActive: false }
      });
    }

    const theme = await prisma.theme.create({
      data: {
        name,
        description,
        themeConfig,
        isActive,
        tenantId
      }
    });

    return NextResponse.json({ theme }, { status: 201 });
  } catch (error) {
    console.error('Failed to create theme:', error);
    return NextResponse.json(
      { error: 'Failed to create theme' },
      { status: 500 }
    );
  }
}