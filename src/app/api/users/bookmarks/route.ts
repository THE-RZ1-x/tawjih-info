import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authMiddleware, securityHeadersMiddleware } from '@/lib/middleware';
import { validateRequest, schemas } from '@/lib/validation';

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

    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('type');

    const whereClause: any = { userId: auth.userId };
    if (targetType && ['job', 'guidance', 'exam'].includes(targetType)) {
      whereClause.targetType = targetType;
    }

    const bookmarks = await db.bookmark.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response = NextResponse.json({
      success: true,
      data: bookmarks
    });

    return securityHeadersMiddleware(response);

  } catch (error) {
    console.error('Get bookmarks error:', error);
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

    const validation = await validateRequest(schemas.bookmark.create)(request);
    if (!validation.valid) {
      return securityHeadersMiddleware(validation.response);
    }

    const { targetType, targetId } = validation.data;

    // Check if bookmark already exists
    const existingBookmark = await db.bookmark.findFirst({
      where: {
        userId: auth.userId,
        targetType,
        targetId
      }
    });

    if (existingBookmark) {
      const response = NextResponse.json(
        { success: false, message: 'Bookmark already exists' },
        { status: 409 }
      );
      return securityHeadersMiddleware(response);
    }

    // Verify the target exists
    let targetExists = false;
    switch (targetType) {
      case 'job':
        targetExists = await db.jobCompetition.count({
          where: { id: targetId, published: true }
        }) > 0;
        break;
      case 'guidance':
        targetExists = await db.schoolGuidance.count({
          where: { id: targetId, published: true }
        }) > 0;
        break;
      case 'exam':
        targetExists = await db.examCalendar.count({
          where: { id: targetId, published: true }
        }) > 0;
        break;
    }

    if (!targetExists) {
      const response = NextResponse.json(
        { success: false, message: 'Target not found or not published' },
        { status: 404 }
      );
      return securityHeadersMiddleware(response);
    }

    // Create bookmark
    const bookmark = await db.bookmark.create({
      data: {
        userId: auth.userId,
        targetType,
        targetId
      }
    });

    const response = NextResponse.json({
      success: true,
      message: 'Bookmark created successfully',
      data: bookmark
    }, { status: 201 });

    return securityHeadersMiddleware(response);

  } catch (error) {
    console.error('Create bookmark error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return securityHeadersMiddleware(response);
  }
}