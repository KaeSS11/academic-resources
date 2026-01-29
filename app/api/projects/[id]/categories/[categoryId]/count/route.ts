import { NextRequest, NextResponse } from 'next/server';
import { getFilesByCategory } from '@/lib/files';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { id, categoryId } = await params;
    
    // Get file count without requiring password
    // This endpoint is public to show counts even for locked folders
    const files = await getFilesByCategory(id, categoryId);
    
    return NextResponse.json({ count: files.length });
  } catch (error) {
    console.error('Failed to count files:', error);
    return NextResponse.json(
      { count: 0 },
      { status: 200 }
    );
  }
}
