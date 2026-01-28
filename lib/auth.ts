// Client-side authentication helper (Client Components only)

export async function checkAdminStatus(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/check');
    if (!response.ok) return false;
    const data = await response.json();
    return data.isAdmin === true;
  } catch {
    return false;
  }
}

export async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  }
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}
