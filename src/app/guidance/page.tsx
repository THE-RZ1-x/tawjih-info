"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, MapPin, FileText, ExternalLink, Search, Filter, BookOpen } from "lucide-react";
import Link from "next/link";

interface SchoolGuidance {
  id: string;
  title_ar: string;
  slug_ar: string;
  body_ar: string;
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

export default function GuidancePage() {
  const [guidance, setGuidance] = useState<SchoolGuidance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");

  useEffect(() => {
    fetchGuidance();
  }, []);

  const fetchGuidance = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/guidance?published=true');
      const data = await response.json();
      
      if (data.success) {
        setGuidance(data.data);
      } else {
        console.error('Failed to fetch guidance:', data.message);
      }
    } catch (error) {
      console.error('Error fetching guidance:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuidance = guidance.filter(item => {
    const matchesSearch = item.title_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.body_ar.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === "all" || item.sector === selectedSector;
    const matchesRegion = selectedRegion === "all" || item.region === selectedRegion;
    
    return matchesSearch && matchesSector && matchesRegion;
  });

  const sectors = Array.from(new Set(guidance.map(item => item.sector)));
  const regions = Array.from(new Set(guidance.map(item => item.region)));

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-MA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
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
              <Link href="/guidance" className="text-primary font-semibold">توجيه مدرسي</Link>
              <Link href="/exams" className="text-foreground hover:text-primary transition-colors font-medium">
                الامتحانات
              </Link>
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
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">توجيه مدرسي وجامعي</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-shadow">
              <span className="gradient-text">التوجيه المدرسي والجامعي</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              دلائل وإرشادات التوجيه المدرسي والجامعي والمهني بالمغرب
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                <div className="text-3xl font-bold text-primary">{guidance.length}</div>
                <div className="text-sm text-muted-foreground">دليل توجيه</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                <div className="text-3xl font-bold text-accent">500+</div>
                <div className="text-sm text-muted-foreground">مستفيد سنوياً</div>
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
                placeholder="ابحث في دلائل التوجيه..." 
                className="pr-12 h-12 text-base border-2 focus:border-primary/50 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-[200px] h-12 border-2 focus:border-primary/50 transition-colors">
                  <SelectValue placeholder="القطاع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع القطاعات</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
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

      {/* Guidance List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">جاري تحميل دلائل التوجيه...</div>
            </div>
          ) : filteredGuidance.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">لا توجد دلائل توجيه متاحة</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredGuidance.map((item) => (
                <Card key={item.id} className="card-hover border-0 shadow-xl overflow-hidden group">
                  <div className="h-2 bg-gradient-to-r from-accent to-primary"></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 px-3 py-1">
                        توجيه
                      </Badge>
                      {item.featured && (
                        <Badge className="bg-primary text-white border-primary px-3 py-1">
                          مميز
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold line-clamp-2 text-primary group-hover:text-primary/80 transition-colors">
                      {item.title_ar}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {formatDate(item.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {item.region}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs border-accent/20 text-accent">
                          {item.sector}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                        {item.body_ar}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 hover:bg-primary hover:text-white transition-all duration-300 h-10" asChild>
                          <Link href={`/guidance/${item.slug_ar}`}>
                            <FileText className="w-4 h-4 ml-2" />
                            التفاصيل
                          </Link>
                        </Button>
                        {item.pdf_url && (
                          <Button className="bg-accent hover:bg-accent/90 text-white h-10 px-4" asChild>
                            <Link href={item.pdf_url} target="_blank">
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