"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setIsAuthenticated(true);
            setAdminUser(data.data);
          } else {
            router.push('/admin');
          }
        } else {
          router.push('/admin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Shield className="w-12 h-12 text-primary" />
                <Loader2 className="w-6 h-6 text-primary animate-spin absolute -top-1 -right-1" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">جاري التحقق من الهوية</h3>
                <p className="text-sm text-muted-foreground">
                  يرجى الانتظار بينما نتحقق من صلاحياتك...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !adminUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Shield className="w-12 h-12 text-destructive" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-destructive">غير مصرح</h3>
                <p className="text-sm text-muted-foreground">
                  ليس لديك صلاحية للوصول إلى هذه الصفحة
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}