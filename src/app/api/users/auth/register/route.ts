import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { validateRequest, schemas, sanitize } from '@/lib/validation';
import { rateLimitMiddleware, securityHeadersMiddleware } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return securityHeadersMiddleware(rateLimitResponse);
  }

  // Validate request body
  const validation = await validateRequest(schemas.user.register)(request);
  if (!validation.valid) {
    return securityHeadersMiddleware(validation.response);
  }

  try {
    const { name, email, password } = validation.data;

    // Sanitize inputs
    const sanitizedName = sanitize.string(name);
    const sanitizedEmail = sanitize.email(email);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: sanitizedEmail }
    });

    if (existingUser) {
      const response = NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 409 }
      );
      return securityHeadersMiddleware(response);
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await db.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        passwordHash,
        preferences: {
          theme: 'light',
          notifications: true,
          emailUpdates: true,
          savedJobs: [],
          favoriteRegions: [],
          favoriteSectors: []
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        preferences: true,
        createdAt: true
      }
    });

    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: user
    }, { status: 201 });

    return securityHeadersMiddleware(response);

  } catch (error) {
    console.error('Registration error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return securityHeadersMiddleware(response);
  }
}