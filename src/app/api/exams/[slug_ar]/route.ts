import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminMiddleware, securityHeadersMiddleware } from '@/lib/middleware';

interface RouteParams {
  params: Promise<{ slug_ar: string }>;
}

// GET /api/exams/[slug_ar] - Get single exam calendar by slug
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const { slug_ar } = resolvedParams;

    const exam = await db.examCalendar.findUnique({
      where: { slug_ar },
      include: {
        seoMeta: true,
        heroImage: true
      }
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, message: 'Exam calendar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch exam calendar' },
      { status: 500 }
    );
  }
}

// PUT /api/exams/[slug_ar] - Update exam calendar (Admin only)
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

    const existingExam = await db.examCalendar.findUnique({
      where: { slug_ar }
    });

    if (!existingExam) {
      return NextResponse.json(
        { success: false, message: 'Exam calendar not found' },
        { status: 404 }
      );
    }

    const {
      title_ar,
      body_ar,
      exam_date,
      subject,
      school_level,
      sector,
      region,
      pdf_url,
      featured,
      published,
      seoMeta,
      heroImage
    } = data;

    const updatedExam = await db.examCalendar.update({
      where: { slug_ar },
      data: {
        title_ar,
        body_ar,
        exam_date: exam_date ? new Date(exam_date) : undefined,
        subject,
        school_level,
        sector,
        region,
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
      data: updatedExam,
      message: 'Exam calendar updated successfully'
    });
    return securityHeadersMiddleware(res);
  } catch (error) {
    console.error('Error updating exam:', error);
    const res = NextResponse.json(
      { success: false, message: 'Failed to update exam calendar' },
      { status: 500 }
    );
    return securityHeadersMiddleware(res);
  }
}

// DELETE /api/exams/[slug_ar] - Delete exam calendar (Admin only)
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

    const existingExam = await db.examCalendar.findUnique({
      where: { slug_ar }
    });

    if (!existingExam) {
      return NextResponse.json(
        { success: false, message: 'Exam calendar not found' },
        { status: 404 }
      );
    }

    await db.examCalendar.delete({
      where: { slug_ar }
    });

    const res = NextResponse.json({
      success: true,
      message: 'Exam calendar deleted successfully'
    });
    return securityHeadersMiddleware(res);
  } catch (error) {
    console.error('Error deleting exam:', error);
    const res = NextResponse.json(
      { success: false, message: 'Failed to delete exam calendar' },
      { status: 500 }
    );
    return securityHeadersMiddleware(res);
  }
}