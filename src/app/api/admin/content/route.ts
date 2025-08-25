import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminMiddleware, securityHeadersMiddleware } from '@/lib/middleware';
import { sanitize } from '@/lib/validation';

function toISODate(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  try {
    // Accept YYYY-MM-DD and convert to ISO midnight UTC
    const iso = /\d{4}-\d{2}-\d{2}/.test(dateStr)
      ? new Date(`${dateStr}T00:00:00.000Z`)
      : new Date(dateStr);
    if (isNaN(iso.getTime())) return undefined;
    return iso;
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!adminMiddleware(request)) {
      const res = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      return securityHeadersMiddleware(res);
    }

    const body = await request.json();
    const type: 'job' | 'guidance' | 'exam' | undefined = body?.type;

    if (!type) {
      const res = NextResponse.json({ success: false, message: 'Content type is required' }, { status: 400 });
      return securityHeadersMiddleware(res);
    }

    // Common fields (sanitized)
    const title_ar = sanitize.string(body?.title_ar || '', 200);
    const slug_ar = sanitize.string(body?.slug_ar || '', 120);
    const body_ar = sanitize.html(body?.body_ar || '');
    const sector = sanitize.string(body?.sector || '', 100);
    const region = sanitize.string(body?.region || '', 100);
    const featured = body?.featured === true || body?.featured === 'true';
    const published = body?.published === true || body?.published === 'true';

    if (!title_ar || !slug_ar || !body_ar || !sector || !region) {
      const res = NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
      return securityHeadersMiddleware(res);
    }

    let created: any = null;

    if (type === 'job') {
      const closingDate = toISODate(body?.closing_date);

      created = await db.jobCompetition.create({
        data: {
          title_ar,
          slug_ar,
          body_ar,
          sector,
          region,
          closing_date: closingDate,
          pdf_url: body?.pdf_url ? sanitize.url(body.pdf_url) : undefined,
          featured,
          published,
          seoMeta: (body?.seo_title || body?.seo_description) ? {
            create: {
              title: body?.seo_title ? sanitize.string(body.seo_title, 60) : undefined,
              description: body?.seo_description ? sanitize.string(body.seo_description, 160) : undefined,
            }
          } : undefined,
          heroImage: (body?.hero_image_alt || body?.hero_image_url) ? {
            create: {
              url: body?.hero_image_url ? sanitize.url(body.hero_image_url) : 'https://via.placeholder.com/800x400',
              alt_text: sanitize.string(body.hero_image_alt || 'صورة', 100),
            }
          } : undefined,
        }
      });
    } else if (type === 'guidance') {
      created = await db.schoolGuidance.create({
        data: {
          title_ar,
          slug_ar,
          body_ar,
          sector,
          region,
          pdf_url: body?.pdf_url ? sanitize.url(body.pdf_url) : undefined,
          featured,
          published,
          seoMeta: (body?.seo_title || body?.seo_description) ? {
            create: {
              title: body?.seo_title ? sanitize.string(body.seo_title, 60) : undefined,
              description: body?.seo_description ? sanitize.string(body.seo_description, 160) : undefined,
            }
          } : undefined,
          heroImage: (body?.hero_image_alt || body?.hero_image_url) ? {
            create: {
              url: body?.hero_image_url ? sanitize.url(body.hero_image_url) : 'https://via.placeholder.com/800x400',
              alt_text: sanitize.string(body.hero_image_alt || 'صورة', 100),
            }
          } : undefined,
        }
      });
    } else if (type === 'exam') {
      const examDate = toISODate(body?.exam_date);
      const subject = sanitize.string(body?.subject || '', 100);
      const school_level = sanitize.string(body?.school_level || '', 50);

      if (!examDate || !subject || !school_level) {
        const res = NextResponse.json({ success: false, message: 'Missing exam fields' }, { status: 400 });
        return securityHeadersMiddleware(res);
      }

      created = await db.examCalendar.create({
        data: {
          title_ar,
          slug_ar,
          body_ar,
          exam_date: examDate,
          subject,
          school_level,
          sector,
          region,
          featured,
          published,
          seoMeta: (body?.seo_title || body?.seo_description) ? {
            create: {
              title: body?.seo_title ? sanitize.string(body.seo_title, 60) : undefined,
              description: body?.seo_description ? sanitize.string(body.seo_description, 160) : undefined,
            }
          } : undefined,
          heroImage: (body?.hero_image_alt || body?.hero_image_url) ? {
            create: {
              url: body?.hero_image_url ? sanitize.url(body.hero_image_url) : 'https://via.placeholder.com/800x400',
              alt_text: sanitize.string(body.hero_image_alt || 'صورة', 100),
            }
          } : undefined,
        }
      });
    }

    const response = NextResponse.json({ success: true, data: created });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return securityHeadersMiddleware(response);
  } catch (error: any) {
    console.error('Admin content creation error:', error);
    const res = NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    return securityHeadersMiddleware(res);
  }
}