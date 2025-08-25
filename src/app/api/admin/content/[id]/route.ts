import { NextRequest, NextResponse } from 'next/server';
import { adminMiddleware, securityHeadersMiddleware } from '@/lib/middleware';
import { db } from '@/lib/db';
import { sanitize } from '@/lib/validation';

async function updateById(id: string, body: any) {
  const commonData: any = {};
  if (typeof body.published === 'boolean') {
    commonData.published = body.published;
  } else if (typeof body.published === 'string') {
    if (body.published === 'true') commonData.published = true;
    else if (body.published === 'false') commonData.published = false;
  }
  if (typeof body.featured === 'boolean') {
    commonData.featured = body.featured;
  } else if (typeof body.featured === 'string') {
    if (body.featured === 'true') commonData.featured = true;
    else if (body.featured === 'false') commonData.featured = false;
  }
  if (typeof body.title_ar === 'string') commonData.title_ar = sanitize.string(body.title_ar, 200);

  // Try each model until one matches
  try { return await db.jobCompetition.update({ where: { id }, data: commonData }); } catch {}
  try { return await db.schoolGuidance.update({ where: { id }, data: commonData }); } catch {}
  try { return await db.examCalendar.update({ where: { id }, data: commonData }); } catch {}
  return null;
}

async function deleteById(id: string) {
  try { await db.savedJob.deleteMany({ where: { jobId: id } }); } catch {}
  try { await db.bookmark.deleteMany({ where: { targetId: id } }); } catch {}
  try { return await db.jobCompetition.delete({ where: { id } }); } catch {}
  try { return await db.schoolGuidance.delete({ where: { id } }); } catch {}
  try { return await db.examCalendar.delete({ where: { id } }); } catch {}
  return null;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    if (!adminMiddleware(request)) {
      const res = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      return securityHeadersMiddleware(res);
    }
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const updated = await updateById(id, body);
    if (!updated) {
      const res = NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
      return securityHeadersMiddleware(res);
    }
    const res = NextResponse.json({ success: true, data: updated });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return securityHeadersMiddleware(res);
  } catch (error) {
    console.error('Admin update error:', error);
    const res = NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    return securityHeadersMiddleware(res);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!adminMiddleware(request)) {
      const res = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      return securityHeadersMiddleware(res);
    }
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const deleted = await deleteById(id);
    if (!deleted) {
      const res = NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
      return securityHeadersMiddleware(res);
    }
    const res = NextResponse.json({ success: true });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return securityHeadersMiddleware(res);
  } catch (error) {
    console.error('Admin delete error:', error);
    const res = NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    return securityHeadersMiddleware(res);
  }
} 