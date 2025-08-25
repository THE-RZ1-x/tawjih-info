import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authMiddleware, securityHeadersMiddleware } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const auth = authMiddleware(request);
    if (!auth) {
      const response = NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
      return securityHeadersMiddleware(response);
    }

    const savedJobs = await db.savedJob.findMany({
      where: { userId: auth.userId },
      include: {
        job: {
          include: {
            seoMeta: true,
            heroImage: true
          }
        }
      },
      orderBy: {
        job: {
        createdAt: 'desc'
        }
      }
    });

    const response = NextResponse.json({
      success: true,
      data: savedJobs
    });

    return securityHeadersMiddleware(response);

  } catch (error) {
    console.error('Get saved jobs error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return securityHeadersMiddleware(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authMiddleware(request);
    if (!auth) {
      const response = NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
      return securityHeadersMiddleware(response);
    }

    const { jobId } = await request.json();

    if (!jobId) {
      const response = NextResponse.json(
        { success: false, message: 'Job ID is required' },
        { status: 400 }
      );
      return securityHeadersMiddleware(response);
    }

    // Check if job exists and is published
    const job = await db.jobCompetition.findUnique({
      where: { id: jobId, published: true }
    });

    if (!job) {
      const response = NextResponse.json(
        { success: false, message: 'Job not found or not published' },
        { status: 404 }
      );
      return securityHeadersMiddleware(response);
    }

    // Check if already saved
    const existingSavedJob = await db.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: auth.userId,
          jobId
        }
      }
    });

    if (existingSavedJob) {
      const response = NextResponse.json(
        { success: false, message: 'Job already saved' },
        { status: 409 }
      );
      return securityHeadersMiddleware(response);
    }

    // Save job
    const savedJob = await db.savedJob.create({
      data: {
        userId: auth.userId,
        jobId
      },
      include: {
        job: {
          include: {
            seoMeta: true,
            heroImage: true
          }
        }
      }
    });

    const response = NextResponse.json({
      success: true,
      message: 'Job saved successfully',
      data: savedJob
    }, { status: 201 });

    return securityHeadersMiddleware(response);

  } catch (error) {
    console.error('Save job error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return securityHeadersMiddleware(response);
  }
}