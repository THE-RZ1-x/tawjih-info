import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, FileText, ExternalLink, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobDetailSkeleton } from "@/components/detail-skeletons";
import ApiError from "@/components/api-error";
import NotFound from "@/components/not-found";
import { ThemeToggle } from "@/components/theme-toggle";
import { SEO } from "@/components/seo";
import { StructuredData } from "@/components/structured-data";
import { Suspense } from "react";

// Fetch real data from API
async function getJobPost(slug_ar: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/jobs/${slug_ar}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Not found
      }
      return undefined; // Error
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching job post:', error);
    return undefined; // Error
  }
}

async function JobPostContent({ params }: { params: { slug_ar: string } }) {
  const job = await getJobPost(params.slug_ar);
  
  if (job === null) {
    return <NotFound title="المباراة غير موجودة" description="عذرًا، المباراة التي تبحث عنها غير موجودة أو قد تم حذفها." backUrl="/jobs" backText="العودة للمباريات" />;
  }

  if (job === undefined) {
    return (
      <ApiError 
        error="فشل تحميل بيانات المباراة"
        title="فشل تحميل المباراة"
        description="تعذر تحميل بيانات المباراة. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى."
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={job.title_ar}
        description={job.seoMeta?.description || job.body_ar.substring(0, 160)}
        keywords={[job.sector, job.region, 'مباراة', 'توظيف', 'مغرب']}
        image={job.heroImage?.url}
        url={`/jobs/${job.slug_ar}`}
        type="article"
        publishedTime={job.createdAt}
        modifiedTime={job.updatedAt}
        author="INFO TAWJIH 2.0"
        section="مباريات"
        structuredData={{
          type: 'JobPosting',
          data: {
            title: job.title_ar,
            description: job.body_ar,
            datePosted: job.createdAt,
            validThrough: job.closing_date,
            organization: job.sector,
            organizationUrl: 'https://infotawjih.ma',
            location: job.region,
            benefits: 'تأمين صحي، تقاعد، إجازات مدفوعة',
            qualifications: 'شهادة الباكالوريا أو ما يعادلها',
            education: 'مستوى التعليم الثانوي أو العالي',
            experience: 'حسب المنصب',
            industry: job.sector,
            category: 'مباريات التوظيف'
          }
        }}
      />
      
      <StructuredData 
        type="Article"
        data={{
          title: job.title_ar,
          description: job.seoMeta?.description || job.body_ar.substring(0, 160),
          datePublished: job.createdAt,
          dateModified: job.updatedAt,
          image: job.heroImage ? { url: job.heroImage.url } : null,
          url: `/jobs/${job.slug_ar}`,
          category: 'مباريات'
        }}
      />

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">INFO TAWJIH 2.0</h1>
              <p className="text-muted-foreground mt-2">منصة التوجيه والمباريات المغربية</p>
            </div>
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex gap-6">
                <Link href="/" className="text-foreground hover:text-primary transition-colors">
                  الرئيسية
                </Link>
                <Link href="/jobs" className="text-primary font-semibold">مباريات</Link>
                <Link href="/guidance" className="text-foreground hover:text-primary transition-colors">
                  توجيه مدرسي
                </Link>
                <Link href="/exams" className="text-foreground hover:text-primary transition-colors">
                  الامتحانات
                </Link>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              الرئيسية
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
              المباريات
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{job.title_ar}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Back Button */}
            <Button variant="outline" asChild className="mb-6">
              <Link href="/jobs">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للمباريات
              </Link>
            </Button>

            {/* Article Header */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="secondary">مباراة</Badge>
                  {job.featured && (
                    <Badge className="bg-accent">مميز</Badge>
                  )}
                </div>
                <CardTitle className="text-3xl mb-4">{job.title_ar}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-base">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    {new Date(job.createdAt).toLocaleDateString('ar-MA')}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.region}
                  </span>
                </CardDescription>
              </CardHeader>
              {job.heroImage?.url && (
                <CardContent>
                  <img
                    src={job.heroImage.url}
                    alt={job.heroImage.alt_text || job.title_ar}
                    className="w-full rounded-lg"
                  />
                </CardContent>
              )}
            </Card>

            {/* Article Content */}
            <Card>
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {job.body_ar}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  مشاركة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button variant="outline" size="sm">
                    فيسبوك
                  </Button>
                  <Button variant="outline" size="sm">
                    تويتر
                  </Button>
                  <Button variant="outline" size="sm">
                    واتساب
                  </Button>
                  <Button variant="outline" size="sm">
                    تيليجرام
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">القطاع</p>
                  <p className="font-medium">{job.sector}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الجهة</p>
                  <p className="font-medium">{job.region}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ النشر</p>
                  <p className="font-medium">{new Date(job.createdAt).toLocaleDateString('ar-MA')}</p>
                </div>
                {job.closing_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">آخر أجل للتقديم</p>
                    <p className="font-medium text-red-600">{new Date(job.closing_date).toLocaleDateString('ar-MA')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Download */}
            {job.pdf_url && (
              <Card>
                <CardHeader>
                  <CardTitle>تحميل الملف</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href={job.pdf_url} target="_blank">
                      <FileText className="w-4 h-4 ml-2" />
                      تحميل الإعلان الرسمي
                    </Link>
                  </Button>
                  <div className="mt-4">
                    <object data={job.pdf_url} type="application/pdf" className="w-full h-96 rounded border">
                      <a href={job.pdf_url} target="_blank" rel="noopener noreferrer">فتح الملف PDF</a>
                    </object>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Posts */}
            <Card>
              <CardHeader>
                <CardTitle>مباريات مشابهة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-2 border-primary pl-4">
                  <h4 className="font-medium mb-1">مباراة توظيف أطر إدارية في الوزارة الأولى</h4>
                  <p className="text-sm text-muted-foreground">الوزارة الأولى - الرباط</p>
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <h4 className="font-medium mb-1">مباراة توظيف أطباء في وزارة الصحة</h4>
                  <p className="text-sm text-muted-foreground">وزارة الصحة - جميع الجهات</p>
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <h4 className="font-medium mb-1">مباراة توظيف مهندسين في وزارة التجهيز</h4>
                  <p className="text-sm text-muted-foreground">وزارة التجهيز - الرباط</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold mb-4">INFO TAWJIH 2.0</h3>
          <p className="text-muted-foreground mb-4">
            منصتك الموثوقة لأخبار التوجيه والمباريات والامتحانات بالمغرب
          </p>
          <div className="flex justify-center gap-6">
            <Link href="/jobs" className="text-primary font-semibold">المباريات</Link>
            <Link href="/guidance" className="text-muted-foreground hover:text-primary transition-colors">
              التوجيه المدرسي
            </Link>
            <Link href="/exams" className="text-muted-foreground hover:text-primary transition-colors">
              الامتحانات
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default async function JobPostPage({ params }: { params: Promise<{ slug_ar: string }> }) {
  const { slug_ar } = await params;
  return (
    <Suspense fallback={<JobDetailSkeleton />}>
      <JobPostContent params={{ slug_ar }} />
    </Suspense>
  );
}