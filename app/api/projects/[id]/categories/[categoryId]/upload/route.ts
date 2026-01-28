import { NextRequest, NextResponse } from 'next/server';
import { saveFile, saveFileMetadata } from '@/lib/files';
import { isAdminServer } from '@/lib/auth-server';

// Simple ID generator
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { id, categoryId } = await params;
    
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
          error: 'File uploads are disabled in production. This site is read-only.',
          hint: 'To add files, place them in public/uploads/[projectId]/[categoryId]/ and update data/files.json, then commit to git. See DEPLOYMENT.md for instructions.'
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${generateId()}-${file.name}`;
      
      const blobUrl = await saveFile(id, categoryId, filename, buffer);

      const metadata = {
        id: generateId(),
        projectId: id,
        categoryId: categoryId,
        filename,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        blobUrl: typeof blobUrl === 'string' && blobUrl.startsWith('http') ? blobUrl : undefined,
      };

      await saveFileMetadata(metadata);
      uploadedFiles.push(metadata);
    }

    return NextResponse.json({ files: uploadedFiles }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to upload files',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
