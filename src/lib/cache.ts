// Simple in-memory cache with TTL support
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  set(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value as string | undefined;
      if (typeof oldestKey === 'string') {
      this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// API response cache with different TTLs for different endpoints
export const apiCache = {
  // Cache for job listings (5 minutes TTL)
  jobs: new Cache<any>(50),
  
  // Cache for guidance listings (5 minutes TTL)
  guidance: new Cache<any>(50),
  
  // Cache for exam listings (5 minutes TTL)
  exams: new Cache<any>(50),
  
  // Cache for individual items (30 minutes TTL)
  jobDetails: new Cache<any>(200),
  guidanceDetails: new Cache<any>(200),
  examDetails: new Cache<any>(200),
  
  // Cache for user data (2 minutes TTL)
  userData: new Cache<any>(10),
  
  // Cache for bookmarks (1 minute TTL)
  bookmarks: new Cache<any>(20),
  
  // Clean up all caches
  cleanupAll() {
    this.jobs.cleanup();
    this.guidance.cleanup();
    this.exams.cleanup();
    this.jobDetails.cleanup();
    this.guidanceDetails.cleanup();
    this.examDetails.cleanup();
    this.userData.cleanup();
    this.bookmarks.cleanup();
  },
};

// Cache key generator for API requests
export function generateCacheKey(
  endpoint: string,
  params: Record<string, any> = {}
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return `${endpoint}${sortedParams ? `?${sortedParams}` : ''}`;
}

// Fetch with caching wrapper
export async function fetchWithCache<T>(
  endpoint: string,
  options: RequestInit = {},
  cache: Cache<T> = apiCache.jobs,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  const cacheKey = generateCacheKey(endpoint, options);
  
  // Try to get from cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Fetch fresh data
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Cache the response
  cache.set(cacheKey, data, ttl);
  
  return data;
}

// Debounce utility for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Performance monitoring utility
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();

  measure(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
  }

  getAverage(name: string): number {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) {
      return 0;
    }
    
    const sum = measurements.reduce((acc, val) => acc + val, 0);
    return sum / measurements.length;
  }

  getMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    
    for (const [name, measurements] of this.metrics.entries()) {
      result[name] = {
        average: this.getAverage(name),
        count: measurements.length,
      };
    }
    
    return result;
  }

  clear(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();