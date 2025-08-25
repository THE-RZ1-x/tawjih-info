"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, FileText, BookOpen, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface SearchResult {
  id: string;
  title_ar: string;
  slug_ar: string;
  body_ar: string;
  type: 'job' | 'guidance' | 'exam';
  url: string;
  createdAt: string;
  sector?: string;
  region?: string;
  subject?: string;
  school_level?: string;
  exam_date?: string;
  closing_date?: string;
}

interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  counts: {
    total: number;
    jobs: number;
    guidance: number;
    exams: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    query: string;
  };
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'job' | 'guidance' | 'exam'>('all');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query, selectedType]);

  const performSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${selectedType}&limit=10`);
      const data: SearchResponse = await response.json();

      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <TrendingUp className="w-4 h-4" />;
      case 'guidance':
        return <BookOpen className="w-4 h-4" />;
      case 'exam':
        return <Calendar className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'job':
        return 'مباراة';
      case 'guidance':
        return 'توجيه';
      case 'exam':
        return 'امتحان';
      default:
        return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'guidance':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'exam':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-MA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Trigger */}
      <Button
        variant="outline"
        className="relative h-10 w-full justify-start rounded-lg bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setIsOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        ابحث في المنصة...
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          ⌘K
        </kbd>
      </Button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed left-1/2 top-20 z-50 w-full max-w-2xl -translate-x-1/2 transform">
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-0">
                {/* Search Header */}
                <div className="flex items-center border-b p-4">
                  <Search className="mr-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    placeholder="ابحث في المباريات، التوجيه، والامتحانات..."
                    className="flex-1 border-0 bg-transparent text-lg focus-visible:ring-0"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Type Filters */}
                <div className="flex gap-2 border-b p-4">
                  <Button
                    variant={selectedType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('all')}
                  >
                    الكل
                  </Button>
                  <Button
                    variant={selectedType === 'job' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('job')}
                  >
                    مباريات
                  </Button>
                  <Button
                    variant={selectedType === 'guidance' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('guidance')}
                  >
                    توجيه
                  </Button>
                  <Button
                    variant={selectedType === 'exam' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('exam')}
                  >
                    امتحانات
                  </Button>
                </div>

                {/* Search Results */}
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-muted-foreground">جاري البحث...</div>
                    </div>
                  ) : query.length < 3 ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center text-muted-foreground">
                        <div className="text-lg mb-2">ابدأ البحث</div>
                        <div className="text-sm">اكتب 3 أحرف على الأقل للبدء في البحث</div>
                      </div>
                    </div>
                  ) : results.length === 0 ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center text-muted-foreground">
                        <div className="text-lg mb-2">لا توجد نتائج</div>
                        <div className="text-sm">جرب كلمات بحث أخرى</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2">
                      {results.map((result) => (
                        <Link
                          key={result.id}
                          href={result.url}
                          className="block"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors">
                            <div className="mt-1">
                              {getTypeIcon(result.type)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium leading-none line-clamp-1">
                                  {result.title_ar}
                                </h3>
                                <Badge variant="secondary" className={`text-xs ${getTypeColor(result.type)}`}>
                                  {getTypeLabel(result.type)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {truncateText(result.body_ar, 100)}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{formatDate(result.createdAt)}</span>
                                {result.sector && (
                                  <span>{result.sector}</span>
                                )}
                                {result.region && (
                                  <span>{result.region}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Footer */}
                <div className="border-t bg-muted/50 p-3">
                  <div className="text-xs text-muted-foreground">
                    اضغط ⌘K لفتح البحث بسرعة
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}