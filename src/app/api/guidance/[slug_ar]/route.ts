import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminMiddleware, securityHeadersMiddleware } from '@/lib/middleware';

interface RouteParams {
  params: Promise<{ slug_ar: string }>;
}

// GET /api/guidance/[slug_ar] - Get single school guidance by slug
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const { slug_ar } = resolvedParams;

    const guidance = await db.schoolGuidance.findUnique({
      where: { slug_ar },
      include: {
        seoMeta: true,
        heroImage: true
      }
    });

    if (!guidance) {
      return NextResponse.json(
        { success: false, message: 'School guidance not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: guidance
    });
  } catch (error) {
    console.error('Error fetching guidance:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch school guidance' },
      { status: 500 }
    );
  }
}

// PUT /api/guidance/[slug_ar] - Update school guidance (Admin only)
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

    const existingGuidance = await db.schoolGuidance.findUnique({
      where: { slug_ar }
    });

    if (!existingGuidance) {
      return NextResponse.json(
        { success: false, message: 'School guidance not found' },
        { status: 404 }
      );
    }

    const {
      title_ar,
      body_ar,
      sector,
      region,
      pdf_url,
      featured,
      published,
      seoMeta,
      heroImage
    } = data;

    const updatedGuidance = await db.schoolGuidance.update({
      where: { slug_ar },
      data: {
        title_ar,
        body_ar,
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
      data: updatedGuidance,
      message: 'School guidance updated successfully'
    });
    return securityHeadersMiddleware(res);
  } catch (error) {
    console.error('Error updating guidance:', error);
    const res = NextResponse.json(
      { success: false, message: 'Failed to update school guidance' },
      { status: 500 }
    );
    return securityHeadersMiddleware(res);
  }
}

// DELETE /api/guidance/[slug_ar] - Delete school guidance (Admin only)
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

    const existingGuidance = await db.schoolGuidance.findUnique({
      where: { slug_ar }
    });

    if (!existingGuidance) {
      return NextResponse.json(
        { success: false, message: 'School guidance not found' },
        { status: 404 }
      );
    }

    await db.schoolGuidance.delete({
      where: { slug_ar }
    });

    const res = NextResponse.json({
      success: true,
      message: 'School guidance deleted successfully'
    });
    return securityHeadersMiddleware(res);
  } catch (error) {
    console.error('Error deleting guidance:', error);
    const res = NextResponse.json(
      { success: false, message: 'Failed to delete school guidance' },
      { status: 500 }
    );
    return securityHeadersMiddleware(res);
  }
}