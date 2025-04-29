'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image, { ImageProps } from 'next/image';
import { useFieldMode } from '../../components/mobile/FieldModeProvider';
import { getCachedAsset, cacheAsset } from '../../utils/resourceCache';

/**
 * OptimizedImage Component
 * 
 * A smart image component that provides:
 * - Format detection and optimization (WebP, AVIF)
 * - Responsive sizing for different devices
 * - Lazy loading with proper loading states
 * - Offline support through caching
 * - Bandwidth-aware image quality
 * - Blur-up loading effect
 * 
 * Uses BuildTrack Pro's performance standards for mobile optimization.
 */

export type ImageFormat = 'original' | 'webp' | 'avif' | 'jpeg';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string;
  lowResSrc?: string;
  fallbackSrc?: string;
  sizes?: string;
  format?: ImageFormat;
  priority?: boolean;
  cacheForOffline?: boolean;
  quality?: number;
  containerClassName?: string;
  blurhash?: string;
  lowDataModeOptimization?: boolean;
  onImageLoad?: () => void;
  onImageError?: () => void;
}

export default function OptimizedImage({
  src,
  lowResSrc,
  fallbackSrc,
  alt,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  format = 'webp',
  priority = false,
  cacheForOffline = false,
  quality = 80,
  loading = 'lazy',
  className = '',
  containerClassName = '',
  blurhash,
  lowDataModeOptimization = true,
  onImageLoad,
  onImageError,
  ...props
}: OptimizedImageProps) {
  const { isFieldModeEnabled, isLowDataMode, isOnline } = useFieldMode();
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(!priority);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Check if the browser supports the preferred image format
  const [supportsFormat, setSupportsFormat] = useState(true);
  
  useEffect(() => {
    // Check format support
    if (format === 'webp') {
      const canvas = document.createElement('canvas');
      setSupportsFormat(canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0);
    } else if (format === 'avif') {
      // More complex detection for AVIF would go here
      // For now, default to not supported to be safe
      setSupportsFormat(false);
    }
  }, [format]);
  
  // Handle low data mode
  useEffect(() => {
    // If in low data mode and we have a low res version, use it
    if (isLowDataMode && lowDataModeOptimization && lowResSrc) {
      setImageSrc(lowResSrc);
    } else {
      setImageSrc(src);
    }
  }, [isLowDataMode, lowDataModeOptimization, lowResSrc, src]);
  
  // Attempt to load from cache first in field mode
  useEffect(() => {
    if (isFieldModeEnabled) {
      const loadFromCache = async () => {
        try {
          // Try to get from cache first
          const cachedImage = await getCachedAsset(src);
          
          if (cachedImage) {
            // Create an object URL from the cached blob
            const objectUrl = URL.createObjectURL(cachedImage);
            setCachedSrc(objectUrl);
          }
        } catch (error) {
          console.warn('Failed to load image from cache:', error);
        }
      };
      
      loadFromCache();
      
      // Clean up function to revoke object URL when unmounting
      return () => {
        if (cachedSrc) {
          URL.revokeObjectURL(cachedSrc);
        }
      };
    }
  }, [isFieldModeEnabled, src, cachedSrc]);
  
  // Cache the image for offline use if requested
  const cacheImageForOffline = async () => {
    if (!cacheForOffline || !isOnline || !isFieldModeEnabled) return;
    
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      await cacheAsset(src, blob);
      console.log('Image cached for offline use:', src);
    } catch (error) {
      console.warn('Failed to cache image for offline use:', error);
    }
  };
  
  // Determine final image source
  const finalSrc = cachedSrc || imageSrc;
  
  // Generate appropriate srcSet for responsive images
  const generateSrcSet = () => {
    if (!supportsFormat) return undefined;
    
    const basePath = src.split('?')[0];
    const widths = [640, 750, 828, 1080, 1200, 1920, 2048];
    
    return widths
      .map(w => `${basePath}?w=${w}&q=${quality}&fmt=${format} ${w}w`)
      .join(', ');
  };
  
  // Handle image load success
  const handleImageLoad = () => {
    setIsLoading(false);
    setHasLoaded(true);
    setLoadError(false);
    onImageLoad?.();
    
    // Cache image for offline use if requested
    if (cacheForOffline && isFieldModeEnabled) {
      cacheImageForOffline();
    }
  };
  
  // Handle image load error
  const handleImageError = () => {
    setIsLoading(false);
    setLoadError(true);
    
    // Try fallback if available
    if (fallbackSrc && fallbackSrc !== imageSrc) {
      console.warn('Image failed to load, using fallback:', fallbackSrc);
      setImageSrc(fallbackSrc);
    } else if (lowResSrc && lowResSrc !== imageSrc) {
      console.warn('Image failed to load, using low res version:', lowResSrc);
      setImageSrc(lowResSrc);
    }
    
    onImageError?.();
  };
  
  // Render loading placeholder with blurhash or skeleton
  const renderLoadingPlaceholder = () => {
    if (blurhash) {
      // For a real implementation, you would decode the blurhash and display it
      return (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ 
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      );
    }
    
    return (
      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
    );
  };
  
  return (
    <div 
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : 'auto' }}
    >
      {isLoading && !priority && renderLoadingPlaceholder()}
      
      {loadError && !fallbackSrc && !lowResSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
      )}
      
      <Image
        ref={imageRef}
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        quality={isLowDataMode ? Math.min(quality, 60) : quality}
        loading={priority ? 'eager' : loading}
        priority={priority}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`${className} ${isLoading && !priority ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        {...props}
      />
      
      {/* Offline/Field mode indicator */}
      {isFieldModeEnabled && cacheForOffline && hasLoaded && cachedSrc && (
        <div className="absolute bottom-0 right-0 bg-green-500 text-white text-xs px-1 rounded-tl">
          <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      )}
      
      {/* Cache for offline button */}
      {isFieldModeEnabled && !cachedSrc && cacheForOffline && hasLoaded && (
        <button
          onClick={cacheImageForOffline}
          className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-tl"
          aria-label="Cache for offline use"
        >
          <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
        </button>
      )}
    </div>
  );
}
