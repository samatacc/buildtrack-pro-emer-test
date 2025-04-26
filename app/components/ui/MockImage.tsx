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
  ...props
}: MockImageProps) {
  // Use category-specific placeholder or fallbackUrl as initial state
  const defaultFallback = fallbackUrl || getCategoryFallback(category);
  const [imageSrc, setImageSrc] = useState<string>(defaultFallback);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Function to generate or get the mock image
    const loadImage = async () => {
      try {
        setIsImageLoading(true);
        setError(null);
        
        // Attempt to generate a mock image
        console.log(`MockImage: Requesting image for ${category}${variant ? '/' + variant : ''}`);
        const imageUrl = await generateMockImage({
          category,
          variant,
          size,
          fallbackUrl: defaultFallback
        });
        
        console.log(`MockImage: Received URL: ${imageUrl.substring(0, 20)}...`);
        
        // Pre-load the image to ensure it's valid
        if (imageUrl.startsWith('https://')) {
          const img = new window.Image();
          img.onload = () => {
            if (isMounted) {
              console.log('MockImage: Image loaded successfully');
              setImageSrc(imageUrl);
              setIsImageLoading(false);
            }
          };
          img.onerror = () => {
            if (isMounted) {
              console.warn('MockImage: Failed to load image, using fallback');
              setImageSrc(defaultFallback);
              setIsImageLoading(false);
              setError('Failed to load generated image');
            }
          };
          img.src = imageUrl;
        } else {
          // If we didn't get a https URL, use the fallback
          if (isMounted) {
            console.log('MockImage: Using fallback (non-HTTPS URL)');
            setImageSrc(imageUrl); // This would be the fallback URL from generateMockImage
            setIsImageLoading(false);
          }
        }
      } catch (err) {
        console.error('Error loading mock image:', err);
        
        if (isMounted) {
          // Fallback to default image
          setImageSrc(defaultFallback);
          setIsImageLoading(false);
          setError(err instanceof Error ? err.message : 'Unknown error loading image');
        }
      }
    };

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
      />
      
      {isImageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <span className="sr-only">Loading...</span>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <span className="text-red-500 text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
