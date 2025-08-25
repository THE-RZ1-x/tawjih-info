import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

// Rate limiting configuration
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  requests: new Map<string, { count: number; resetTime: number }>()
};

// Security headers
const securityHeaders = {
  'Content-Security-Policy': 
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: http: ws: wss:; frame-ancestors 'none';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Input validation utilities
export const validators = {
  email: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  password: (password: string) => {
    return password.length >= 6;
  },
  
  name: (name: string) => {
    return name.length >= 2 && name.length <= 50;
  },
  
  id: (id: string) => {
    return /^[a-zA-Z0-9-]+$/.test(id) && id.length > 0;
  },
  
  sanitizeInput: (input: string) => {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF]/g, ''); // Keep Arabic characters and basic alphanumeric
  }
};

// Rate limiting middleware
export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const forwardedFor = request.headers.get('x-forwarded-for') || '';
  const realIp = request.headers.get('x-real-ip');
  const clientIp = forwardedFor.split(',')[0]?.trim() || realIp || 'unknown';
  const now = Date.now();
  
  const userRequests = rateLimit.requests.get(clientIp);
  
  if (!userRequests) {
    rateLimit.requests.set(clientIp, { count: 1, resetTime: now + rateLimit.windowMs });
    return null;
  }
  
  if (now > userRequests.resetTime) {
    rateLimit.requests.set(clientIp, { count: 1, resetTime: now + rateLimit.windowMs });
    return null;
  }
  
  if (userRequests.count >= rateLimit.max) {
    return NextResponse.json(
      { success: false, message: 'Too many requests, please try again later' },
      { status: 429 }
    );
  }
  
  userRequests.count++;
  return null;
}

// Authentication middleware
export function authMiddleware(request: NextRequest): { userId: string; email: string; role: string } | null {
  const decodedToken = verifyToken(request);
  return decodedToken ? {
    userId: decodedToken.userId,
    email: decodedToken.email,
    role: decodedToken.role
  } : null;
}

// Admin authorization middleware
export function adminMiddleware(request: NextRequest): boolean {
  const auth = authMiddleware(request);
  return !!auth && auth.role === 'admin';
}

// Security headers middleware
export function securityHeadersMiddleware(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// CORS middleware
export function corsMiddleware(request: NextRequest, response: NextResponse): NextResponse {
  const devOrigin = request.headers.get('origin') ?? 'http://localhost:3001';
  const productionOrigin = process.env.ALLOWED_ORIGINS || process.env.NEXTAUTH_URL || 'https://yourdomain.com';
  response.headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? productionOrigin : devOrigin);
  response.headers.append('Vary', 'Origin');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

// Main middleware function
export function middleware(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return securityHeadersMiddleware(rateLimitResponse);
  }
  
  // Handle OPTIONS requests for CORS
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    return securityHeadersMiddleware(corsMiddleware(request, response));
  }
  
  // For API routes, apply additional security
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    return securityHeadersMiddleware(corsMiddleware(request, response));
  }
  
  return NextResponse.next();
}