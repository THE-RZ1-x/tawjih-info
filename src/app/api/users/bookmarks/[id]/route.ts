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
    const bookmarkId = resolvedParams.id;

    // Check if bookmark exists and belongs to user
    const existingBookmark = await db.bookmark.findUnique({
      where: { id: bookmarkId }
    });

    if (!existingBookmark) {
      const response = NextResponse.json(
        { success: false, message: 'Bookmark not found' },
        { status: 404 }
      );
      return securityHeadersMiddleware(response);
    }

    if (existingBookmark.userId !== auth.userId) {
      const response = NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
      return securityHeadersMiddleware(response);
    }

    // Delete bookmark
    await db.bookmark.delete({
      where: { id: bookmarkId }
    });

    const response = NextResponse.json({
      success: true,
      message: 'Bookmark deleted successfully'
    });

    return securityHeadersMiddleware(response);

  } catch (error) {
    console.error('Delete bookmark error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return securityHeadersMiddleware(response);
  }
}