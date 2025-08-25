"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  FileText, 
  CalendarDays, 
  Users, 
  BarChart3,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Eye,
  Star,
  Clock,
  MapPin,
  Briefcase,
  Activity,
  Zap,
  Target,
  Award
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import AdminAuthWrapper from "@/components/admin-auth-wrapper";

interface Post {
  id: string;
  title_ar: string;
  type: "job" | "guidance" | "exam";
  published: boolean;
  featured: boolean;
  createdAt: string;
  sector: string;
  region: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<'all' | 'jobs' | 'guidance' | 'exams'>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Verify admin session using secure cookie
    const verify = async () => {
      try {
        const res = await fetch('/api/admin/auth/me', { method: 'GET' });
        if (!res.ok) {
          router.push('/admin');
          return;
        }
        const data = await res.json().catch(() => null);
        const role = data?.data?.admin ? 'admin' : null;
        if (role !== 'admin') {
          router.push('/admin');
          return;
        }
        await refreshList();
        setIsLoading(false);
      } catch {
        router.push('/admin');
      }
    };
    verify();
  }, [router]);

  const refreshList = async () => {
    const typeParam = tab === 'all' ? 'all' : tab === 'jobs' ? 'job' : tab === 'guidance' ? 'guidance' : 'exam';
    const params = new URLSearchParams();
    params.set('type', typeParam);
    if (query) params.set('q', query);
    const res = await fetch(`/api/admin/content/list?${params.toString()}`, { credentials: 'include' });
    const data = await res.json().catch(() => null);
    if (data?.success) setPosts(data.data);
  };

  const togglePublish = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/content/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !current })
    });
    await refreshList();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/content/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !current })
    });
    await refreshList();
  };

  const deletePost = async (id: string) => {
    if (!confirm('هل تريد حذف هذا المحتوى؟')) return;
    await fetch(`/api/admin/content/${id}`, { method: 'DELETE' });
    await refreshList();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/admin');
  };

  // stats will be computed from posts

  // Enhanced analytics data
  const analytics = {
    overview: {
      totalViews: 125430,
      totalUsers: 8567,
      newUsers: 1234,
      bounceRate: 23.5
    },
    content: {
      jobs: { total: posts.filter(p=>p.type==='job').length, published: posts.filter(p=>p.type==='job'&&p.published).length, featured: posts.filter(p=>p.type==='job'&&p.featured).length, views: 45670 },
      guidance: { total: posts.filter(p=>p.type==='guidance').length, published: posts.filter(p=>p.type==='guidance'&&p.published).length, featured: posts.filter(p=>p.type==='guidance'&&p.featured).length, views: 32100 },
      exams: { total: posts.filter(p=>p.type==='exam').length, published: posts.filter(p=>p.type==='exam'&&p.published).length, featured: posts.filter(p=>p.type==='exam'&&p.featured).length, views: 28900 }
    },
    userActivity: {
      dailyActive: 1245,
      weeklyActive: 5678,
      monthlyActive: 15432,
      topRegions: [
        { name: "الرباط", count: 1234 },
        { name: "الدار البيضاء", count: 987 },
        { name: "مراكش", count: 756 },
        { name: "فاس", count: 543 }
      ],
      topSectors: [
        { name: "التربية الوطنية", count: 2341 },
        { name: "الصحة", count: 1876 },
        { name: "التعليم العالي", count: 1543 },
        { name: "الداخلية", count: 1234 }
      ]
    }
  };

  const stats = {
    totalPosts: posts.length,
    publishedPosts: posts.filter(p => p.published).length,
    featuredPosts: posts.filter(p => p.featured).length,
    draftPosts: posts.filter(p => !p.published).length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Enhanced Header */}
      <header className="border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    لوحة تحكم المسؤول
                  </h1>
                  <p className="text-sm text-muted-foreground">INFO TAWJIH 2.0</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild className="border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500">
                <Link href="/" target="_blank">
                  <FileText className="w-4 h-4 ml-2" />
                  عرض الموقع
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-2 border-red-200 dark:border-red-800 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Overview Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                نظرة عامة على الأداء
          </h2>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { 
                label: 'إجمالي المشاهدات', 
                value: analytics.overview.totalViews.toLocaleString(), 
                change: '+12.5%', 
                icon: Eye, 
                color: 'text-blue-600',
                bgColor: 'bg-blue-50 dark:bg-blue-900/20'
              },
              { 
                label: 'المستخدمون النشطون', 
                value: analytics.overview.totalUsers.toLocaleString(), 
                change: '+8.3%', 
                icon: Users, 
                color: 'text-green-600',
                bgColor: 'bg-green-50 dark:bg-green-900/20'
              },
              { 
                label: 'المستخدمون الجدد', 
                value: analytics.overview.newUsers.toLocaleString(), 
                change: '+15.2%', 
                icon: TrendingUp, 
                color: 'text-purple-600',
                bgColor: 'bg-purple-50 dark:bg-purple-900/20'
              },
              { 
                label: 'معدل الارتداد', 
                value: `${analytics.overview.bounceRate}%`, 
                change: '-2.1%', 
                icon: Activity, 
                color: 'text-orange-600',
                bgColor: 'bg-orange-50 dark:bg-orange-900/20'
              }
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${metric.color.replace('text-', 'from-')} to-transparent`}></div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {metric.label}
                      </CardTitle>
                      <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                        <metric.icon className={`w-4 h-4 ${metric.color}`} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold mb-1">{metric.value}</div>
                    <div className="flex items-center gap-1 text-sm">
                      {metric.change.startsWith('+') ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                      <span className={metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                        {metric.change}
                      </span>
                      <span className="text-muted-foreground">من الشهر الماضي</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Content Management Stats */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">إدارة المحتوى</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المحتويات</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalPosts}</div>
                <p className="text-xs text-muted-foreground">جميع الأنواع</p>
                <Progress value={(stats.publishedPosts / stats.totalPosts) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">منشورة</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.publishedPosts}</div>
                <p className="text-xs text-muted-foreground">محتوى منشور</p>
                <Progress value={(stats.publishedPosts / stats.totalPosts) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مميزة</CardTitle>
                <Star className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.featuredPosts}</div>
                <p className="text-xs text-muted-foreground">محتوى مميز</p>
                <Progress value={(stats.featuredPosts / stats.totalPosts) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مسودة</CardTitle>
                <CalendarDays className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{stats.draftPosts}</div>
                <p className="text-xs text-muted-foreground">محتوى غير منشور</p>
                <Progress value={(stats.draftPosts / stats.totalPosts) * 100} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  تحليل المحتوى حسب النوع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.content).map(([type, data], index) => (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {type === 'jobs' ? 'المباريات' : 
                           type === 'guidance' ? 'التوجيه' : 'الامتحانات'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {data.views.toLocaleString()} مشاهدة
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Progress value={(data.published / data.total) * 100} className="flex-1" />
                        <span className="text-sm text-muted-foreground">
                          {data.published}/{data.total}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>• {data.featured} مميز</span>
                        <span>• {data.total - data.published} مسودة</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  نشاط المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">نشط يومياً</span>
                    <span className="font-semibold text-blue-600">
                      {analytics.userActivity.dailyActive.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">نشط أسبوعياً</span>
                    <span className="font-semibold text-green-600">
                      {analytics.userActivity.weeklyActive.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">نشط شهرياً</span>
                    <span className="font-semibold text-purple-600">
                      {analytics.userActivity.monthlyActive.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Regions and Sectors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                الجهات الأكثر نشاطاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.userActivity.topRegions.map((region, index) => (
                  <div key={region.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <span className="text-sm">{region.name}</span>
                    </div>
                    <Badge variant="secondary">{region.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                القطاعات الأكثر طلباً
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.userActivity.topSectors.map((sector, index) => (
                  <div key={sector.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <span className="text-sm">{sector.name}</span>
                    </div>
                    <Badge variant="secondary">{sector.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Management */}
        <Tabs value={tab} onValueChange={(v)=>{ setTab(v as any); setTimeout(refreshList, 0); }} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-4">
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="jobs">مباريات</TabsTrigger>
              <TabsTrigger value="guidance">توجيه</TabsTrigger>
              <TabsTrigger value="exams">امتحانات</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                <Link href="/admin/dashboard/new">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة محتوى
                </Link>
              </Button>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="flex flex-col sm:flex-row gap-4 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="ابحث في العناوين، الوصف، القطاعات، أو الجهات..." 
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter'){ refreshList(); } }}
                className="pr-10 h-10 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-3 py-2 h-10 border-2 border-gray-200 dark:border-gray-700 rounded-md text-sm focus:border-blue-500">
                <option>جميع القطاعات</option>
                <option>التربية الوطنية</option>
                <option>الصحة</option>
                <option>التعليم العالي</option>
              </select>
              <select className="px-3 py-2 h-10 border-2 border-gray-200 dark:border-gray-700 rounded-md text-sm focus:border-blue-500">
                <option>جميع الجهات</option>
                <option>الرباط</option>
                <option>الدار البيضاء</option>
                <option>مراكش</option>
              </select>
              <Button variant="outline" size="icon" className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Content Lists */}
          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant={
                              post.type === 'job' ? 'default' : 
                              post.type === 'guidance' ? 'secondary' : 'outline'
                            } className="text-xs">
                              {post.type === 'job' ? 'مباراة' : 
                               post.type === 'guidance' ? 'توجيه' : 'امتحان'}
                            </Badge>
                            {post.featured && (
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none text-xs">
                                <Star className="w-3 h-3 ml-1" />
                                مميز
                              </Badge>
                            )}
                            {post.published ? (
                              <Badge className="bg-green-600 text-white text-xs">
                                منشور
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                مسودة
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                            {post.title_ar}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {post.sector}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {post.region}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-4 h-4" />
                              {post.createdAt}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {Math.floor(Math.random() * 1000) + 100} مشاهدة
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {Math.floor(Math.random() * 24) + 1} ساعة مضت
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={()=>togglePublish(post.id, post.published)} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <Edit className="w-4 h-4 ml-2" />
                            {post.published ? 'إلغاء النشر' : 'نشر'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={()=>toggleFeatured(post.id, post.featured)} className="hover:bg-orange-50 dark:hover:bg-orange-900/20">
                            <Star className="w-4 h-4 ml-2" />
                            {post.featured ? 'إلغاء التمييز' : 'تمييز'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={()=>deletePost(post.id)} className="hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <div className="grid gap-4">
              {posts.filter(p => p.type === 'job').map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default">مباراة</Badge>
                          {post.featured && (
                            <Badge className="bg-orange-500">مميز</Badge>
                          )}
                          {post.published ? (
                            <Badge className="bg-green-600">منشور</Badge>
                          ) : (
                            <Badge variant="secondary">مسودة</Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{post.title_ar}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>القطاع: {post.sector}</span>
                          <span>الجهة: {post.region}</span>
                          <span>تاريخ الإنشاء: {post.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={()=>togglePublish(post.id, post.published)}>
                          {post.published ? 'إلغاء النشر' : 'نشر'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={()=>toggleFeatured(post.id, post.featured)}>
                          {post.featured ? 'إلغاء التمييز' : 'تمييز'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={()=>deletePost(post.id)}>
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="guidance" className="space-y-4">
            <div className="grid gap-4">
              {posts.filter(p => p.type === 'guidance').map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">توجيه</Badge>
                          {post.featured && (
                            <Badge className="bg-orange-500">مميز</Badge>
                          )}
                          {post.published ? (
                            <Badge className="bg-green-600">منشور</Badge>
                          ) : (
                            <Badge variant="secondary">مسودة</Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{post.title_ar}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>القطاع: {post.sector}</span>
                          <span>الجهة: {post.region}</span>
                          <span>تاريخ الإنشاء: {post.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={()=>togglePublish(post.id, post.published)}>
                          {post.published ? 'إلغاء النشر' : 'نشر'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={()=>toggleFeatured(post.id, post.featured)}>
                          {post.featured ? 'إلغاء التمييز' : 'تمييز'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={()=>deletePost(post.id)}>
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exams" className="space-y-4">
            <div className="grid gap-4">
              {posts.filter(p => p.type === 'exam').map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">امتحان</Badge>
                          {post.featured && (
                            <Badge className="bg-orange-500">مميز</Badge>
                          )}
                          {post.published ? (
                            <Badge className="bg-green-600">منشور</Badge>
                          ) : (
                            <Badge variant="secondary">مسودة</Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{post.title_ar}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>القطاع: {post.sector}</span>
                          <span>الجهة: {post.region}</span>
                          <span>تاريخ الإنشاء: {post.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={()=>togglePublish(post.id, post.published)}>
                          {post.published ? 'إلغاء النشر' : 'نشر'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={()=>toggleFeatured(post.id, post.featured)}>
                          {post.featured ? 'إلغاء التمييز' : 'تمييز'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={()=>deletePost(post.id)}>
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AdminAuthWrapper>
  );
}