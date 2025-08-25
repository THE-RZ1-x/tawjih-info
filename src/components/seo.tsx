"use client";
import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  structuredData?: any;
}

export function SEO({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  structuredData
}: SEOProps) {
  const fullTitle = title.includes('INFO TAWJIH 2.0') 
    ? title 
    : `${title} - INFO TAWJIH 2.0`;

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://infotawjih.ma';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const defaultImage = image || `${siteUrl}/og-default.jpg`;

  const metaKeywords = [
    'توجيه',
    'مباريات',
    'توظيف',
    'امتحانات',
    'مغرب',
    'تعليم',
    'INFO TAWJIH',
    ...keywords
  ].join(', ');

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content={author || 'INFO TAWJIH 2.0'} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="INFO TAWJIH 2.0" />
      <meta property="og:locale" content="ar_MA" />
      
      {type === 'article' && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {author && (
            <meta property="article:author" content={author} />
          )}
          {section && (
            <meta property="article:section" content={section} />
          )}
          <meta property="article:publisher" content="INFO TAWJIH 2.0" />
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={defaultImage} />
      <meta name="twitter:site" content="@infotawjih" />
      <meta name="twitter:creator" content="@infotawjih" />

      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Structured Data */}
      {structuredData && (
        <script
          suppressHydrationWarning
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2)
          }}
        />
      )}
    </Head>
  );
}