"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  quality?: number;
}

export default function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = "",
  priority = false,
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 75,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!priority) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: "50px",
          threshold: 0.1,
        }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => {
        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
      };
    } else {
      setIsInView(true);
    }
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate placeholder blur data if not provided
  const generateBlurDataURL = () => {
    if (blurDataURL) return blurDataURL;
    
    // Simple blur data generation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    
    canvas.width = width;
    canvas.height = height;
    
    // Create a simple gradient placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f0f0f0');
    gradient.addColorStop(1, '#e0e0e0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL('image/jpeg', 0.1);
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <Skeleton 
          className="absolute inset-0 w-full h-full" 
          style={{ width, height }}
        />
      )}
      
      {/* Actual image */}
      {isInView && !hasError && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          priority={priority}
          placeholder={placeholder === "blur" ? "blur" : undefined}
          blurDataURL={placeholder === "blur" ? generateBlurDataURL() : undefined}
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes}
          quality={quality}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
          }}
        />
      )}
      
      {/* Error state */}
      {hasError && (
        <div 
          className="flex items-center justify-center bg-muted text-muted-foreground"
          style={{ width, height }}
        >
          <div className="text-center p-4">
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}
      
      {/* Loading overlay */}
      {!isLoaded && isInView && !hasError && (
        <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}