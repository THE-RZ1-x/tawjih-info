import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, FileText, ExternalLink, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExamDetailSkeleton } from "@/components/detail-skeletons";
import ApiError from "@/components/api-error";
import NotFound from "@/components/not-found";
import { ThemeToggle } from "@/components/theme-toggle";
import { SEO } from "@/components/seo";
import { StructuredData } from "@/components/structured-data";
import { Suspense } from "react";

// Fetch real data from API
async function getExamPost(slug_ar: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/exams/${slug_ar}`, {
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
    console.error('Error fetching exam post:', error);
    return undefined; // Error
  }
}

async function ExamPostContent({ params }: { params: { slug_ar: string } }) {
  const exam = await getExamPost(params.slug_ar);
  
  if (exam === null) {
    return <NotFound title="الامتحان غير موجود" description="عذرًا، الامتحان الذي تبحث عنه غير موجود أو قد تم حذفه." backUrl="/exams" backText="العودة للامتحانات" />;
  }

  if (exam === undefined) {
    return (
      <ApiError 
        error="فشل تحميل بيانات الامتحان"
        title="فشل تحميل الامتحان"
        description="تعذر تحميل بيانات الامتحان. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى."
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={exam.title_ar}
        description={exam.seoMeta?.description || exam.body_ar.substring(0, 160)}
        keywords={[exam.sector, exam.region, exam.subject, exam.school_level, 'امتحانات', 'مغرب']}
        image={exam.heroImage?.url}
        url={`/exams/${exam.slug_ar}`}
        type="article"
        publishedTime={exam.createdAt}
        modifiedTime={exam.updatedAt}
        author="INFO TAWJIH 2.0"
        section="امتحانات"
        structuredData={{
          type: 'Event',
          data: {
            name: exam.title_ar,
            description: exam.seoMeta?.description || exam.body_ar.substring(0, 160),
            startDate: exam.exam_date,
            endDate: exam.exam_date,
            locationName: exam.region,
            location: exam.region,
            organizer: 'وزارة التربية الوطنية',
            organizerUrl: 'https://education.gov.ma',
            validFrom: exam.createdAt
          }
        }}
      />
      
      <StructuredData 
        type="Article"
        data={{
          title: exam.title_ar,
          description: exam.seoMeta?.description || exam.body_ar.substring(0, 160),
          datePublished: exam.createdAt,
          dateModified: exam.updatedAt,
          image: exam.heroImage ? { url: exam.heroImage.url } : null,
          url: `/exams/${exam.slug_ar}`,
          category: 'امتحانات'
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
                <Link href="/jobs" className="text-foreground hover:text-primary transition-colors">
                  مباريات
                </Link>
                <Link href="/guidance" className="text-foreground hover:text-primary transition-colors">
                  توجيه مدرسي
                </Link>
                <Link href="/exams" className="text-primary font-semibold">الامتحانات</Link>
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
            <Link href="/exams" className="text-muted-foreground hover:text-foreground">
              الامتحانات
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{exam.title_ar}</span>
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
              <Link href="/exams">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للامتحانات
              </Link>
            </Button>

            {/* Article Header */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="secondary">امتحان</Badge>
                  {exam.featured && (
                    <Badge className="bg-accent">مميز</Badge>
                  )}
                </div>
                <CardTitle className="text-3xl mb-4">{exam.title_ar}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-base">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    {new Date(exam.createdAt).toLocaleDateString('ar-MA')}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {exam.region}
                  </span>
                </CardDescription>
              </CardHeader>
              {exam.heroImage?.url && (
                <CardContent>
                  <img
                    src={exam.heroImage.url}
                    alt={exam.heroImage.alt_text || exam.title_ar}
                    className="w-full rounded-lg"
                  />
                </CardContent>
              )}
            </Card>

            {/* Article Content */}
            <Card>
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: exam.body_ar.replace(/\n/g, '<br>').replace(/## (.*$)/g, '<h2>$1</h2>').replace(/### (.*$)/g, '<h3>$1</h3>') 
                    }} 
                  />
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
                  <p className="font-medium">{exam.sector}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الجهة</p>
                  <p className="font-medium">{exam.region}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ النشر</p>
                  <p className="font-medium">{new Date(exam.createdAt).toLocaleDateString('ar-MA')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الامتحان</p>
                  <p className="font-medium text-red-600">{new Date(exam.exam_date).toLocaleDateString('ar-MA')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المادة</p>
                  <p className="font-medium">{exam.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المستوى الدراسي</p>
                  <p className="font-medium">{exam.school_level}</p>
                </div>
              </CardContent>
            </Card>

            {/* Download */}
            {exam.pdf_url && (
              <Card>
                <CardHeader>
                  <CardTitle>تحميل الجدول</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href={exam.pdf_url} target="_blank">
                      <FileText className="w-4 h-4 ml-2" />
                      تحميل الجدول الرسمي
                    </Link>
                  </Button>
                  <div className="mt-4">
                    <object data={exam.pdf_url} type="application/pdf" className="w-full h-96 rounded border">
                      <a href={exam.pdf_url} target="_blank" rel="noopener noreferrer">فتح الملف PDF</a>
                    </object>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Posts */}
            <Card>
              <CardHeader>
                <CardTitle>امتحانات مشابهة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-2 border-primary pl-4">
                  <h4 className="font-medium mb-1">امتحانات نيل شهادة التقني العالي</h4>
                  <p className="text-sm text-muted-foreground">جميع الجهات</p>
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <h4 className="font-medium mb-1">امتحانات السنة الثالثة إعدادي</h4>
                  <p className="text-sm text-muted-foreground">جميع الجهات</p>
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <h4 className="font-medium mb-1">امتحانات السادسة ابتدائي</h4>
                  <p className="text-sm text-muted-foreground">جميع الجهات</p>
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
            <Link href="/jobs" className="text-muted-foreground hover:text-primary transition-colors">
              المباريات
            </Link>
            <Link href="/guidance" className="text-muted-foreground hover:text-primary transition-colors">
              التوجيه المدرسي
            </Link>
            <Link href="/exams" className="text-primary font-semibold">الامتحانات</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default async function ExamPostPage({ params }: { params: Promise<{ slug_ar: string }> }) {
  const { slug_ar } = await params;
  return (
    <Suspense fallback={<ExamDetailSkeleton />}>
      <ExamPostContent params={{ slug_ar }} />
    </Suspense>
  );
}