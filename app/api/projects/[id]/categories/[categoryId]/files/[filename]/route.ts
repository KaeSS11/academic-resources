import { NextRequest, NextResponse } from 'next/server';
import { getAllFiles, getFileBlobUrl, deleteFile } from '@/lib/files';
import { isAdminServer } from '@/lib/auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string; filename: string }> }
) {
  try {
    const { id, categoryId, filename } = await params;
    const files = await getAllFiles();
    const fileMetadata = files.find(
      f => f.filename === filename && 
           f.projectId === id && 
           f.categoryId === categoryId
    );

    if (!fileMetadata) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // If we have a blob URL (Vercel Blob), redirect to it
    if (fileMetadata.blobUrl) {
      return NextResponse.redirect(fileMetadata.blobUrl);
    }

    // Fallback to local file system (for development)
    const blobUrl = await getFileBlobUrl(id, categoryId, filename);
    if (blobUrl) {
      return NextResponse.redirect(blobUrl);
    }

    // If no blob URL, try to read from local filesystem
    const fs = await import('fs');
    const path = await import('path');
    const { getFilePath } = await import('@/lib/files');
    const filePath = getFilePath(id, categoryId, filename);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const contentType = fileMetadata.mimeType || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileMetadata.originalName || filename)}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
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
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    await deleteFile(id, categoryId, filename);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
