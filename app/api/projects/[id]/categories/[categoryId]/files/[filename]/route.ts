import { NextRequest, NextResponse } from 'next/server';
import { getAllFiles, deleteFile } from '@/lib/files';
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

    // Files are served as static assets from public/uploads
    // Redirect to the static file URL
    const fileUrl = `/uploads/${id}/${categoryId}/${filename}`;
    return NextResponse.redirect(new URL(fileUrl, request.url));
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

    // Check if we're in production (read-only mode)
    const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    if (isProduction) {
      return NextResponse.json(
        { 
          error: 'File deletion is disabled in production. This site is read-only.',
          hint: 'To delete files, remove them from public/uploads/ and update data/files.json, then commit to git. See DEPLOYMENT.md for instructions.'
        },
        { status: 403 }
      );
    }

    await deleteFile(id, categoryId, filename);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to delete file',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
