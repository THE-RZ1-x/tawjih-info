export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { securityHeadersMiddleware } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    // Only allow this in specific conditions for security
    const { action } = await request.json();
    
    if (action !== 'initialize-admin') {
      const res = NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      );
      return securityHeadersMiddleware(res);
    }

    // Check if admin already exists
    const existingAdmin = await db.admin.findFirst();
    
    if (existingAdmin) {
      const res = NextResponse.json({
        success: false,
        message: 'Admin user already exists',
        hasAdmin: true
      });
      return securityHeadersMiddleware(res);
    }

    // Get admin credentials from environment variables
    const username = process.env.ADMIN_USERNAME || 'admin';
    const email = process.env.ADMIN_EMAIL || 'admin@tawjih-info.ma';
    const password = process.env.ADMIN_PASSWORD || 'TawijhSecure2025!Morocco';

    if (!password || password.length < 8) {
      const res = NextResponse.json(
        { success: false, message: 'Admin password not configured properly' },
        { status: 500 }
      );
      return securityHeadersMiddleware(res);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the admin user
    const admin = await db.admin.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    const res = NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        createdAt: admin.createdAt,
      },
    });

    return securityHeadersMiddleware(res);

  } catch (error) {
    console.error('Admin initialization error:', error);
    
    const res = NextResponse.json(
      { 
        success: false, 
        message: 'Failed to initialize admin user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    return securityHeadersMiddleware(res);
  }
}

// GET endpoint to check admin status
export async function GET() {
  try {
    const adminCount = await db.admin.count();
    
    const res = NextResponse.json({
      hasAdmin: adminCount > 0,
      adminCount,
      initialized: adminCount > 0
    });

    return securityHeadersMiddleware(res);
    
  } catch (error) {
    console.error('Admin status check error:', error);
    
    const res = NextResponse.json(
      { 
        hasAdmin: false,
        adminCount: 0,
        initialized: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    return securityHeadersMiddleware(res);
  }
}