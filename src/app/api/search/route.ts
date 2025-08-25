import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface SearchResult {
  id: string;
  title_ar: string;
  slug_ar: string;
  body_ar: string;
  type: 'job' | 'guidance' | 'exam';
  url: string;
  createdAt: string;
  sector?: string;
  region?: string;
  subject?: string;
  school_level?: string;
  exam_date?: string;
  closing_date?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // 'job', 'guidance', 'exam', or 'all'

    if (!query.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Search query is required',
        data: []
      });
    }

    const skip = (page - 1) * limit;
    const searchQuery = query.toLowerCase();

    // Search in jobs
    let jobResults: any[] = [];
    if (!type || type === 'all' || type === 'job') {
      jobResults = await db.jobCompetition.findMany({
        where: {
          published: true,
          OR: [
            { title_ar: { contains: searchQuery } },
            { body_ar: { contains: searchQuery } },
            { sector: { contains: searchQuery } },
            { region: { contains: searchQuery } }
          ]
        },
        select: {
          id: true,
          title_ar: true,
          slug_ar: true,
          body_ar: true,
          sector: true,
          region: true,
          closing_date: true,
          createdAt: true,
          published: true
        },
        take: limit,
        skip: skip
      });
    }

    // Search in guidance
    let guidanceResults: any[] = [];
    if (!type || type === 'all' || type === 'guidance') {
      guidanceResults = await db.schoolGuidance.findMany({
        where: {
          published: true,
          OR: [
            { title_ar: { contains: searchQuery } },
            { body_ar: { contains: searchQuery } },
            { sector: { contains: searchQuery } },
            { region: { contains: searchQuery } }
          ]
        },
        select: {
          id: true,
          title_ar: true,
          slug_ar: true,
          body_ar: true,
          sector: true,
          region: true,
          createdAt: true,
          published: true
        },
        take: limit,
        skip: skip
      });
    }

    // Search in exams
    let examResults: any[] = [];
    if (!type || type === 'all' || type === 'exam') {
      examResults = await db.examCalendar.findMany({
        where: {
          published: true,
          OR: [
            { title_ar: { contains: searchQuery } },
            { body_ar: { contains: searchQuery } },
            { subject: { contains: searchQuery } },
            { school_level: { contains: searchQuery } },
            { sector: { contains: searchQuery } },
            { region: { contains: searchQuery } }
          ]
        },
        select: {
          id: true,
          title_ar: true,
          slug_ar: true,
          body_ar: true,
          subject: true,
          school_level: true,
          sector: true,
          region: true,
          exam_date: true,
          createdAt: true,
          published: true
        },
        take: limit,
        skip: skip
      });
    }

    // Transform results to unified format
    const results: SearchResult[] = [
      ...jobResults.map(job => ({
        ...job,
        type: 'job' as const,
        url: `/jobs/${job.slug_ar}`
      })),
      ...guidanceResults.map(guidance => ({
        ...guidance,
        type: 'guidance' as const,
        url: `/guidance/${guidance.slug_ar}`
      })),
      ...examResults.map(exam => ({
        ...exam,
        type: 'exam' as const,
        url: `/exams/${exam.slug_ar}`
      }))
    ];

    // Sort by relevance (title matches first, then content matches) and date
    const sortedResults = results.sort((a, b) => {
      const aTitleMatch = a.title_ar.toLowerCase().includes(searchQuery);
      const bTitleMatch = b.title_ar.toLowerCase().includes(searchQuery);
      
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Calculate counts by type
    const counts = {
      total: sortedResults.length,
      jobs: jobResults.length,
      guidance: guidanceResults.length,
      exams: examResults.length
    };

    return NextResponse.json({
      success: true,
      data: sortedResults,
      counts,
      pagination: {
        page,
        limit,
        total: sortedResults.length,
        query
      }
    });

  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to perform search' },
      { status: 500 }
    );
  }
}