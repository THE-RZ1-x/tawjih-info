import { NextResponse } from 'next/server';
import { securityHeadersMiddleware } from '@/lib/middleware';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: 'Logout successful' });
    response.cookies.delete('auth-token');
    return securityHeadersMiddleware(response);
  } catch (error) {
    console.error('Admin logout error:', error);
    const res = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return securityHeadersMiddleware(res);
  }
}
