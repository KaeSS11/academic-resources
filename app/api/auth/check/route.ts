import { NextRequest, NextResponse } from 'next/server';
import { isAdminServer } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await isAdminServer();
    return NextResponse.json({ isAdmin });
  } catch (error) {
    return NextResponse.json({ isAdmin: false });
  }
}
