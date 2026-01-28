import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    await clearAdminSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
