import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './src/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply security headers to all responses
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Admin route protection
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    // Check for admin authentication
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    try {
      const decoded = verifyToken(request);
      if (!decoded || decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  // API admin route protection
  if (pathname.startsWith('/api/admin') && !pathname.includes('/auth/login')) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    try {
      const decoded = verifyToken(request);
      if (!decoded || decoded.role !== 'admin') {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};