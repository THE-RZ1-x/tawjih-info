export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminMiddleware, securityHeadersMiddleware } from '@/lib/middleware';
import { promises as fs } from 'fs';
import path from 'path';

// File type validation
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILENAME_LENGTH = 255;

function sanitizeFilename(name: string): string {
  // Remove path traversal attempts and dangerous characters
  return name
    .replace(/[^a-zA-Z0-9._-\u0600-\u06FF]/g, '_')
    .replace(/\.\.+/g, '_')
    .replace(/^\.|\.$/, '')
    .substring(0, MAX_FILENAME_LENGTH);
}

function validateFileType(file: File): boolean {
  const allowedTypes = Object.keys(ALLOWED_FILE_TYPES);
  if (!allowedTypes.includes(file.type)) {
    return false;
  }
  
  const allowedExtensions = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];
  const fileExtension = path.extname(file.name).toLowerCase();
  
  return allowedExtensions.includes(fileExtension);
}

export async function POST(request: NextRequest) {
  try {
    if (!adminMiddleware(request)) {
      const res = NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      return securityHeadersMiddleware(res);
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      const res = NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
      return securityHeadersMiddleware(res);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const res = NextResponse.json({ 
        success: false, 
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 413 });
      return securityHeadersMiddleware(res);
    }

    // Validate file type
    if (!validateFileType(file)) {
      const res = NextResponse.json({ 
        success: false, 
        message: 'Invalid file type. Allowed types: images (jpg, png, webp), PDF, text, and document files' 
      }, { status: 400 });
      return securityHeadersMiddleware(res);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Additional security: Verify buffer size matches file.size
    if (buffer.length !== file.size) {
      const res = NextResponse.json({ 
        success: false, 
        message: 'File validation failed' 
      }, { status: 400 });
      return securityHeadersMiddleware(res);
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const originalName = file.name || 'upload';
    const safeName = sanitizeFilename(originalName);
    
    // Ensure filename is not empty after sanitization
    if (!safeName || safeName.length === 0) {
      const res = NextResponse.json({ 
        success: false, 
        message: 'Invalid filename' 
      }, { status: 400 });
      return securityHeadersMiddleware(res);
    }
    const uniqueName = `${Date.now()}-${safeName}`;
    const filePath = path.join(uploadsDir, uniqueName);

    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${uniqueName}`;

    const res = NextResponse.json({
      success: true,
      data: {
        url,
        name: uniqueName,
        size: buffer.length,
        type: file.type,
      }
    });
    return securityHeadersMiddleware(res);
  } catch (error) {
    console.error('File upload error:', error);
    
    // Security: Don't expose internal error details
    const res = NextResponse.json({ 
      success: false, 
      message: 'File upload failed. Please try again.' 
    }, { status: 500 });
    return securityHeadersMiddleware(res);
  }
} 