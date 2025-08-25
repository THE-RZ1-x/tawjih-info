"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { User, Mail, Building, Bell, BookOpen, MapPin, Briefcase, Settings, LogOut, Star, Calendar, Eye } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  if (!user || !isOpen) return null;

  const handleSave = () => {
    // In a real app, this would update the user via API
    localStorage.setItem("user", JSON.stringify(editedUser));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              الملف الشخصي
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="mt-1">
                {user.role === "admin" ? "مسؤول" : "مستخدم"}
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
              <TabsTrigger value="preferences">التفضيلات</TabsTrigger>
              <TabsTrigger value="activity">النشاط</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="border-0 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>المعلومات الشخصية</CardTitle>
                    <CardDescription>
                      إدارة معلوماتك الشخصية
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Settings className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">الاسم الكامل</Label>
                        <div className="relative">
                          <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="edit-name"
                            type="text"
                            className="pr-10 text-right"
                            value={editedUser?.name || ""}
                            onChange={(e) => setEditedUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                        <div className="relative">
                          <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="edit-email"
                            type="email"
                            className="pr-10 text-right"
                            value={editedUser?.email || ""}
                            onChange={(e) => setEditedUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave}>حفظ</Button>
                        <Button variant="outline" onClick={handleCancel}>إلغاء</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">الاسم الكامل</div>
                          <div className="text-muted-foreground">{user.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">البريد الإلكتروني</div>
                          <div className="text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Building className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">نوع الحساب</div>
                          <div className="text-muted-foreground">{user.role === "admin" ? "مسؤول" : "مستخدم عادي"}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card className="border-0 shadow-none">
                <CardHeader>
                  <CardTitle>التفضيلات</CardTitle>
                  <CardDescription>
                    تخصيص تجربتك الشخصية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        <span>الإشعارات</span>
                      </div>
                      <Switch
                        checked={user.preferences.notifications}
                        onCheckedChange={(checked) => {
                          const updatedUser = {
                            ...user,
                            preferences: { ...user.preferences, notifications: checked }
                          };
                          localStorage.setItem("user", JSON.stringify(updatedUser));
                          setEditedUser(updatedUser);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>التحديثات البريدية</span>
                      </div>
                      <Switch
                        checked={user.preferences.emailUpdates}
                        onCheckedChange={(checked) => {
                          const updatedUser = {
                            ...user,
                            preferences: { ...user.preferences, emailUpdates: checked }
                          };
                          localStorage.setItem("user", JSON.stringify(updatedUser));
                          setEditedUser(updatedUser);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">المناطق المفضلة</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.preferences.favoriteRegions.length > 0 ? (
                        user.preferences.favoriteRegions.map((region, index) => (
                          <Badge key={index} variant="secondary">
                            <MapPin className="w-3 h-3 ml-1" />
                            {region}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">لا توجد مناطق مفضلة</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">القطاعات المفضلة</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.preferences.favoriteSectors.length > 0 ? (
                        user.preferences.favoriteSectors.map((sector, index) => (
                          <Badge key={index} variant="secondary">
                            <Briefcase className="w-3 h-3 ml-1" />
                            {sector}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">لا توجد قطاعات مفضلة</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="border-0 shadow-none">
                <CardHeader>
                  <CardTitle>النشاط الأخير</CardTitle>
                  <CardDescription>
                    نظرة عامة على نشاطك على المنصة
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{user.preferences.savedJobs.length}</div>
                      <div className="text-sm text-muted-foreground">وظائف محفوظة</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">1,234</div>
                      <div className="text-sm text-muted-foreground">مشاهدة</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">15</div>
                      <div className="text-sm text-muted-foreground">أيام نشاط</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">الوظائف المحفوظة</h4>
                    {user.preferences.savedJobs.length > 0 ? (
                      <div className="space-y-2">
                        {user.preferences.savedJobs.map((jobId, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="font-medium">وظيفة #{jobId}</div>
                              <div className="text-sm text-muted-foreground">محفوظة منذ {index + 1} أيام</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">لا توجد وظائف محفوظة</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-6 border-t">
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={() => {
                logout();
                onClose();
              }}
            >
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}