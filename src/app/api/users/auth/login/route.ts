import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateRequest, schemas, sanitize } from '@/lib/validation';
import { rateLimitMiddleware, securityHeadersMiddleware } from '@/lib/middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return securityHeadersMiddleware(rateLimitResponse);
  }

  // Validate request body
  const validation = await validateRequest(schemas.user.login)(request);
  if (!validation.valid) {
    return securityHeadersMiddleware(validation.response);
  }

  try {
    const { email, password } = validation.data;

    // Sanitize inputs
    const sanitizedEmail = sanitize.email(email);

    // Find user
    const user = await db.user.findUnique({
      where: { email: sanitizedEmail }
    });

    if (!user) {
      const response = NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
      return securityHeadersMiddleware(response);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const response = NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
      return securityHeadersMiddleware(response);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create response with HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferences: user.preferences
        },
        token
      }
    });

    // Set HTTP-only cookie for better security
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return securityHeadersMiddleware(response);

  } catch (error) {
    console.error('Login error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return securityHeadersMiddleware(response);
  }
}