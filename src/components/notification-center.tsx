"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Clock, CheckCircle, AlertCircle, Info, Star, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Simulate real-time notifications
    const mockNotifications: Notification[] = [
      {
        id: "1",
        title: "مباراة جديدة في التربية الوطنية",
        message: "تم إضافة مباراة توظيف 20 أستاذاً بمادة الرياضيات",
        type: "info",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: false,
        action: {
          label: "عرض التفاصيل",
          url: "/jobs/مباراة-توظيف-أساتذة-رياضيات"
        }
      },
      {
        id: "2",
        title: "تذكير بتاريخ الإغلاق",
        message: "مباراة وزارة الصحة ستغلق بعد 3 أيام",
        type: "warning",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
        action: {
          label: "عرض المباراة",
          url: "/jobs/مباراة-وزارة-الصحة"
        }
      },
      {
        id: "3",
        title: "تم نشر دليل التوجيه الجديد",
        message: "دليل التوجيه الجامعي 2025-2026 متاح الآن",
        type: "success",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: true,
        action: {
          label: "قراءة الدليل",
          url: "/guidance/دليل-التوجيه-الجامعي-2025"
        }
      },
      {
        id: "4",
        title: "تحديث في تواريخ الامتحانات",
        message: "تم تعديل تواريخ امتحانات الباكالوريا",
        type: "info",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: true,
        action: {
          label: "عرض الجدول",
          url: "/exams/تواريخ-باكالوريا-2025"
        }
      }
    ];

    setNotifications(mockNotifications);

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: "تحديث جديد",
          message: "تمت إضافة محتوى جديد يهم تخصصاتك",
          type: "info",
          timestamp: new Date().toISOString(),
          read: false
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "الآن";
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative h-10 w-10 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount}
          </div>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-12 left-0 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">الإشعارات</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    تعيين الكل كمقروء
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                    !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      {notification.action && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          asChild
                        >
                          <a href={notification.action.url}>
                            {notification.action.label}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" size="sm" className="w-full">
              عرض جميع الإشعارات
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}