"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, MapPin, FileText, ExternalLink, Search, Filter, Calendar } from "lucide-react";
import Link from "next/link";

interface ExamCalendar {
  id: string;
  title_ar: string;
  slug_ar: string;
  body_ar: string;
  exam_date: string;
  subject: string;
  school_level: string;
  sector: string;
  region: string;
  pdf_url?: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  seoMeta?: {
    id: string;
    title?: string;
    description?: string;
  };
  heroImage?: {
    id: string;
    url: string;
    alt_text: string;
  };
}

export default function ExamsPage() {
  const [exams, setExams] = useState<ExamCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; pages: number } | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exams?published=true', { cache: 'no-store' });
      const data = await response.json();
      
      if (data.success) {
        setExams(data.data);
        setPagination(data.pagination ?? null);
      } else {
        console.error('Failed to fetch exams:', data.message);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(exam => {
    const title = (exam.title_ar || '').toLowerCase();
    const body = (exam.body_ar || '').toLowerCase();
    const subject = (exam.subject || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = title.includes(q) || body.includes(q) || subject.includes(q);
    const matchesLevel = selectedLevel === "all" || exam.school_level === selectedLevel;
    const matchesSubject = selectedSubject === "all" || exam.subject === selectedSubject;
    const matchesRegion = selectedRegion === "all" || exam.region === selectedRegion;
    
    return matchesSearch && matchesLevel && matchesSubject && matchesRegion;
  });

  const levels = Array.from(new Set(exams.map(exam => exam.school_level).filter(Boolean)));
  const subjects = Array.from(new Set(exams.map(exam => exam.subject).filter(Boolean)));
  const regions = Array.from(new Set(exams.map(exam => exam.region).filter(Boolean)));

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('ar-MA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isUpcoming = (examDate?: string) => {
    if (!examDate) return false;
    const d = new Date(examDate);
    if (isNaN(d.getTime())) return false;
    return d > new Date();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">INFO TAWJIH 2.0</h1>
                <p className="text-sm text-muted-foreground">منصة التوجيه والمباريات المغربية</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-8">
              <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium">
                الرئيسية
              </Link>
              <Link href="/jobs" className="text-foreground hover:text-primary transition-colors font-medium">
                مباريات
              </Link>
              <Link href="/guidance" className="text-foreground hover:text-primary transition-colors font-medium">
                توجيه مدرسي
              </Link>
              <Link href="/exams" className="text-primary font-semibold">الامتحانات</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <section className="hero-pattern py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">جدول الامتحانات</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-shadow">
              <span className="gradient-text">تواريخ الامتحانات</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              جدول تواريخ الامتحانات الوطنية والجهوية والمحلية لجميع المستويات الدراسية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                <div className="text-3xl font-bold text-primary">{pagination?.total ?? exams.length}</div>
                <div className="text-sm text-muted-foreground">امتحان مسجل</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                <div className="text-3xl font-bold text-accent">
                  {exams.filter(exam => isUpcoming(exam.exam_date)).length}
                </div>
                <div className="text-sm text-muted-foreground">امتحان قادم</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="ابحث في الامتحانات..." 
                className="pr-12 h-12 text-base border-2 focus:border-primary/50 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[200px] h-12 border-2 focus:border-primary/50 transition-colors">
                  <SelectValue placeholder="المستوى الدراسي" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[200px] h-12 border-2 focus:border-primary/50 transition-colors">
                  <SelectValue placeholder="المادة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المواد</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-[200px] h-12 border-2 focus:border-primary/50 transition-colors">
                  <SelectValue placeholder="الجهة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الجهات</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-12 w-12 border-2 hover:border-primary/50 transition-colors">
                <Filter className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Exams List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">جاري تحميل الامتحانات...</div>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">لا توجد امتحانات متاحة</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredExams.map((exam) => (
                <Card key={exam.id} className="card-hover border-0 shadow-xl overflow-hidden group">
                  <div className={`h-2 bg-gradient-to-r ${isUpcoming(exam.exam_date) ? 'from-primary to-accent' : 'from-muted to-muted-foreground'}`}></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                        امتحان
                      </Badge>
                      <div className="flex gap-2">
                        {exam.featured && (
                          <Badge className="bg-accent text-white border-accent px-3 py-1">
                            مميز
                          </Badge>
                        )}
                        {isUpcoming(exam.exam_date) ? (
                          <Badge className="bg-green-500 text-white border-green-500 px-3 py-1">
                            قادم
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="px-3 py-1">
                            منتهي
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold line-clamp-2 text-primary group-hover:text-primary/80 transition-colors">
                      {exam.title_ar}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {formatDate(exam.exam_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {exam.region}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                          {exam.subject}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-accent/20 text-accent">
                          {exam.school_level}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-muted-foreground text-muted-foreground">
                          {exam.sector}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                        {exam.body_ar}
                      </p>
                      <div className="bg-muted/30 rounded-lg p-3 mb-4">
                        <div className="text-sm text-muted-foreground">
                          تاريخ الامتحان: 
                          <span className={`font-semibold ml-1 ${isUpcoming(exam.exam_date) ? 'text-primary' : 'text-muted-foreground'}`}>
                            {formatDate(exam.exam_date)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 hover:bg-primary hover:text-white transition-all duration-300 h-10" asChild>
                          <Link href={`/exams/${exam.slug_ar}`}>
                            <FileText className="w-4 h-4 ml-2" />
                            التفاصيل
                          </Link>
                        </Button>
                        {exam.pdf_url && (
                          <Button className="bg-accent hover:bg-accent/90 text-white h-10 px-4" asChild>
                            <Link href={exam.pdf_url} target="_blank">
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}