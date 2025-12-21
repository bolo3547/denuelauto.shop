import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyTenantAccess } from '@/middleware/tenantAuth';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await verifyTenantAccess(request);

    // Check if theme exists and is accessible
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

    // Deactivate current active theme
    await prisma.theme.updateMany({
      where: { 
        tenantId,
        isActive: true 
      },
      data: { isActive: false }
    });

    // If it's a global theme, create a copy for the tenant
    if (theme.isGlobal) {
      const newTheme = await prisma.theme.create({
        data: {
          name: theme.name,
          description: theme.description,
          themeConfig: theme.themeConfig,
          isActive: true,
          isGlobal: false,
          tenantId
        }
      });

      return NextResponse.json({ 
        message: 'Theme activated successfully',
        theme: newTheme 
      });
    } else {
      // Activate existing theme
      const updatedTheme = await prisma.theme.update({
        where: { id: params.id },
        data: { isActive: true }
      });

      return NextResponse.json({ 
        message: 'Theme activated successfully',
        theme: updatedTheme 
      });
    }
  } catch (error) {
    console.error('Failed to activate theme:', error);
    return NextResponse.json(
      { error: 'Failed to activate theme' },
      { status: 500 }
    );
  }
}