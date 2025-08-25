"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, MapPin, FileText, ExternalLink, TrendingUp, Users, Award, BookOpen, Search, Star, Clock, Eye, Filter, Bell, Heart, Share2, Bookmark, ArrowRight, Sparkles, Zap, Target, Lightbulb } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import UserMenu from "@/components/user-menu";
import NotificationCenter from "@/components/notification-center";
import IntelligentSearch from "@/components/intelligent-search";
import { toast } from "sonner";
import { StructuredData } from "@/components/structured-data";
import OptimizedImage from "@/components/optimized-image";

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
}

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
}

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
}

export default function Home() {
  const [jobs, setJobs] = useState<JobCompetition[]>([]);
  const [guidance, setGuidance] = useState<SchoolGuidance[]>([]);
  const [exams, setExams] = useState<ExamCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [quickStats, setQuickStats] = useState({
    totalViews: 0,
    activeUsers: 0,
    newToday: 0
  });

  useEffect(() => {
    fetchData();
    loadSavedItems();
    loadTrendingTopics();
    loadQuickStats();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [jobsRes, guidanceRes, examsRes] = await Promise.all([
        fetch('/api/jobs?published=true&limit=3'),
        fetch('/api/guidance?published=true&limit=3'),
        fetch('/api/exams?published=true&limit=3')
      ]);

      const [jobsData, guidanceData, examsData] = await Promise.all([
        jobsRes.json(),
        guidanceRes.json(),
        examsRes.json()
      ]);

      if (jobsData.success) setJobs(jobsData.data);
      if (guidanceData.success) setGuidance(guidanceData.data);
      if (examsData.success) setExams(examsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedItems = () => {
    const saved = localStorage.getItem('savedItems');
    if (saved) {
      setSavedItems(JSON.parse(saved));
    }
  };

  const loadTrendingTopics = () => {
    // Simulated trending topics - in real app, this would come from API
    setTrendingTopics([
      'مباريات التربية الوطنية',
      'توجيه الباكالوريا',
      'امتحانات الجهوية',
      'وظائف القطاع الصحي',
      'التوجيه الجامعي'
    ]);
  };

  const loadQuickStats = () => {
    // Simulated stats - in real app, this would come from API
    setQuickStats({
      totalViews: 15420,
      activeUsers: 342,
      newToday: 28
    });
  };

  const toggleSaveItem = (itemId: string) => {
    const newSavedItems = savedItems.includes(itemId)
      ? savedItems.filter(id => id !== itemId)
      : [...savedItems, itemId];
    
    setSavedItems(newSavedItems);
    localStorage.setItem('savedItems', JSON.stringify(newSavedItems));
    
    if (savedItems.includes(itemId)) {
      toast.success('تم إزالة العنصر من المحفوظات');
    } else {
      toast.success('تم حفظ العنصر بنجاح');
    }
  };

  const shareItem = (item: any) => {
    if (navigator.share) {
      navigator.share({
        title: item.title_ar,
        text: item.body_ar.substring(0, 100) + '...',
        url: window.location.origin + getLink(item)
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + getLink(item));
      toast.success('تم نسخ الرابط إلى الحافظة');
    }
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

  const latestContent = [
    ...jobs.slice(0, 4).map(job => ({ ...job, type: 'job' })),
    ...guidance.slice(0, 4).map(item => ({ ...item, type: 'guidance' })),
    ...exams.slice(0, 4).map(exam => ({ ...exam, type: 'exam' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredContent = latestContent.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.region.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === "all" || item.type === activeFilter;
    const matchesFeatured = !featuredOnly || item.featured;
    
    return matchesSearch && matchesFilter && matchesFeatured;
  });

  const getBadgeInfo = (type: string) => {
    switch (type) {
      case 'job':
        return { label: 'مباراة', color: 'bg-primary/10 text-primary border-primary/20' };
      case 'guidance':
        return { label: 'توجيه', color: 'bg-accent/10 text-accent border-accent/20' };
      case 'exam':
        return { label: 'امتحان', color: 'bg-primary/10 text-primary border-primary/20' };
      default:
        return { label: '', color: '' };
    }
  };

  const getLink = (item: any) => {
    switch (item.type) {
      case 'job':
        return `/jobs/${item.slug_ar}`;
      case 'guidance':
        return `/guidance/${item.slug_ar}`;
      case 'exam':
        return `/exams/${item.slug_ar}`;
      default:
        return '#';
    }
  };

  return (
    <>
      <StructuredData 
        type="website"
        name="INFO TAWJIH 2.0"
        description="منصة متخصصة في التوجيه المدرسي ومباريات التوظيف العمومي وتواريخ الامتحانات بالمغرب"
        url={typeof window !== 'undefined' ? window.location.origin : ''}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
                <BookOpen className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  INFO TAWJIH 2.0
                </h1>
                <p className="text-sm text-muted-foreground">منصة التوجيه والمباريات المغربية</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex gap-8">
                <Link href="/" className="text-foreground hover:text-blue-600 transition-colors font-medium relative group">
                  الرئيسية
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                </Link>
                <Link href="/jobs" className="text-foreground hover:text-blue-600 transition-colors font-medium relative group">
                  مباريات
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                </Link>
                <Link href="/guidance" className="text-foreground hover:text-blue-600 transition-colors font-medium relative group">
                  توجيه مدرسي
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                </Link>
                <Link href="/exams" className="text-foreground hover:text-blue-600 transition-colors font-medium relative group">
                  الامتحانات
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                </Link>
                <Link href="/admin" className="text-foreground hover:text-blue-600 transition-colors font-medium relative group">
                  لوحة التحكم
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                </Link>
              </nav>
              <NotificationCenter />
              <UserMenu />
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => {
                  // Mobile menu toggle logic
                  toast.info('قائمة الجوال قيد التطوير');
                }}
              >
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section with Interactive Elements */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059ce6' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-6 py-3 rounded-full mb-8 shadow-lg border border-blue-200 dark:border-blue-800"
            >
              <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">منصتك الموثوقة للتوجيه والمباريات</span>
              <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-none animate-pulse">
                جديد
              </Badge>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                مرحباً بك في منصة
              </span>
              <br />
              <span className="text-blue-600 dark:text-blue-400">التوجيه والمباريات</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto"
            >
              مصدرك الموثوق لأخبار المباريات والتوجيه المدرسي وتواريخ الامتحانات بالمغرب
            </motion.p>
            
            {/* Enhanced CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
            >
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group" asChild>
                <Link href="/jobs">
                  <TrendingUp className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform duration-300" />
                  استعرض المباريات
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg rounded-full border-2 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 group" asChild>
                <Link href="/guidance">
                  <Users className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
                  التوجيه المدرسي
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </motion.div>
            
            {/* Trending Topics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-2 justify-center"
            >
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Zap className="w-4 h-4" />
                المواضيع الرائجة:
              </span>
              {trendingTopics.map((topic, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                  onClick={() => {
                    setSearchQuery(topic);
                    toast.info(`تم البحث عن: ${topic}`);
                  }}
                >
                  {topic}
                </Badge>
              ))}
            </motion.div>
          </div>
        </div>
        
        {/* Enhanced Animated decorative elements */}
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 20, 0]
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
            opacity: [0.3, 0.5, 0.3],
            x: [0, -30, 0]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-400/15 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>
      </section>

      {/* Enhanced Stats Section with Live Counter */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: 'مباراة نشطة', value: jobs.length, color: 'text-blue-600', icon: TrendingUp, suffix: '' },
              { label: 'دليل توجيه', value: guidance.length, color: 'text-purple-600', icon: BookOpen, suffix: '' },
              { label: 'جدول امتحانات', value: exams.length, color: 'text-pink-600', icon: CalendarDays, suffix: '' },
              { label: 'مستخدم نشط', value: quickStats.activeUsers, color: 'text-green-600', icon: Users, suffix: '+' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className={`w-8 h-8 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                </div>
                <div className={`text-4xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={stat.value}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {stat.value}{stat.suffix}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Live Activity Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/20 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 dark:text-green-400">
                {quickStats.newToday} عنصر جديد اليوم
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Latest Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              آخر المستجدات
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              أحدث المباريات والإعلانات والتوجيهات والامتحانات
            </p>
          </div>

          {/* Enhanced Search and Filter Bar */}
          <div className="mb-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <IntelligentSearch 
              onSearch={(query) => {
                setSearchQuery(query);
                // Navigate to search results page or filter current results
              }}
              className="mb-4"
            />
            <div className="flex gap-2 flex-wrap">
              {['all', 'job', 'guidance', 'exam'].map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className="text-sm"
                >
                  {filter === 'all' ? 'الكل' : 
                   filter === 'job' ? 'مباريات' :
                   filter === 'guidance' ? 'توجيه' : 'امتحانات'}
                </Button>
              ))}
              <Button
                variant={featuredOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setFeaturedOnly(!featuredOnly)}
                className="text-sm"
              >
                <Star className="w-4 h-4 ml-1" />
                مميز
              </Button>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                شبكة
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                قائمة
              </Button>
            </div>
          </div>
          
          {/* Enhanced Content Grid */}
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
            {loading ? (
              <div className="col-span-full">
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
              </div>
            ) : filteredContent.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-lg text-muted-foreground mb-4">لا توجد نتائج للبحث</div>
                <Button onClick={() => { setSearchQuery(""); setActiveFilter("all"); setFeaturedOnly(false); }}>
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            ) : (
              filteredContent.map((item, index) => {
                const badgeInfo = getBadgeInfo(item.type);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className={`card-hover border-0 shadow-lg overflow-hidden group ${viewMode === "list" ? "flex flex-row" : ""}`}>
                      <div className={`absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      <CardHeader className={`pb-3 ${viewMode === "list" ? "flex-1" : ""}`}>
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="secondary" className={`${badgeInfo.color} text-sm font-medium`}>
                            {badgeInfo.label}
                          </Badge>
                          <div className="flex gap-2">
                            {item.featured && (
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none">
                                <Star className="w-3 h-3 ml-1" />
                                مميز
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              <Eye className="w-3 h-3 ml-1" />
                              {Math.floor(Math.random() * 1000) + 100}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className={`text-xl font-bold line-clamp-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 ${viewMode === "list" ? "text-lg" : ""}`}>
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
                      <CardContent className={`pt-0 ${viewMode === "list" ? "flex-1" : ""}`}>
                        <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                          {item.body_ar}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button variant="outline" className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all duration-300 group" asChild>
                              <Link href={getLink(item)}>
                                <FileText className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform duration-300" />
                                التفاصيل
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`transition-colors duration-200 ${savedItems.includes(item.id) ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'}`}
                              onClick={() => toggleSaveItem(item.id)}
                            >
                              <Heart className={`w-4 h-4 ${savedItems.includes(item.id) ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
                              onClick={() => shareItem(item)}
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                          {item.pdf_url && (
                            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white" size="sm" asChild>
                              <Link href={item.pdf_url} target="_blank">
                                <ExternalLink className="w-4 h-4 ml-2" />
                                الملف
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>
      
      {/* Enhanced Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">INFO TAWJIH 2.0</h3>
              </div>
              <p className="text-slate-400 text-sm">
                منصتك الموثوقة للتوجيه والمباريات بالمغرب
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/jobs" className="hover:text-white transition-colors">المباريات</Link></li>
                <li><Link href="/guidance" className="hover:text-white transition-colors">التوجيه المدرسي</Link></li>
                <li><Link href="/exams" className="hover:text-white transition-colors">الامتحانات</Link></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">لوحة التحكم</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">الدعم</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">مساعدة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">اتصل بنا</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الشروط والأحكام</a></li>
                <li><a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">تابعنا</h4>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 INFO TAWJIH 2.0. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}