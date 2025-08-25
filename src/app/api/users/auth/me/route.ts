import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { securityHeadersMiddleware, rateLimitMiddleware } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const rateLimited = rateLimitMiddleware(request);
    if (rateLimited) {
      return securityHeadersMiddleware(rateLimited);
    }

    const decodedToken = verifyToken(request);
    
    if (!decodedToken) {
      const response = NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
      // Clear invalid/expired token to force fresh login
      response.cookies.delete('auth-token');
      return securityHeadersMiddleware(response);
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: decodedToken.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        preferences: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      const response = NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
      return securityHeadersMiddleware(response);
    }

    const response = NextResponse.json({
      success: true,
      data: { user }
    });
    return securityHeadersMiddleware(response);

  } catch (error) {
    console.error('Auth me error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return securityHeadersMiddleware(response);
  }
}