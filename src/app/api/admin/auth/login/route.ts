export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sanitize } from '@/lib/validation';
import { rateLimitMiddleware, securityHeadersMiddleware } from '@/lib/middleware';
import { createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return securityHeadersMiddleware(rateLimitResponse);
  }

  try {
    const body = await request.json();
    const usernameRaw: string | undefined = body?.username;
    const password: string | undefined = body?.password;

    if (!usernameRaw || !password) {
      const res = NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
      return securityHeadersMiddleware(res);
    }

    // Preserve emails (which include '@') and sanitize usernames differently
    const isEmailInput = usernameRaw.includes('@');
    const username = isEmailInput
      ? sanitize.email(usernameRaw)
      : sanitize.string(usernameRaw, 100);

    // Find admin by username or email (keep email as-is if input was an email)
    const admin = await db.admin.findFirst({
      where: {
        OR: [
          { username: username },
          { email: isEmailInput ? username : username.toLowerCase() },
        ],
      },
    });

    if (!admin) {
      const res = NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
      return securityHeadersMiddleware(res);
    }

    // Verify password with bcrypt
    const isHashed = admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$') || admin.password.startsWith('$2y$');
    let valid = false;
    
    if (isHashed) {
      valid = await bcrypt.compare(password, admin.password);
    } else {
      // For security, only allow hashed passwords in production
      if (process.env.NODE_ENV === 'production') {
        console.error('Plain text password detected in production - access denied');
        valid = false;
      } else {
        // Development fallback only
        console.warn('Plain text password detected - only allowed in development');
        valid = admin.password === password;
      }
    }

    if (!valid) {
      const res = NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
      return securityHeadersMiddleware(res);
    }

    // Issue JWT compatible with existing verifyToken (role: 'admin')
    const token = createToken({ userId: admin.id, email: admin.email, role: 'admin' });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: 'admin',
        },
        token,
      },
    });

    // Set httpOnly cookie to align with users auth flow
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return securityHeadersMiddleware(response);
  } catch (error) {
    console.error('Admin login error:', error);
    const res = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return securityHeadersMiddleware(res);
  }
}
