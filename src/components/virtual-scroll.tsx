"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { throttle } from "@/lib/cache";

interface VirtualScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export default function VirtualScroll<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
  className = "",
  onEndReached,
  endReachedThreshold = 200,
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Calculate visible range
  const getVisibleRange = useCallback(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const { startIndex, endIndex } = getVisibleRange();
  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Handle scroll events with throttling
  const handleScroll = useCallback(
    throttle((e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      setScrollTop(scrollTop);

      // Check if we've reached the end
      if (onEndReached && !isFetching) {
        const scrollHeight = e.currentTarget.scrollHeight;
        const clientHeight = e.currentTarget.clientHeight;
        const scrollBottom = scrollHeight - scrollTop - clientHeight;

        if (scrollBottom <= endReachedThreshold) {
          setIsFetching(true);
          onEndReached();
          // Reset fetching state after a delay
          setTimeout(() => setIsFetching(false), 1000);
        }
      }
    }, 16), // ~60fps
    [onEndReached, isFetching, endReachedThreshold]
  );

  // Calculate total height and offset
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Spacer div to maintain scroll height */}
      <div style={{ height: totalHeight, position: "relative" }}>
        {/* Visible items with offset */}
        <div
          style={{
            position: "absolute",
            top: offsetY,
            width: "100%",
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="flex-shrink-0"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>

      {/* Loading indicator at the bottom */}
      {isFetching && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}

// Hook for infinite scrolling
export function useInfiniteScroll(
  callback: () => void,
  options: {
    threshold?: number;
    rootMargin?: string;
  } = {}
) {
  const { threshold = 100, rootMargin = "0px" } = options;
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && !isFetching) {
          setIsFetching(true);
          callback();
          // Add a small delay to prevent rapid successive calls
          setTimeout(() => setIsFetching(false), 1000);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    const target = document.createElement("div");
    target.style.height = "1px";
    document.body.appendChild(target);
    observer.observe(target);

    return () => {
      observer.unobserve(target);
      document.body.removeChild(target);
    };
  }, [callback, isFetching, rootMargin, threshold]);

  return { isFetching };
}