import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { adminMiddleware, securityHeadersMiddleware } from '@/lib/middleware';

interface RouteParams {
  params: Promise<{ slug_ar: string }>;
}

// GET /api/jobs/[slug_ar] - Get single job competition by slug
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const { slug_ar } = resolvedParams;

    const job = await db.jobCompetition.findUnique({
      where: { slug_ar },
      include: {
        seoMeta: true,
        heroImage: true
      }
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Job competition not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch job competition' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[slug_ar] - Update job competition (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Require admin authentication
    if (!adminMiddleware(request)) {
      const res = NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
      return securityHeadersMiddleware(res);
    }
    const resolvedParams = await params;
    const { slug_ar } = resolvedParams;
    const data = await request.json();

    const existingJob = await db.jobCompetition.findUnique({
      where: { slug_ar }
    });

    if (!existingJob) {
      return NextResponse.json(
        { success: false, message: 'Job competition not found' },
        { status: 404 }
      );
    }

    const {
      title_ar,
      body_ar,
      sector,
      region,
      closing_date,
      pdf_url,
      featured,
      published,
      seoMeta,
      heroImage
    } = data;

    const updatedJob = await db.jobCompetition.update({
      where: { slug_ar },
      data: {
        title_ar,
        body_ar,
        sector,
        region,
        closing_date: closing_date ? new Date(closing_date) : null,
        pdf_url,
        featured: featured || false,
        published: published || false,
        seoMeta: seoMeta ? {
          upsert: {
            create: {
              title: seoMeta.title,
              description: seoMeta.description
            },
            update: {
              title: seoMeta.title,
              description: seoMeta.description
            }
          }
        } : undefined,
        heroImage: heroImage ? {
          upsert: {
            create: {
              url: heroImage.url,
              alt_text: heroImage.alt_text
            },
            update: {
              url: heroImage.url,
              alt_text: heroImage.alt_text
            }
          }
        } : undefined
      },
      include: {
        seoMeta: true,
        heroImage: true
      }
    });

    const res = NextResponse.json({
      success: true,
      data: updatedJob,
      message: 'Job competition updated successfully'
    });
    return securityHeadersMiddleware(res);
  } catch (error) {
    console.error('Error updating job:', error);
    const res = NextResponse.json(
      { success: false, message: 'Failed to update job competition' },
      { status: 500 }
    );
    return securityHeadersMiddleware(res);
  }
}

// DELETE /api/jobs/[slug_ar] - Delete job competition (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Require admin authentication
    if (!adminMiddleware(request)) {
      const res = NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
      return securityHeadersMiddleware(res);
    }
    const resolvedParams = await params;
    const { slug_ar } = resolvedParams;

    const existingJob = await db.jobCompetition.findUnique({
      where: { slug_ar }
    });

    if (!existingJob) {
      return NextResponse.json(
        { success: false, message: 'Job competition not found' },
        { status: 404 }
      );
    }

    await db.jobCompetition.delete({
      where: { slug_ar }
    });

    const res = NextResponse.json({
      success: true,
      message: 'Job competition deleted successfully'
    });
    return securityHeadersMiddleware(res);
  } catch (error) {
    console.error('Error deleting job:', error);
    const res = NextResponse.json(
      { success: false, message: 'Failed to delete job competition' },
      { status: 500 }
    );
    return securityHeadersMiddleware(res);
  }
}