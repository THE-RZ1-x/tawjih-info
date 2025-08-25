import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminMiddleware, securityHeadersMiddleware } from '@/lib/middleware';

// GET /api/exams - Get all exam calendars
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sector = searchParams.get('sector');
    const region = searchParams.get('region');
    const featured = searchParams.get('featured');
    const published = searchParams.get('published');
    const school_level = searchParams.get('school_level');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (sector) where.sector = sector;
    if (region) where.region = region;
    if (featured === 'true') where.featured = true;
    if (published === 'true') where.published = true;
    else if (published === 'false') where.published = false;
    if (school_level) where.school_level = school_level;

    const [exams, total] = await Promise.all([
      db.examCalendar.findMany({
        where,
        include: {
          seoMeta: true,
          heroImage: true
        },
        orderBy: {
          exam_date: 'asc'
        },
        skip,
        take: limit
      }),
      db.examCalendar.count({ where })
    ]);

    const res = NextResponse.json({
      success: true,
      data: exams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return res;
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch exams' },
      { status: 500 }
    );
  }
}

// POST /api/exams - Create new exam calendar (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    if (!adminMiddleware(request)) {
      const res = NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
      return securityHeadersMiddleware(res);
    }
    const data = await request.json();
    const {
      title_ar,
      slug_ar,
      body_ar,
      sector,
      region,
      exam_date,
      subject,
      school_level,
      pdf_url,
      featured,
      published,
      seoMeta,
      heroImage
    } = data;

    // Check if slug already exists
    const existingExam = await db.examCalendar.findUnique({
      where: { slug_ar }
    });

    if (existingExam) {
      return NextResponse.json(
        { success: false, message: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Create exam calendar
    const exam = await db.examCalendar.create({
      data: {
        title_ar,
        slug_ar,
        body_ar,
        sector,
        region,
        exam_date: new Date(exam_date),
        subject,
        school_level,
        pdf_url,
        featured: featured === true,
        published: published === true,
        seoMeta: seoMeta ? {
          create: {
            title: seoMeta.title,
            description: seoMeta.description
          }
        } : undefined,
        heroImage: heroImage ? {
          create: {
            url: heroImage.url,
            alt_text: heroImage.alt_text
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
      data: exam,
      message: 'Exam calendar created successfully'
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return securityHeadersMiddleware(res);
  } catch (error) {
    console.error('Error creating exam:', error);
    const res = NextResponse.json(
      { success: false, message: 'Failed to create exam calendar' },
      { status: 500 }
    );
    return securityHeadersMiddleware(res);
  }
}