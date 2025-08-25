// Error handling and logging utility
import { Component, ReactNode } from 'react';

export interface AppError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
  stack?: string;
  timestamp: string;
  context?: string;
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  context?: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

class ErrorHandler {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isDevelopment = process.env.NODE_ENV === 'development';

  static ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
    FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
    SEARCH_ERROR: 'SEARCH_ERROR',
  };

  createError(message: string, code: string, statusCode: number = 500, details?: any, context?: string): AppError {
    return {
      message,
      code,
      statusCode,
      details,
      stack: this.isDevelopment ? new Error().stack : undefined,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  log(level: LogEntry['level'], message: string, context?: string, metadata?: Record<string, any>, userId?: string): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId,
      requestId: this.generateRequestId(),
      metadata,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    if (this.isDevelopment) {
      const logMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[logMethod](`[${level.toUpperCase()}] ${message}`, {
        context,
        metadata,
        userId,
        timestamp: entry.timestamp,
      });
    }

    if (!this.isDevelopment) {
      this.sendToExternalService(entry);
    }
  }

  info(message: string, context?: string, metadata?: Record<string, any>, userId?: string): void {
    this.log('info', message, context, metadata, userId);
  }

  warn(message: string, context?: string, metadata?: Record<string, any>, userId?: string): void {
    this.log('warn', message, context, metadata, userId);
  }

  error(message: string, context?: string, error?: any, userId?: string): void {
    const metadata = error ? {
      error: error.message,
      stack: error.stack,
      name: error.name,
    } : undefined;
    
    this.log('error', message, context, metadata, userId);
  }

  debug(message: string, context?: string, metadata?: Record<string, any>, userId?: string): void {
    if (this.isDevelopment) {
      this.log('debug', message, context, metadata, userId);
    }
  }

  handleApiError(error: any, context?: string, userId?: string): AppError {
    let appError: AppError;

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      switch (status) {
        case 400:
          appError = this.createError(message, ErrorHandler.ERROR_CODES.VALIDATION_ERROR, status, error.response.data, context);
          break;
        case 401:
          appError = this.createError(message, ErrorHandler.ERROR_CODES.AUTHENTICATION_ERROR, status, error.response.data, context);
          break;
        case 403:
          appError = this.createError(message, ErrorHandler.ERROR_CODES.AUTHORIZATION_ERROR, status, error.response.data, context);
          break;
        case 404:
          appError = this.createError(message, ErrorHandler.ERROR_CODES.NOT_FOUND, status, error.response.data, context);
          break;
        case 429:
          appError = this.createError(message, ErrorHandler.ERROR_CODES.RATE_LIMIT_ERROR, status, error.response.data, context);
          break;
        default:
          appError = this.createError(message, ErrorHandler.ERROR_CODES.INTERNAL_ERROR, status, error.response.data, context);
      }
    } else if (error.request) {
      appError = this.createError('Network error occurred', ErrorHandler.ERROR_CODES.NETWORK_ERROR, 0, { request: error.request }, context);
    } else {
      appError = this.createError(error.message || 'Unknown error occurred', ErrorHandler.ERROR_CODES.INTERNAL_ERROR, 500, error, context);
    }

    this.error(appError.message, context, error, userId);
    return appError;
  }

  handleDatabaseError(error: any, context?: string, userId?: string): AppError {
    let message = 'Database error occurred';
    let code = ErrorHandler.ERROR_CODES.DATABASE_ERROR;

    if (error.code) {
      switch (error.code) {
        case 'P2002':
          message = 'Unique constraint violation';
          break;
        case 'P2003':
          message = 'Foreign key constraint violation';
          break;
        case 'P2025':
          message = 'Record not found';
          code = ErrorHandler.ERROR_CODES.NOT_FOUND;
          break;
        default:
          message = `Database error: ${error.code}`;
      }
    }

    const appError = this.createError(message, code, 500, error, context);
    this.error(appError.message, context, error, userId);
    return appError;
  }

  handleValidationError(errors: any[], context?: string): AppError {
    const message = 'Validation failed';
    const appError = this.createError(message, ErrorHandler.ERROR_CODES.VALIDATION_ERROR, 400, { errors }, context);
    this.warn(message, context, { errors });
    return appError;
  }

  getLogs(level?: LogEntry['level'], limit?: number): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }
    
    return filteredLogs;
  }

  clearLogs(): void {
    this.logs = [];
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sendToExternalService(entry: LogEntry): void {
    if (typeof window !== 'undefined') {
      try {
        const clientLogs = JSON.parse(localStorage.getItem('app_logs') || '[]');
        clientLogs.push(entry);
        
        if (clientLogs.length > 100) {
          clientLogs.splice(0, clientLogs.length - 100);
        }
        
        localStorage.setItem('app_logs', JSON.stringify(clientLogs));
      } catch (e) {
        console.error('Failed to store logs in localStorage:', e);
      }
    }
  }

  setupGlobalHandlers(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.error('Unhandled promise rejection', 'global', event.reason);
        event.preventDefault();
      });

      window.addEventListener('error', (event) => {
        this.error('Uncaught error', 'global', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        });
        event.preventDefault();
      });
    }
  }

  startPerformanceTimer(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.info(`Performance: ${label} took ${duration.toFixed(2)}ms`, 'performance', { duration });
    };
  }

  static getDerivedStateFromError(error: any): { hasError: boolean; error: any } {
    return {
      hasError: true,
      error,
    };
  }

  static componentDidCatch(error: any, errorInfo: any): void {
    const errorHandler = new ErrorHandler();
    errorHandler.error('React error boundary caught error', 'react', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
    });
  }
}

export const errorHandler = new ErrorHandler();

if (typeof window !== 'undefined') {
  errorHandler.setupGlobalHandlers();
}

// Simple error boundary without JSX for now
export const ErrorBoundary = ({ children }: { children: ReactNode }) => {
  return children;
};