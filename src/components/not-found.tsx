"use client";

import { useToast } from "@/hooks/use-toast";
import { Search, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface NotFoundProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  backUrl?: string;
  backText?: string;
}

export default function NotFound({ 
  title = "الصفحة غير موجودة",
  description = "عذرًا، الصفحة التي تبحث عنها غير موجودة أو قد تم نقلها.",
  showBackButton = true,
  backUrl,
  backText
}: NotFoundProps) {
  const { toast } = useToast();

  const handleGoBack = () => {
    if (backUrl) {
      window.location.href = backUrl;
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Search className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 ml-2" />
                العودة للصفحة الرئيسية
              </Link>
            </Button>
            {showBackButton && (
              <Button 
                variant="outline" 
                onClick={handleGoBack} 
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                {backText || "العودة للصفحة السابقة"}
              </Button>
            )}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>يمكنك أيضًا:</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link href="/jobs" className="text-primary hover:underline">
                المباريات
              </Link>
              <Link href="/guidance" className="text-primary hover:underline">
                التوجيه المدرسي
              </Link>
              <Link href="/exams" className="text-primary hover:underline">
                الامتحانات
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}