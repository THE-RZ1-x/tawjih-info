import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    await db.$connect();
    
    // Check if admin user exists
    const adminCount = await db.admin.count();
    const admins = await db.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });
    
    // Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      ADMIN_USERNAME: !!process.env.ADMIN_USERNAME,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      NODE_ENV: process.env.NODE_ENV
    };
    
    // Get database connection status
    const dbStatus = {
      connected: true,
      adminUsersCount: adminCount,
      hasAdminUser: adminCount > 0,
      adminUsers: admins,
      canCreateAdmin: envCheck.ADMIN_USERNAME && envCheck.ADMIN_EMAIL && envCheck.ADMIN_PASSWORD
    };
    
    // Admin access URLs
    const adminUrls = {
      loginPage: '/admin',
      initEndpoint: '/api/admin/init',
      testDb: '/api/db-test'
    };
    
    return NextResponse.json({ 
      status: "healthy", 
      message: "Service is operational",
      database: dbStatus,
      environment: envCheck,
      adminUrls,
      nextSteps: adminCount === 0 ? [
        "1. POST to /api/admin/init with body: {\"action\": \"initialize-admin\"}",
        "2. Then access /admin to login",
        "3. Use environment variable credentials"
      ] : [
        "1. Access /admin to login",
        "2. Use your admin credentials"
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json({ 
      status: "unhealthy", 
      message: "Service has issues",
      error: error instanceof Error ? error.message : "Unknown error",
      database: {
        connected: false,
        adminUsersCount: 0,
        hasAdminUser: false,
        canCreateAdmin: false
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: !!process.env.DATABASE_URL
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}