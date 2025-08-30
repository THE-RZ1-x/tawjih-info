export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { securityHeadersMiddleware } from '@/lib/middleware';

export async function GET() {
  try {
    // Test basic database connection
    await db.$connect();
    
    // Test if tables exist by counting records
    const tests = {
      connection: true,
      tables: {}
    };

    try {
      tests.tables = {
        admin: await db.admin.count(),
        jobCompetition: await db.jobCompetition.count(),
        schoolGuidance: await db.schoolGuidance.count(),
        examCalendar: await db.examCalendar.count(),
        user: await db.user.count(),
        savedJob: await db.savedJob.count(),
        bookmark: await db.bookmark.count(),
      };
    } catch (tableError) {
      console.error('Table access error:', tableError);
      tests.tables = {
        error: tableError instanceof Error ? tableError.message : 'Unknown table error'
      };
    }

    // Test environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      ADMIN_USERNAME: !!process.env.ADMIN_USERNAME,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      JWT_SECRET: !!process.env.JWT_SECRET,
    };

    const res = NextResponse.json({
      status: 'success',
      database: tests,
      environment: envCheck,
      timestamp: new Date().toISOString()
    });

    return securityHeadersMiddleware(res);

  } catch (error) {
    console.error('Database test error:', error);
    
    const res = NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });

    return securityHeadersMiddleware(res);
  } finally {
    await db.$disconnect();
  }
}