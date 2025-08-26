import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    await db.$connect();
    
    // Check if admin user exists
    const adminCount = await db.admin.count();
    
    // Get database connection status
    const dbStatus = {
      connected: true,
      adminUsersCount: adminCount,
      hasAdminUser: adminCount > 0
    };
    
    return NextResponse.json({ 
      status: "healthy", 
      message: "Service is operational",
      database: dbStatus,
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
        hasAdminUser: false
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}