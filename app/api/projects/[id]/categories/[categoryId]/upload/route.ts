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
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
