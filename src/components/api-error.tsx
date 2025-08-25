"use client";

import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ApiErrorProps {
  error?: string;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export default function ApiError({ 
  error, 
  onRetry, 
  title = "فشل تحميل البيانات",
  description = "تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى."
}: ApiErrorProps) {
  const { toast } = useToast();

  const handleRetry = () => {
    toast({
      title: "إعادة المحاولة",
      description: "جاري إعادة تحميل البيانات...",
    });
    onRetry?.();
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <WifiOff className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-xl flex items-center justify-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
            <p className="font-medium mb-1">رسالة الخطأ:</p>
            <p className="font-mono">{error}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={handleRetry} className="flex-1">
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="flex-1"
          >
            تحديث الصفحة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}