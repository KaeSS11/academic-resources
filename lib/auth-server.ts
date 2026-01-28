// Server-side authentication helper (Server Components and API routes only)
import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'admin_session';

// Check if we're in production (read-only mode)
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
}

// Admin password - works in both dev and production
// Note: In production, login works but create/upload features are disabled (read-only)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD 
  ? process.env.ADMIN_PASSWORD.trim() 
  : 'admin123'; // Default password

export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  return password.trim() === ADMIN_PASSWORD;
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function isAdminServer(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(ADMIN_COOKIE_NAME)?.value === 'authenticated';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false; // Fail securely - if we can't check, assume not admin
  }
}
