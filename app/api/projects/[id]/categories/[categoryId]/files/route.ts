import { NextRequest, NextResponse } from 'next/server';
import { getFilesByCategory } from '@/lib/files';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { id, categoryId } = await params;
    const files = await getFilesByCategory(id, categoryId);
    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}
