"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, MapPin, FileText, ExternalLink, Search, Filter, TrendingUp, Users, Award, X, Star, Clock, Eye, Bookmark, Share2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { debounce } from "@/lib/cache";
import VirtualScroll from "@/components/virtual-scroll";

interface JobCompetition {
  id: string;
  title_ar: string;
  slug_ar: string;
  body_ar: string;
  sector: string;
  region: string;
  closing_date?: string;
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

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "deadline" | "title" | "popular">("newest");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchSavedJobs();
    }
  }, [user]);

  const fetchSavedJobs = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/users/saved-jobs', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const savedJobIds = data.data.map((savedJob: any) => savedJob.jobId);
          setSavedJobs(new Set(savedJobIds));
        }
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      // Always fetch fresh data to avoid stale cache delaying newly published content
      const response = await fetch('/api/jobs?published=true', { cache: 'no-store' });
      const data = await response.json();
      if (data.success) {
        setJobs(data.data);
      } else {
        console.error('Failed to fetch jobs:', data.message);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSector, selectedRegion, showFeaturedOnly]);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // Memoize expensive computations
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.body_ar.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = selectedSector === "all" || job.sector === selectedSector;
      const matchesRegion = selectedRegion === "all" || job.region === selectedRegion;
      const matchesFeatured = !showFeaturedOnly || job.featured;
      
      return matchesSearch && matchesSector && matchesRegion && matchesFeatured;
    });
  }, [jobs, searchTerm, selectedSector, selectedRegion, showFeaturedOnly]);

  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "deadline":
          if (!a.closing_date && !b.closing_date) return 0;
          if (!a.closing_date) return 1;
          if (!b.closing_date) return -1;
          return new Date(a.closing_date).getTime() - new Date(b.closing_date).getTime();
        case "title":
          return a.title_ar.localeCompare(b.title_ar, 'ar');
        default:
          return 0;
      }
    });
  }, [filteredJobs, sortBy]);

  const sectors = useMemo(() => Array.from(new Set(jobs.map(job => job.sector))), [jobs]);
  const regions = useMemo(() => Array.from(new Set(jobs.map(job => job.region))), [jobs]);

  const toggleSaveJob = async (jobId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      alert('الرجاء تسجيل الدخول لحفظ المباريات');
      return;
    }

    try {
      const response = await fetch('/api/users/saved-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ jobId }),
      });

      const data = await response.json();

      if (data.success) {
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.add(jobId);
          return newSet;
        });
      } else {
        // If already saved, remove it
        if (data.message === 'Job already saved') {
          await fetch(`/api/users/saved-jobs/${jobId}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          setSavedJobs(prev => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
        } else {
          console.error('Failed to save job:', data.message);
        }
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const isDeadlineNear = (closingDate?: string) => {
    if (!closingDate) return false;
    const now = new Date();
    const deadline = new Date(closingDate);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const getDeadlineStatus = (closingDate?: string) => {
    if (!closingDate) return null;
    const now = new Date();
    const deadline = new Date(closingDate);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'expired', text: 'انتهت', color: 'text-red-600' };
    if (diffDays === 0) return { status: 'today', text: 'اليوم', color: 'text-orange-600' };
    if (diffDays <= 3) return { status: 'urgent', text: `${diffDays} أيام`, color: 'text-red-600' };
    if (diffDays <= 7) return { status: 'near', text: `${diffDays} أيام`, color: 'text-orange-600' };
    return { status: 'normal', text: `${diffDays} أيام`, color: 'text-green-600' };
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Enhanced Header */}
      <header className="border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Award className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  INFO TAWJIH 2.0
                </h1>
                <p className="text-sm text-muted-foreground">منصة التوجيه والمباريات المغربية</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-8">
              <Link href="/" className="text-foreground hover:text-blue-600 transition-colors font-medium relative group">
                الرئيسية
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/jobs" className="text-blue-600 font-semibold relative">
                مباريات
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600"></span>
              </Link>
              <Link href="/guidance" className="text-foreground hover:text-blue-600 transition-colors font-medium relative group">
                توجيه مدرسي
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/exams" className="text-foreground hover:text-blue-600 transition-colors font-medium relative group">
                الامتحانات
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Enhanced Page Header */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-6 py-3 rounded-full mb-8 shadow-lg border border-blue-200 dark:border-blue-800"
            >
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">فرص عمل وتوظيف</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                المباريات والتوظيف
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto"
            >
              آخر إعلانات المباريات والوظائف العمومية والخاصة بالمغرب
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 flex items-center gap-4 shadow-lg border border-blue-200 dark:border-blue-800">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {jobs.length}
                </div>
                <div className="text-sm text-muted-foreground">مباراة نشطة</div>
              </div>
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 flex items-center gap-4 shadow-lg border border-purple-200 dark:border-purple-800">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  50K+
                </div>
                <div className="text-sm text-muted-foreground">متقدم شهرياً</div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Animated decorative elements */}
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-20 right-10 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>
      </section>

      {/* Enhanced Filters Section */}
      <section className="py-8 border-b bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            {/* Main Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  placeholder="ابحث في العناوين، الوصف، القطاعات، أو الجهات..." 
                  className="pr-12 h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 transition-colors text-right"
                  defaultValue={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <Button 
                variant="outline" 
                className="h-12 px-6 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 ml-2" />
                الفلاتر المتقدمة
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger className="h-10 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500">
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
                  <SelectTrigger className="h-10 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500">
                    <SelectValue placeholder="الجهة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الجهات</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="h-10 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500">
                    <SelectValue placeholder="ترتيب حسب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">الأحدث أولاً</SelectItem>
                    <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                    <SelectItem value="deadline">تاريخ الإغلاق</SelectItem>
                    <SelectItem value="title">العنوان</SelectItem>
                    <SelectItem value="popular">الأكثر شعبية</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured-only"
                    checked={showFeaturedOnly}
                    onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-2 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="featured-only" className="text-sm font-medium cursor-pointer">
                    المميزة فقط
                  </label>
                </div>
              </motion.div>
            )}

            {/* Active Filters Display */}
            {(selectedSector !== "all" || selectedRegion !== "all" || showFeaturedOnly || searchTerm) && (
              <div className="flex flex-wrap gap-2">
                {selectedSector !== "all" && (
                  <Badge variant="secondary" className="gap-2">
                    القطاع: {selectedSector}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setSelectedSector("all")}
                    />
                  </Badge>
                )}
                {selectedRegion !== "all" && (
                  <Badge variant="secondary" className="gap-2">
                    الجهة: {selectedRegion}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setSelectedRegion("all")}
                    />
                  </Badge>
                )}
                {showFeaturedOnly && (
                  <Badge variant="secondary" className="gap-2">
                    مميز فقط
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setShowFeaturedOnly(false)}
                    />
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="gap-2">
                    بحث: {searchTerm}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setSearchTerm("")}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                تم العثور على {sortedJobs.length} مباراة
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-9"
                >
                  شبكة
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-9"
                >
                  قائمة
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Jobs List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardHeader>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-20" />
                      <Skeleton className="h-10 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground mb-4">لا توجد مباريات تطابق معايير البحث</div>
              <Button onClick={() => {
                setSearchTerm("");
                setSelectedSector("all");
                setSelectedRegion("all");
                setShowFeaturedOnly(false);
              }}>
                إعادة تعيين الفلاتر
              </Button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8" : "space-y-6"}>
              {sortedJobs.map((job, index) => {
                const deadlineStatus = getDeadlineStatus(job.closing_date);
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className={`card-hover border-0 shadow-xl overflow-hidden group ${viewMode === "list" ? "flex flex-row" : ""}`}>
                      <div className={`absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      
                      {/* Status Bar */}
                      <div className={`h-1 ${deadlineStatus?.status === 'expired' ? 'bg-red-500' : 
                                     deadlineStatus?.status === 'urgent' ? 'bg-orange-500' : 
                                     deadlineStatus?.status === 'near' ? 'bg-yellow-500' : 
                                     'bg-gradient-to-r from-blue-600 to-purple-600'}`}></div>
                      
                      <CardHeader className={`pb-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="bg-blue-600/10 text-blue-600 border-blue-600/20">
                              مباراة
                            </Badge>
                            {job.featured && (
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none">
                                <Star className="w-3 h-3 ml-1" />
                                مميز
                              </Badge>
                            )}
                            {isDeadlineNear(job.closing_date) && (
                              <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                                <Clock className="w-3 h-3 ml-1" />
                                عاجل
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => toggleSaveJob(job.id)}
                            >
                              <Bookmark 
                                className={`w-4 h-4 ${savedJobs.has(job.id) ? 'fill-current text-primary' : ''}`} 
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-xl font-bold line-clamp-2 text-primary group-hover:text-primary/80 transition-colors">
                          {job.title_ar}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            {formatDate(job.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.region}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                              {job.sector}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                            {job.body_ar}
                          </p>
                          {job.closing_date && (
                            <div className="bg-muted/30 rounded-lg p-3 mb-4">
                              <div className="text-sm text-muted-foreground">
                                آخر أجل للتقديم: 
                                <span className={`font-semibold ml-1 ${deadlineStatus?.color}`}>
                                  {formatDate(job.closing_date)}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 hover:bg-primary hover:text-white transition-all duration-300 h-10" asChild>
                              <Link href={`/jobs/${job.slug_ar}`}>
                                <FileText className="w-4 h-4 ml-2" />
                                التفاصيل
                              </Link>
                            </Button>
                            {job.pdf_url && (
                              <Button className="bg-accent hover:bg-accent/90 text-white h-10 px-4" asChild>
                                <Link href={job.pdf_url} target="_blank">
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}