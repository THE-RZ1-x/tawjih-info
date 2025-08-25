import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authMiddleware, securityHeadersMiddleware } from '@/lib/middleware';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const auth = authMiddleware(request);
    if (!auth) {
      const response = NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
      return securityHeadersMiddleware(response);
    }

    const resolvedParams = await params;
    const savedJobId = resolvedParams.id;

    // Check if saved job exists and belongs to user
    const existingSavedJob = await db.savedJob.findUnique({
      where: {
        id: savedJobId,
        userId: auth.userId
      }
    });

    if (!existingSavedJob) {
      const response = NextResponse.json(
        { success: false, message: 'Saved job not found' },
        { status: 404 }
      );
      return securityHeadersMiddleware(response);
    }

    // Delete saved job
    await db.savedJob.delete({
      where: {
        id: savedJobId,
        userId: auth.userId
      }
    });

    const response = NextResponse.json({
      success: true,
      message: 'Saved job deleted successfully'
    });

    return securityHeadersMiddleware(response);

  } catch (error) {
    console.error('Delete saved job error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return securityHeadersMiddleware(response);
  }
}