import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export type RequestValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; response: NextResponse };

// Common validation schemas
export const schemas = {
  // User validation
  user: {
    register: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must be at most 100 characters'),
    }),
    
    login: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    }),
    
    update: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters').optional(),
      email: z.string().email('Invalid email address').optional(),
      preferences: z.object({
        theme: z.enum(['light', 'dark']).optional(),
        notifications: z.boolean().optional(),
        emailUpdates: z.boolean().optional(),
        savedJobs: z.array(z.string()).optional(),
        favoriteRegions: z.array(z.string()).optional(),
        favoriteSectors: z.array(z.string()).optional(),
      }).optional(),
    }),
  },
  
  // Job competition validation
  job: {
    create: z.object({
      title_ar: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be at most 200 characters'),
      slug_ar: z.string().min(5, 'Slug must be at least 5 characters').max(100, 'Slug must be at most 100 characters'),
      body_ar: z.string().min(10, 'Content must be at least 10 characters'),
      sector: z.string().min(2, 'Sector must be at least 2 characters'),
      region: z.string().min(2, 'Region must be at least 2 characters'),
      closing_date: z.string().datetime().optional(),
      pdf_url: z.string().url('Invalid PDF URL').optional().or(z.literal('')),
      featured: z.boolean().default(false),
      published: z.boolean().default(false),
      seoMeta: z.object({
        title: z.string().max(60, 'SEO title must be at most 60 characters').optional(),
        description: z.string().max(160, 'SEO description must be at most 160 characters').optional(),
      }).optional(),
      heroImage: z.object({
        url: z.string().url('Invalid image URL'),
        alt_text: z.string().min(1, 'Alt text is required').max(100, 'Alt text must be at most 100 characters'),
      }).optional(),
    }),
    
    update: z.object({
      title_ar: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be at most 200 characters').optional(),
      slug_ar: z.string().min(5, 'Slug must be at least 5 characters').max(100, 'Slug must be at most 100 characters').optional(),
      body_ar: z.string().min(10, 'Content must be at least 10 characters').optional(),
      sector: z.string().min(2, 'Sector must be at least 2 characters').optional(),
      region: z.string().min(2, 'Region must be at least 2 characters').optional(),
      closing_date: z.string().datetime().optional(),
      pdf_url: z.string().url('Invalid PDF URL').optional().or(z.literal('')),
      featured: z.boolean().optional(),
      published: z.boolean().optional(),
      seoMeta: z.object({
        title: z.string().max(60, 'SEO title must be at most 60 characters').optional(),
        description: z.string().max(160, 'SEO description must be at most 160 characters').optional(),
      }).optional(),
      heroImage: z.object({
        url: z.string().url('Invalid image URL'),
        alt_text: z.string().min(1, 'Alt text is required').max(100, 'Alt text must be at most 100 characters'),
      }).optional(),
    }),
  },
  
  // School guidance validation
  guidance: {
    create: z.object({
      title_ar: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be at most 200 characters'),
      slug_ar: z.string().min(5, 'Slug must be at least 5 characters').max(100, 'Slug must be at most 100 characters'),
      body_ar: z.string().min(10, 'Content must be at least 10 characters'),
      sector: z.string().min(2, 'Sector must be at least 2 characters'),
      region: z.string().min(2, 'Region must be at least 2 characters'),
      pdf_url: z.string().url('Invalid PDF URL').optional().or(z.literal('')),
      featured: z.boolean().default(false),
      published: z.boolean().default(false),
      seoMeta: z.object({
        title: z.string().max(60, 'SEO title must be at most 60 characters').optional(),
        description: z.string().max(160, 'SEO description must be at most 160 characters').optional(),
      }).optional(),
      heroImage: z.object({
        url: z.string().url('Invalid image URL'),
        alt_text: z.string().min(1, 'Alt text is required').max(100, 'Alt text must be at most 100 characters'),
      }).optional(),
    }),
  },
  
  // Exam calendar validation
  exam: {
    create: z.object({
      title_ar: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be at most 200 characters'),
      slug_ar: z.string().min(5, 'Slug must be at least 5 characters').max(100, 'Slug must be at most 100 characters'),
      body_ar: z.string().min(10, 'Content must be at least 10 characters'),
      exam_date: z.string().datetime('Invalid exam date'),
      subject: z.string().min(2, 'Subject must be at least 2 characters'),
      school_level: z.string().min(2, 'School level must be at least 2 characters'),
      sector: z.string().min(2, 'Sector must be at least 2 characters'),
      region: z.string().min(2, 'Region must be at least 2 characters'),
      pdf_url: z.string().url('Invalid PDF URL').optional().or(z.literal('')),
      featured: z.boolean().default(false),
      published: z.boolean().default(false),
      seoMeta: z.object({
        title: z.string().max(60, 'SEO title must be at most 60 characters').optional(),
        description: z.string().max(160, 'SEO description must be at most 160 characters').optional(),
      }).optional(),
      heroImage: z.object({
        url: z.string().url('Invalid image URL'),
        alt_text: z.string().min(1, 'Alt text is required').max(100, 'Alt text must be at most 100 characters'),
      }).optional(),
    }),
  },
  
  // Bookmark validation
  bookmark: {
    create: z.object({
      targetType: z.enum(['job', 'guidance', 'exam'], 'Invalid target type'),
      targetId: z.string().min(1, 'Target ID is required'),
    }),
  },
  
  // Search validation
  search: {
    query: z.object({
      q: z.string().min(1, 'Search query is required').max(100, 'Search query must be at most 100 characters'),
      type: z.enum(['all', 'job', 'guidance', 'exam']).optional(),
      sector: z.string().optional(),
      region: z.string().optional(),
      page: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0, 'Page must be greater than 0').optional(),
      limit: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100').optional(),
    }),
  },
};

// Validation helper function
export function validateSchema<T>(schema: z.ZodSchema<T>, data: any): { success: true; data: T } | { success: false; errors: z.ZodIssue[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error.issues };
  }
}

// Sanitization helper functions
export const sanitize = {
  string: (input: string, maxLength?: number): string => {
    let sanitized = input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF\.\,\!\?\:\;\-\']/g, ''); // Keep Arabic characters and basic punctuation
    
    if (maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    
    return sanitized;
  },
  
  email: (email: string): string => {
    return email.trim().toLowerCase();
  },
  
  url: (url: string): string => {
    try {
      // If URL doesn't start with http/https, add https://
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      return new URL(url).toString();
    } catch {
      return url; // Return original if invalid
    }
  },
  
  html: (html: string): string => {
    // Basic HTML sanitization - remove dangerous tags and attributes
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/javascript:/gi, '');
  },
};

// Error handling helper
export function createValidationError(errors: z.ZodIssue[]) {
  return {
    success: false,
    message: 'Validation failed',
    errors: errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
    })),
  };
}

// Input validation middleware for API routes
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<RequestValidationResult<T>> => {
    try {
      const body = await request.json();
      const validation = validateSchema(schema, body);
      
      if (!validation.success) {
        return {
          valid: false,
          response: NextResponse.json(
            createValidationError(validation.errors),
            { status: 400 }
          ),
        };
      }
      
      return { valid: true, data: validation.data };
    } catch (error) {
      return {
        valid: false,
        response: NextResponse.json(
          { success: false, message: 'Invalid JSON format' },
          { status: 400 }
        ),
      };
    }
  };
}