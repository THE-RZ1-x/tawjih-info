"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  FileText, 
  Calendar, 
  MapPin,
  Upload,
  X
} from "lucide-react";
import Link from "next/link";
import AdminAuthWrapper from "@/components/admin-auth-wrapper";

export default function NewContentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    title_ar: "",
    slug_ar: "",
    body_ar: "",
    sector: "",
    region: "",
    closing_date: "",
    exam_date: "",
    subject: "",
    school_level: "",
    featured: false,
    published: false,
    seo_title: "",
    seo_description: "",
    hero_image_alt: "",
    pdf_url: "",
    hero_image_url: ""
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');

  const uploadToServer = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: form,
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok || !data?.success) throw new Error(data?.message || 'Upload failed');
    return data.data as { url: string; name: string; size: number; type: string };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        alert(data?.message || 'فشل حفظ المحتوى');
        setIsLoading(false);
        return;
      }
      alert('تم حفظ المحتوى بنجاح!');
      router.push('/admin/dashboard');
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      uploadToServer(file)
        .then(({ url, type }) => {
          setUploadedUrl(url);
          // Decide which field to set based on file type
          if (type.includes('pdf')) {
            handleInputChange('pdf_url', url);
          } else {
            handleInputChange('hero_image_url', url);
          }
        })
        .catch(() => alert('فشل رفع الملف'));
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadedUrl('');
  };

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/dashboard">
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-primary">إضافة محتوى جديد</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 ml-2" />
                معاينة
              </Button>
              <Button type="submit" form="content-form" disabled={isLoading}>
                <Save className="w-4 h-4 ml-2" />
                {isLoading ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <form id="content-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    المعلومات الأساسية
                  </CardTitle>
                  <CardDescription>
                    أدخل المعلومات الأساسية للمحتوى
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">نوع المحتوى *</label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع المحتوى" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="job">مباراة</SelectItem>
                          <SelectItem value="guidance">توجيه مدرسي</SelectItem>
                          <SelectItem value="exam">امتحان</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">القطاع *</label>
                      <Select value={formData.sector} onValueChange={(value) => handleInputChange("sector", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر القطاع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="education">التربية الوطنية</SelectItem>
                          <SelectItem value="health">الصحة</SelectItem>
                          <SelectItem value="higher_education">التعليم العالي</SelectItem>
                          <SelectItem value="interior">الداخلية</SelectItem>
                          <SelectItem value="economy">الاقتصاد والمالية</SelectItem>
                          <SelectItem value="justice">العدل</SelectItem>
                          <SelectItem value="equipment">التجهيز</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">العنوان بالعربية *</label>
                    <Input
                      placeholder="أدخل العنوان بالعربية"
                      value={formData.title_ar}
                      onChange={(e) => handleInputChange("title_ar", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">الرابط (Slug) *</label>
                    <Input
                      placeholder="أدخل الرابط الصديق لمحركات البحث"
                      value={formData.slug_ar}
                      onChange={(e) => handleInputChange("slug_ar", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">المحتوى *</label>
                    <Textarea
                      placeholder="أدخل المحتوى بالعربية"
                      value={formData.body_ar}
                      onChange={(e) => handleInputChange("body_ar", e.target.value)}
                      rows={8}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">الجهة *</label>
                    <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الجهة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rabat">الرباط سلا القنيطرة</SelectItem>
                        <SelectItem value="casablanca">الدار البيضاء سطات</SelectItem>
                        <SelectItem value="marrakech">مراكش آسفي</SelectItem>
                        <SelectItem value="fes">فاس مكناس</SelectItem>
                        <SelectItem value="tangier">طنجة تطوان الحسيمة</SelectItem>
                        <SelectItem value="orient">الشرق</SelectItem>
                        <SelectItem value="souss">سوس ماسة</SelectItem>
                        <SelectItem value="guelmim">كلميم واد نون</SelectItem>
                        <SelectItem value="laayoune">العيون الساقية الحمراء</SelectItem>
                        <SelectItem value="dakhla">الداخلة وادي الذهب</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Conditional fields based on content type */}
                  {formData.type === "job" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">تاريخ الإغلاق</label>
                      <Input
                        type="date"
                        value={formData.closing_date}
                        onChange={(e) => handleInputChange("closing_date", e.target.value)}
                      />
                    </div>
                  )}

                  {formData.type === "exam" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">تاريخ الامتحان</label>
                        <Input
                          type="date"
                          value={formData.exam_date}
                          onChange={(e) => handleInputChange("exam_date", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">المادة</label>
                        <Input
                          placeholder="المادة"
                          value={formData.subject}
                          onChange={(e) => handleInputChange("subject", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">المستوى الدراسي</label>
                        <Select value={formData.school_level} onValueChange={(value) => handleInputChange("school_level", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="المستوى" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary">ابتدائي</SelectItem>
                            <SelectItem value="middle">إعدادي</SelectItem>
                            <SelectItem value="high">ثانوي تأهيلي</SelectItem>
                            <SelectItem value="university">جامعي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    الملفات المرفقة
                  </CardTitle>
                  <CardDescription>
                    ارفق ملف PDF أو صورة للمحتوى
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        اسحب وأفلت الملف هنا أو انقر للاختيار
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        PDF, PNG, JPG حتى 10MB
                      </p>
                      <Input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        اختر ملف
                      </Button>
                    </div>

                    {uploadedFile && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {uploadedUrl && (
                              <p className="text-xs text-green-600 break-all">{uploadedUrl}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeFile}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {uploadedUrl && uploadedFile && uploadedFile.type.startsWith('image/') && (
                      <div className="mt-2">
                        <img src={uploadedUrl} alt="preview" className="max-h-48 rounded" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publishing Options */}
              <Card>
                <CardHeader>
                  <CardTitle>خيارات النشر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) => handleInputChange("published", checked as boolean)}
                    />
                    <label htmlFor="published" className="text-sm">
                      نشر المحتوى
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleInputChange("featured", checked as boolean)}
                    />
                    <label htmlFor="featured" className="text-sm">
                      محتوى مميز
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">عنوان SEO</label>
                    <Input
                      placeholder="عنوان مخصص لمحركات البحث"
                      value={formData.seo_title}
                      onChange={(e) => handleInputChange("seo_title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">وصف SEO</label>
                    <Textarea
                      placeholder="وصف مخصص لمحركات البحث"
                      value={formData.seo_description}
                      onChange={(e) => handleInputChange("seo_description", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">نص بديل للصورة</label>
                    <Input
                      placeholder="نص بديل للصورة الرئيسية"
                      value={formData.hero_image_alt}
                      onChange={(e) => handleInputChange("hero_image_alt", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>الحالة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">النشر:</span>
                      <Badge variant={formData.published ? "default" : "secondary"}>
                        {formData.published ? "منشور" : "مسودة"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">التمييز:</span>
                      <Badge variant={formData.featured ? "default" : "secondary"}>
                        {formData.featured ? "مميز" : "عادي"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
    </AdminAuthWrapper>
  );
}