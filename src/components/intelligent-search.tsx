"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, Clock, TrendingUp, MapPin, Briefcase, BookOpen, Calendar } from "lucide-react";
import { debounce } from "@/lib/cache";

interface SearchSuggestion {
  text: string;
  type: 'query' | 'sector' | 'region';
  count?: number;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'job' | 'guidance' | 'exam';
  url: string;
  score: number;
  highlights: {
    title: string[];
    content: string[];
  };
  sector: string;
  region: string;
  createdAt: string;
  featured?: boolean;
  closingDate?: string;
  examDate?: string;
}

interface IntelligentSearchProps {
  onSearch?: (query: string) => void;
  className?: string;
  placeholder?: string;
}

export default function IntelligentSearch({ 
  onSearch, 
  className = "", 
  placeholder = "ابحث في العناوين، الوصف، القطاعات، أو الجهات..." 
}: IntelligentSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Popular search suggestions
  const popularSuggestions: SearchSuggestion[] = [
    { text: "التربية الوطنية", type: "sector", count: 15 },
    { text: "الصحة", type: "sector", count: 12 },
    { text: "الدار البيضاء", type: "region", count: 25 },
    { text: "الرباط", type: "region", count: 18 },
    { text: "مباراة توظيف", type: "query", count: 30 },
    { text: "باكالوريا", type: "query", count: 22 },
  ];

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSuggestions(popularSuggestions);
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search/advanced?q=${encodeURIComponent(searchQuery)}&limit=5`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setResults(data.data.results);
            
            // Generate suggestions from results
            const newSuggestions: SearchSuggestion[] = [];
            
            // Add query-based suggestions
            if (data.data.results.length > 0) {
              newSuggestions.push({
                text: searchQuery,
                type: 'query',
                count: data.data.results.length
              });
            }
            
            // Add sector and region suggestions
            data.data.suggestions.forEach((suggestion: string) => {
              if (suggestion.toLowerCase().includes(searchQuery.toLowerCase())) {
                const isSector = data.data.results.some((r: SearchResult) => 
                  r.sector === suggestion
                );
                newSuggestions.push({
                  text: suggestion,
                  type: isSector ? 'sector' : 'region',
                  count: data.data.results.filter((r: SearchResult) => 
                    r.sector === suggestion || r.region === suggestion
                  ).length
                });
              }
            });
            
            setSuggestions(newSuggestions);
          }
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query.length > 0) {
      debouncedSearch(query);
    } else {
      setSuggestions(popularSuggestions);
      setResults([]);
    }
  }, [query, debouncedSearch]);

  useEffect(() => {
    // Handle clicks outside the search component
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showResults) return;

    const totalItems = suggestions.length + results.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectItem(selectedIndex);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showResults, suggestions.length, results.length, selectedIndex]);

  const handleSelectItem = (index: number) => {
    if (index < suggestions.length) {
      const suggestion = suggestions[index];
      setQuery(suggestion.text);
      onSearch?.(suggestion.text);
    } else {
      const result = results[index - suggestions.length];
      window.location.href = result.url;
    }
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query);
      setShowResults(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions(popularSuggestions);
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'sector':
        return <Briefcase className="w-4 h-4" />;
      case 'region':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'guidance':
        return <BookOpen className="w-4 h-4 text-purple-600" />;
      case 'exam':
        return <Calendar className="w-4 h-4 text-green-600" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'أمس';
    if (diffDays <= 7) return `منذ ${diffDays} أيام`;
    return date.toLocaleDateString('ar-MA');
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onKeyDown={handleKeyDown}
          className="pr-12 h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 transition-colors text-right"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={clearSearch}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {showResults && (suggestions.length > 0 || results.length > 0 || isLoading) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl border-0 bg-white dark:bg-slate-800">
          <CardContent className="p-0">
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2 border-b dark:border-gray-700">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  الاقتراحات
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.type}-${suggestion.text}`}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 ${
                      selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleSelectItem(index)}
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{suggestion.text}</div>
                      <div className="text-xs text-gray-500">
                        {suggestion.type === 'sector' && 'قطاع'}
                        {suggestion.type === 'region' && 'جهة'}
                        {suggestion.type === 'query' && 'بحث'}
                        {suggestion.count && ` • ${suggestion.count} نتيجة`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  نتائج البحث
                </div>
                {results.map((result, index) => {
                  const resultIndex = suggestions.length + index;
                  return (
                    <div
                      key={result.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 ${
                        selectedIndex === resultIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => handleSelectItem(resultIndex)}
                    >
                      <div className="flex items-start gap-3">
                        {getResultIcon(result.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium line-clamp-1">
                              {result.title}
                            </h4>
                            {result.featured && (
                              <Badge variant="secondary" className="text-xs">
                                مميز
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {result.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {result.sector}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {result.region}
                            </span>
                            <span>{formatDate(result.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">جاري البحث...</p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && suggestions.length === 0 && results.length === 0 && query && (
              <div className="p-4 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">لا توجد نتائج لبحثك</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}