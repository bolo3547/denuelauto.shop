import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');
    
    if (!tenantId || !userId) {
      return NextResponse.json({ error: 'Tenant ID and User ID required' }, { status: 400 });
    }

    const data = await request.formData();
    const files: File[] = data.getAll('files') as File[];
    const carId = data.get('carId') as string;
    const mediaType = data.get('mediaType') as string || 'image'; // image, video, vr360

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Validate car exists and belongs to tenant
    if (carId) {
      const car = await prisma.car.findFirst({
        where: {
          id: carId,
          tenantId
        }
      });

      if (!car) {
        return NextResponse.json({ error: 'Car not found' }, { status: 404 });
      }
    }

    const uploadedFiles = [];

    for (const file of files) {
      // Validate file type
      const allowedTypes = {
        image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        video: ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'],
        vr360: ['image/jpeg', 'image/jpg', 'image/png']
      };

      if (!allowedTypes[mediaType as keyof typeof allowedTypes]?.includes(file.type)) {
        continue; // Skip invalid file types
      }

      // Validate file size (10MB for images, 50MB for videos)
      const maxSize = mediaType === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        continue; // Skip files that are too large
      }

      // Generate unique filename
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const hash = crypto.createHash('md5').update(buffer).digest('hex');
      const ext = path.extname(file.name);
      const filename = `${hash}${ext}`;
      const relativePath = `uploads/${tenantId}/${mediaType}s/${filename}`;
      const fullPath = path.join(process.cwd(), 'public', relativePath);

      // Create directory if it doesn't exist
      const dir = path.dirname(fullPath);
      await import('fs/promises').then(fs => fs.mkdir(dir, { recursive: true }));

      // Save file
      await writeFile(fullPath, buffer);

      // Save to database if carId is provided
      let mediaRecord = null;
      if (carId) {
        if (mediaType === 'image') {
          mediaRecord = await prisma.carImage.create({
            data: {
              carId,
              url: `/${relativePath}`,
              filename: file.name,
              fileSize: file.size,
              mimeType: file.type,
              isPrimary: false, // TODO: Set first image as primary
              uploadedById: userId
            }
          });
        } else if (mediaType === 'video') {
          mediaRecord = await prisma.carVideo.create({
            data: {
              carId,
              url: `/${relativePath}`,
              filename: file.name,
              fileSize: file.size,
              mimeType: file.type,
              uploadedById: userId
            }
          });
        }
        // TODO: Add VR360 model to schema
      }

      uploadedFiles.push({
        filename: file.name,
        url: `/${relativePath}`,
        size: file.size,
        type: file.type,
        mediaType,
        id: mediaRecord?.id
      });
    }

    return NextResponse.json({
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
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
    const mediaId = searchParams.get('id');
    const mediaType = searchParams.get('type') || 'image';

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 });
    }

    // Delete from database and get file path
    let mediaRecord = null;
    if (mediaType === 'image') {
      mediaRecord = await prisma.carImage.findFirst({
        where: { id: mediaId },
        include: { car: true }
      });

      if (mediaRecord && mediaRecord.car.tenantId === tenantId) {
        await prisma.carImage.delete({ where: { id: mediaId } });
      }
    } else if (mediaType === 'video') {
      mediaRecord = await prisma.carVideo.findFirst({
        where: { id: mediaId },
        include: { car: true }
      });

      if (mediaRecord && mediaRecord.car.tenantId === tenantId) {
        await prisma.carVideo.delete({ where: { id: mediaId } });
      }
    }

    if (!mediaRecord) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete physical file
    try {
      const fullPath = path.join(process.cwd(), 'public', mediaRecord.url);
      await import('fs/promises').then(fs => fs.unlink(fullPath));
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError);
    }

    return NextResponse.json({
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/upload error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}