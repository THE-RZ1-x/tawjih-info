import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function JobDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <nav className="hidden md:flex gap-6">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <span className="text-muted-foreground">/</span>
            <Skeleton className="h-4 w-16" />
            <span className="text-muted-foreground">/</span>
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Back Button */}
            <Skeleton className="h-10 w-32 mb-6" />

            {/* Article Header */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-8 w-full mb-4" />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Article Content */}
            <Card>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>

            {/* Share Section */}
            <Card className="mt-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Skeleton className="h-3 w-12 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div>
                  <Skeleton className="h-3 w-12 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div>
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>

            {/* Download */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            {/* Related Posts */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-2 border-muted pl-4">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <Skeleton className="h-4 w-44 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-4 w-64 mb-4" />
          <div className="flex justify-center gap-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export function GuidanceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <nav className="hidden md:flex gap-6">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <span className="text-muted-foreground">/</span>
            <Skeleton className="h-4 w-20" />
            <span className="text-muted-foreground">/</span>
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Back Button */}
            <Skeleton className="h-10 w-40 mb-6" />

            {/* Article Header */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-8 w-full mb-4" />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Article Content */}
            <Card>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>

            {/* Share Section */}
            <Card className="mt-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Skeleton className="h-3 w-12 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div>
                  <Skeleton className="h-3 w-12 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div>
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </CardContent>
            </Card>

            {/* Download */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            {/* Related Posts */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-28" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-2 border-muted pl-4">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <Skeleton className="h-4 w-44 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-4 w-64 mb-4" />
          <div className="flex justify-center gap-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export function ExamDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <nav className="hidden md:flex gap-6">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <span className="text-muted-foreground">/</span>
            <Skeleton className="h-4 w-16" />
            <span className="text-muted-foreground">/</span>
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Back Button */}
            <Skeleton className="h-10 w-36 mb-6" />

            {/* Article Header */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-8 w-full mb-4" />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Article Content */}
            <Card>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>

            {/* Share Section */}
            <Card className="mt-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Skeleton className="h-3 w-12 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div>
                  <Skeleton className="h-3 w-12 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div>
                  <Skeleton className="h-3 w-12 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div>
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>

            {/* Download */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            {/* Related Posts */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-2 border-muted pl-4">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <Skeleton className="h-4 w-44 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-4 w-64 mb-4" />
          <div className="flex justify-center gap-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </footer>
    </div>
  );
}