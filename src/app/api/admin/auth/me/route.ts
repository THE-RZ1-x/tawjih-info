export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { securityHeadersMiddleware, rateLimitMiddleware } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const rateLimited = rateLimitMiddleware(request);
    if (rateLimited) {
      return securityHeadersMiddleware(rateLimited);
    }

    const decoded = verifyToken(request);
    if (!decoded) {
      const res = NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
      res.cookies.delete('auth-token');
      return securityHeadersMiddleware(res);
    }

    if (decoded.role !== 'admin') {
      const res = NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
      return securityHeadersMiddleware(res);
    }

    const admin = await db.admin.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      const res = NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      );
      return securityHeadersMiddleware(res);
    }

    return securityHeadersMiddleware(NextResponse.json({ success: true, data: { admin } }));
  } catch (error) {
    console.error('Admin me error:', error);
    const res = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return securityHeadersMiddleware(res);
  }
}
