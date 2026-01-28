import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getFilePath, getAllFiles } from '@/lib/files';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string; filename: string }> }
) {
  try {
    const { id, categoryId, filename } = await params;
    const filePath = getFilePath(id, categoryId, filename);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const files = getAllFiles();
    const fileMetadata = files.find(
      f => f.filename === filename && 
           f.projectId === id && 
           f.categoryId === categoryId
    );

    const fileBuffer = fs.readFileSync(filePath);
    const contentType = fileMetadata?.mimeType || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileMetadata?.originalName || filename)}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string; filename: string }> }
) {
  try {
    const { id, categoryId, filename } = await params;
    
    // Check if user is admin
    const { isAdminServer } = await import('@/lib/auth-server');
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { deleteFile } = await import('@/lib/files');
    deleteFile(id, categoryId, filename);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
