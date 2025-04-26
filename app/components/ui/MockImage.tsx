/**
 * MockImage Component
 * 
 * A component for displaying mock images generated with GPT-Image-1
 * Only generates images in development or when explicitly enabled
 */
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { generateMockImage } from '../../utils/mockData/imageGeneration';
import { GenerateMockImageOptions, ImageCategory, ImageVariant } from '../../utils/mockData/imagePrompts/types';

// Helper to get default fallback image for a category
const getCategoryFallback = (category?: ImageCategory): string => {
  if (!category) return '/images/placeholders/default.png';
  const map: Record<ImageCategory, string> = {
    project: '/images/placeholders/project.png',
    material: '/images/placeholders/material.png',
    report: '/images/placeholders/report.png',
    floorplan: '/images/placeholders/floorplan.png',
    document: '/images/placeholders/document.png',
  };
  return map[category];
};

interface MockImageProps extends Omit<React.ComponentProps<typeof Image>, 'src'>, GenerateMockImageOptions {
  className?: string;
  quality?: number;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  showControls?: boolean;
  onRegenerate?: () => void;
}

/**
 * MockImage Component
 * 
 * Use this component to display generated mock images during development
 * In production, it will automatically use fallback images
 */
export function MockImage({
  category,
  variant,
  size = '1024x1024',
  fallbackUrl,
  alt = 'Mock image',
  width,
  height,
  className,
  quality,
  priority = false,
  loading,
  showControls = true,
  onRegenerate,
  ...props
}: MockImageProps) {
  // Use category-specific placeholder or fallbackUrl as initial state
  const defaultFallback = fallbackUrl || getCategoryFallback(category);
  const [imageSrc, setImageSrc] = useState<string>(defaultFallback);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isReused, setIsReused] = useState<boolean>(false);

  // Function to generate or get the mock image
  const loadImage = async (forceRegenerate = false) => {
    try {
      setIsImageLoading(true);
      setError(null);
      setIsRegenerating(forceRegenerate);
      setIsReused(false);
      
      // Attempt to generate a mock image
      console.log(`MockImage: Requesting image for ${category}${variant ? '/' + variant : ''}${forceRegenerate ? ' (forced new)' : ''}`);
      const response = await fetch(`/api/mock-image?category=${category}${variant ? `&variant=${variant}` : ''}&size=${size}${forceRegenerate ? '&forceNew=true' : ''}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }
      
      // Check if image was reused from registry
      setIsReused(!!data.reused);
      
      const imageUrl = data.url;
      console.log(`MockImage: Received URL: ${imageUrl}`);
      
      // Pre-load the image to ensure it's valid
      if (imageUrl.startsWith('https://')) {
        const img = new window.Image();
        img.onload = () => {
          console.log('MockImage: Image loaded successfully');
          setImageSrc(imageUrl);
          setIsImageLoading(false);
          setIsRegenerating(false);
        };
        img.onerror = () => {
          console.warn('MockImage: Failed to load image, using fallback');
          setImageSrc(defaultFallback);
          setIsImageLoading(false);
          setIsRegenerating(false);
          setError('Failed to load generated image');
        };
        img.src = imageUrl;
      } else {
        // Local file path or fallback
        setImageSrc(imageUrl);
        setIsImageLoading(false);
        setIsRegenerating(false);
      }
    } catch (err) {
      console.error('Error loading mock image:', err);
      
      // Fallback to default image
      setImageSrc(defaultFallback);
      setIsImageLoading(false);
      setIsRegenerating(false);
      setError(err instanceof Error ? err.message : 'Unknown error loading image');
    }
  };

  // Handle regeneration
  const handleRegenerate = () => {
    loadImage(true);
    // Call onRegenerate if provided
    if (onRegenerate) {
      onRegenerate();
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadImage();
    return () => {
      isMounted = false;
    };
  }, [category, variant, size, defaultFallback]);

  // Convert width/height to numbers if they're strings
  const imageWidth = typeof width === 'string' ? parseInt(width, 10) : width;
  const imageHeight = typeof height === 'string' ? parseInt(height, 10) : height;

  return (
    <div className={`relative ${className || ''}`}>
      <Image
        src={imageSrc}
        alt={`${category} ${variant || ''} ${alt}`}
        width={imageWidth}
        height={imageHeight}
        quality={quality}
        priority={priority}
        loading={loading as 'eager' | 'lazy'}
        style={{
          opacity: isImageLoading ? 0 : 1,
          transition: 'opacity 300ms'
        }}
        className="rounded-lg"
      />
      
      {/* Image controls - always visible */}
      <div className="absolute inset-x-0 bottom-0 py-3 px-4 flex justify-between items-center bg-black/70 text-white rounded-b-lg border-t-2 border-[rgb(236,107,44)]">
        <div className="flex items-center space-x-2">
          {isReused && (
            <span className="px-3 py-1.5 bg-[rgb(24,62,105)] rounded text-white font-medium text-sm">Saved</span>
          )}
        </div>
        <button 
          onClick={handleRegenerate} 
          disabled={isRegenerating}
          className="px-4 py-1.5 bg-[rgb(236,107,44)] hover:bg-[rgb(216,87,24)] text-white rounded font-medium text-sm shadow-lg transition-all"
        >
          {isRegenerating ? 'Generating...' : 'Regenerate'}
        </button>
      </div>
      
      {/* Loading state */}
      {isImageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse rounded-lg">
          <span className="sr-only">Loading...</span>
        </div>
      )}
      
      {/* Loading overlay for regeneration */}
      {isRegenerating && !isImageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
          <div className="px-3 py-2 bg-white rounded text-gray-800 shadow-lg text-sm flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-[rgb(24,62,105)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating new image...</span>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
          <span className="text-red-500 text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
