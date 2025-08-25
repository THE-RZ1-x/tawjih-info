import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schemas, sanitize, createValidationError } from '@/lib/validation';
import { securityHeadersMiddleware } from '@/lib/middleware';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'job' | 'guidance' | 'exam';
  url: string;
  score: number;
  highlights: {
    title: string[];
    content: string[];
  };
  sector: string;
  region: string;
  createdAt: string;
  featured?: boolean;
  closingDate?: string;
  examDate?: string;
}

// Advanced text search with scoring
function calculateSearchScore(
  item: any,
  query: string,
  type: 'job' | 'guidance' | 'exam'
): number {
  const normalizedQuery = query.toLowerCase();
  let score = 0;

  // Title matches (highest weight)
  const title = item.title_ar?.toLowerCase() || '';
  if (title.includes(normalizedQuery)) {
    score += 10;
    // Exact title match gets bonus
    if (title === normalizedQuery) {
      score += 20;
    }
    // Title starts with query gets bonus
    if (title.startsWith(normalizedQuery)) {
      score += 15;
    }
  }

  // Content matches (medium weight)
  const content = item.body_ar?.toLowerCase() || '';
  if (content.includes(normalizedQuery)) {
    score += 5;
    // Multiple occurrences get bonus
    const occurrences = (content.match(new RegExp(normalizedQuery, 'g')) || []).length;
    score += Math.min(occurrences * 2, 10);
  }

  // Sector matches (medium weight)
  const sector = item.sector?.toLowerCase() || '';
  if (sector.includes(normalizedQuery)) {
    score += 7;
  }

  // Region matches (medium weight)
  const region = item.region?.toLowerCase() || '';
  if (region.includes(normalizedQuery)) {
    score += 7;
  }

  // Featured content bonus
  if (item.featured) {
    score += 3;
  }

  // Recency bonus (newer content gets slight bonus)
  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceCreated <= 7) {
    score += 2;
  }

  // Urgent jobs bonus (closing soon)
  if (type === 'job' && item.closing_date) {
    const daysUntilClosing = Math.floor(
      (new Date(item.closing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilClosing <= 7 && daysUntilClosing >= 0) {
      score += 5;
    }
  }

  return score;
}

// Generate search highlights
function generateHighlights(text: string, query: string): string[] {
  const normalizedQuery = query.toLowerCase();
  const normalizedText = text.toLowerCase();
  const highlights: string[] = [];

  // Find all occurrences of the query
  const regex = new RegExp(normalizedQuery, 'gi');
  let match;
  
  while ((match = regex.exec(normalizedText)) !== null) {
    const start = Math.max(0, match.index - 50);
    const end = Math.min(text.length, match.index + match[0].length + 50);
    const highlight = text.substring(start, end);
    
    // Highlight the matched term
    const highlightedText = highlight.replace(
      new RegExp(match[0], 'gi'),
      `<mark>${match[0]}</mark>`
    );
    
    highlights.push(highlightedText);
  }

  return highlights.slice(0, 3); // Return max 3 highlights
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate search parameters (GET)
    const parsed = schemas.search.query.safeParse({
      q: searchParams.get('q') || '',
      type: searchParams.get('type') || 'all',
      sector: searchParams.get('sector') || undefined,
      region: searchParams.get('region') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    });

    if (!parsed.success) {
      const response = NextResponse.json(
        createValidationError(parsed.error.issues),
        { status: 400 }
      );
      return securityHeadersMiddleware(response);
    }

    const { q, type, sector, region, page = 1, limit = 20 } = parsed.data;
    const sanitizedQuery = sanitize.string(q, 100);
    
    if (!sanitizedQuery.trim()) {
      const response = NextResponse.json({
        success: false,
        message: 'Search query is required',
        data: { results: [], total: 0, page, totalPages: 0 }
      });
      return securityHeadersMiddleware(response);
    }

    const skip = (page - 1) * limit;
    const results: SearchResult[] = [];

    // Search jobs
    if (type === 'all' || type === 'job') {
      const jobsWhere: any = { published: true };
      if (sector) jobsWhere.sector = { contains: sector, mode: 'insensitive' };
      if (region) jobsWhere.region = { contains: region, mode: 'insensitive' };

      const jobs = await db.jobCompetition.findMany({
        where: jobsWhere,
        include: {
          seoMeta: true,
          heroImage: true
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit * 2 // Get more for better ranking
      });

      for (const job of jobs) {
        const score = calculateSearchScore(job, sanitizedQuery, 'job');
        if (score > 0) {
          results.push({
            id: job.id,
            title: job.title_ar,
            description: job.body_ar.substring(0, 200) + '...',
            type: 'job' as const,
            url: `/jobs/${job.slug_ar}`,
            score,
            highlights: {
              title: generateHighlights(job.title_ar, sanitizedQuery),
              content: generateHighlights(job.body_ar, sanitizedQuery)
            },
            sector: job.sector,
            region: job.region,
            createdAt: job.createdAt.toISOString(),
            featured: job.featured,
            closingDate: job.closing_date ? job.closing_date.toISOString() : undefined
          });
        }
      }
    }

    // Search guidance
    if (type === 'all' || type === 'guidance') {
      const guidanceWhere: any = { published: true };
      if (sector) guidanceWhere.sector = { contains: sector, mode: 'insensitive' };
      if (region) guidanceWhere.region = { contains: region, mode: 'insensitive' };

      const guidanceItems = await db.schoolGuidance.findMany({
        where: guidanceWhere,
        include: {
          seoMeta: true,
          heroImage: true
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit * 2
      });

      for (const guidance of guidanceItems) {
        const score = calculateSearchScore(guidance, sanitizedQuery, 'guidance');
        if (score > 0) {
          results.push({
            id: guidance.id,
            title: guidance.title_ar,
            description: guidance.body_ar.substring(0, 200) + '...',
            type: 'guidance' as const,
            url: `/guidance/${guidance.slug_ar}`,
            score,
            highlights: {
              title: generateHighlights(guidance.title_ar, sanitizedQuery),
              content: generateHighlights(guidance.body_ar, sanitizedQuery)
            },
            sector: guidance.sector,
            region: guidance.region,
            createdAt: guidance.createdAt.toISOString(),
            featured: guidance.featured
          });
        }
      }
    }

    // Search exams
    if (type === 'all' || type === 'exam') {
      const examsWhere: any = { published: true };
      if (sector) examsWhere.sector = { contains: sector, mode: 'insensitive' };
      if (region) examsWhere.region = { contains: region, mode: 'insensitive' };

      const exams = await db.examCalendar.findMany({
        where: examsWhere,
        include: {
          seoMeta: true,
          heroImage: true
        },
        orderBy: [
          { featured: 'desc' },
          { exam_date: 'asc' }
        ],
        take: limit * 2
      });

      for (const exam of exams) {
        const score = calculateSearchScore(exam, sanitizedQuery, 'exam');
        if (score > 0) {
          results.push({
            id: exam.id,
            title: exam.title_ar,
            description: exam.body_ar.substring(0, 200) + '...',
            type: 'exam' as const,
            url: `/exams/${exam.slug_ar}`,
            score,
            highlights: {
              title: generateHighlights(exam.title_ar, sanitizedQuery),
              content: generateHighlights(exam.body_ar, sanitizedQuery)
            },
            sector: exam.sector,
            region: exam.region,
            createdAt: exam.createdAt.toISOString(),
            featured: exam.featured,
            examDate: exam.exam_date.toISOString()
          });
        }
      }
    }

    // Sort by score (descending) and paginate
    results.sort((a, b) => b.score - a.score);
    const total = results.length;
    const paginatedResults = results.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);

    // Generate search suggestions
    const suggestions = new Set<string>();
    results.forEach(result => {
      if (result.sector && result.sector.toLowerCase().includes(sanitizedQuery.toLowerCase())) {
        suggestions.add(result.sector);
      }
      if (result.region && result.region.toLowerCase().includes(sanitizedQuery.toLowerCase())) {
        suggestions.add(result.region);
      }
    });

    const response = NextResponse.json({
      success: true,
      data: {
        results: paginatedResults,
        total,
        page,
        totalPages,
        query: sanitizedQuery,
        suggestions: Array.from(suggestions).slice(0, 5),
        searchTime: Date.now()
      }
    });

    return securityHeadersMiddleware(response);

  } catch (error) {
    console.error('Advanced search error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
    return securityHeadersMiddleware(response);
  }
}