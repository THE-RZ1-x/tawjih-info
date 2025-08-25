import { NextRequest, NextResponse } from 'next/server';
import { adminMiddleware, securityHeadersMiddleware } from '@/lib/middleware';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    if (!adminMiddleware(request)) {
      const res = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      return securityHeadersMiddleware(res);
    }

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'all') as 'all' | 'job' | 'guidance' | 'exam';
    const q = (searchParams.get('q') || '').toLowerCase();
    const sector = searchParams.get('sector') || undefined;
    const region = searchParams.get('region') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);

    const filters = (item: { title_ar: string; sector: string; region: string }) => {
      const matchQ = !q || item.title_ar.toLowerCase().includes(q);
      const matchSector = !sector || (item.sector || '').toLowerCase().includes(sector.toLowerCase());
      const matchRegion = !region || (item.region || '').toLowerCase().includes(region.toLowerCase());
      return matchQ && matchSector && matchRegion;
    };

    const results: any[] = [];

    if (type === 'all' || type === 'job') {
      const items = await db.jobCompetition.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      items.filter(filters).forEach((p) => results.push({
        id: p.id,
        title_ar: p.title_ar,
        type: 'job',
        published: p.published,
        featured: p.featured,
        createdAt: p.createdAt,
        sector: p.sector,
        region: p.region,
      }));
    }

    if (type === 'all' || type === 'guidance') {
      const items = await db.schoolGuidance.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      items.filter(filters).forEach((p) => results.push({
        id: p.id,
        title_ar: p.title_ar,
        type: 'guidance',
        published: p.published,
        featured: p.featured,
        createdAt: p.createdAt,
        sector: p.sector,
        region: p.region,
      }));
    }

    if (type === 'all' || type === 'exam') {
      const items = await db.examCalendar.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      items.filter(filters).forEach((p) => results.push({
        id: p.id,
        title_ar: p.title_ar,
        type: 'exam',
        published: p.published,
        featured: p.featured,
        createdAt: p.createdAt,
        sector: p.sector,
        region: p.region,
      }));
    }

    // Sort all results by createdAt desc and cap by limit
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const res = NextResponse.json({ success: true, data: results.slice(0, limit) });
    return securityHeadersMiddleware(res);
  } catch (error) {
    console.error('Admin list error:', error);
    const res = NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    return securityHeadersMiddleware(res);
  }
} 