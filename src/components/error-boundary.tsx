"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "حدث خطأ",
      description: error.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
      variant: "destructive",
    });
  }, [error, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-xl">حدث خطأ</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            عذرًا، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
            <p className="font-medium mb-1">تفاصيل الخطأ:</p>
            <p className="font-mono">{error.message}</p>
            {error.digest && (
              <p className="font-mono mt-1">Digest: {error.digest}</p>
            )}
          </div>
          <Button onClick={reset} className="w-full">
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}