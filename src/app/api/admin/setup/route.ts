export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { securityHeadersMiddleware } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const { action, force = false } = await request.json();
    
    if (action !== 'setup-database') {
      const res = NextResponse.json(
        { success: false, message: 'Invalid action. Use "setup-database"' },
        { status: 400 }
      );
      return securityHeadersMiddleware(res);
    }

    // Test database connection first
    await db.$connect();
    
    // Check if admin already exists
    const existingAdmin = await db.admin.findFirst();
    
    if (existingAdmin && !force) {
      const res = NextResponse.json({
        success: false,
        message: 'Admin user already exists',
        admin: {
          id: existingAdmin.id,
          username: existingAdmin.username,
          email: existingAdmin.email,
          createdAt: existingAdmin.createdAt
        },
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
        { success: false, message: 'Admin password not configured properly or too weak' },
        { status: 500 }
      );
      return securityHeadersMiddleware(res);
    }

    // If force is true, delete existing admin
    if (force && existingAdmin) {
      await db.admin.delete({
        where: { id: existingAdmin.id }
      });
    }

    // Hash the password with a strong salt
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

    // Test database tables
    const tableStats = {
      admins: await db.admin.count(),
      jobCompetitions: await db.jobCompetition.count(),
      schoolGuidance: await db.schoolGuidance.count(),
      examCalendars: await db.examCalendar.count(),
      users: await db.user.count(),
    };

    const res = NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        createdAt: admin.createdAt,
      },
      tableStats,
      nextSteps: [
        '1. Access /admin to login',
        `2. Use username: ${username}`,
        `3. Use email: ${email}`,
        '4. Use the configured admin password'
      ]
    });

    return securityHeadersMiddleware(res);

  } catch (error) {
    console.error('Database setup error:', error);
    
    const res = NextResponse.json(
      { 
        success: false, 
        message: 'Failed to setup database',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check if your DATABASE_URL is correct and database is accessible'
      },
      { status: 500 }
    );
    return securityHeadersMiddleware(res);
  }
}

// GET endpoint to check database status
export async function GET() {
  try {
    await db.$connect();
    
    const adminCount = await db.admin.count();
    const admins = await db.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });
    
    const tableStats = {
      admins: adminCount,
      jobCompetitions: await db.jobCompetition.count(),
      schoolGuidance: await db.schoolGuidance.count(),
      examCalendars: await db.examCalendar.count(),
      users: await db.user.count(),
    };
    
    const res = NextResponse.json({
      success: true,
      message: 'Database status check',
      hasAdmin: adminCount > 0,
      adminCount,
      admins,
      tableStats,
      environmentCheck: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        ADMIN_USERNAME: !!process.env.ADMIN_USERNAME,
        ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
        ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      }
    });

    return securityHeadersMiddleware(res);
    
  } catch (error) {
    console.error('Database status check error:', error);
    
    const res = NextResponse.json(
      { 
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    return securityHeadersMiddleware(res);
  }
}