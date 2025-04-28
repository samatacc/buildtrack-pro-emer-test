/**
 * Client-side utility for generating mock images with GPT-Image-1
 * Only available in development environment or when explicitly enabled
 */
import { cache } from '../cache';
import { GenerateMockImageOptions, ImageGenerationResponse } from './imagePrompts/types';

// Environment-specific constants
const IS_DEV = process.env.NODE_ENV === 'development';
const ENABLE_MOCK_IMAGES = process.env.NEXT_PUBLIC_ENABLE_MOCK_IMAGES === 'true';

// Define fallback images for each category
const FALLBACK_IMAGES: Record<string, string> = {
  project: '/images/placeholders/project.png',
  material: '/images/placeholders/material.png',
  report: '/images/placeholders/report.png',
  floorplan: '/images/placeholders/floorplan.png',
  document: '/images/placeholders/document.png',
  default: '/images/placeholders/default.png'
};

/**
 * Generate a mock image for BuildTrack Pro development
 * Images are generated using OpenAI's GPT-Image-1 model
 * 
 * @param options - Configuration options for image generation
 * @returns Promise resolving to an image URL (generated or fallback)
 */
export async function generateMockImage({
  category,
  variant,
  size = '1024x1024',
  fallbackUrl,
  forceNew = false
}: GenerateMockImageOptions): Promise<string> {
  // Determine the appropriate fallback URL
  const defaultFallback = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
  const finalFallbackUrl = fallbackUrl || defaultFallback;
  
  // Only generate in development or when explicitly enabled
  if (!IS_DEV && !ENABLE_MOCK_IMAGES) {
    return finalFallbackUrl;
  }

  // Create a cache key based on the parameters
  const cacheKey = `mock-image-${category}-${variant || 'default'}-${size}`;
  
  // Check if we have a cached image
  const cachedImage = cache.get<string>(cacheKey);
  if (cachedImage) {
    return cachedImage;
  }

  try {
    // Build query parameters
    const params = new URLSearchParams({
      category,
      ...(variant && { variant }),
      size,
      ...(forceNew && { forceNew: 'true' })
    });

    console.log(`Attempting to generate mock image: category=${category}, variant=${variant || 'default'}, size=${size}`);
    
    // Call the internal API endpoint
    const response = await fetch(`/api/mock-image?${params.toString()}`);
    
    // Log detailed response information for debugging
    console.log(`Mock image API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed with status ${response.status}:`, errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json() as ImageGenerationResponse;
    
    if (!data.success) {
      console.warn('Mock image generation failed:', data.error);
      return finalFallbackUrl;
    }
    
    // The URL could be either a local path (saved image) or an external URL
    const imageUrl = data.url;
    console.log('Successfully generated/retrieved mock image:', imageUrl.substring(0, 50) + '...');
    
    // Store additional information if available (like the original OpenAI URL)
    if (data.originalUrl) {
      console.log('Original OpenAI URL:', data.originalUrl.substring(0, 50) + '...');
    }
    
    // Cache the successful result for 24 hours
    // This prevents unnecessary API calls and costs
    cache.set(cacheKey, imageUrl, 60 * 60 * 24);
    
    return imageUrl;
  } catch (error) {
    console.error('Error generating mock image:', error);
    return finalFallbackUrl;
  }
}

/**
 * Pregenerate mock images for multiple categories/variants
 * Useful for ensuring images are ready when needed in the UI
 * 
 * @param requests - Array of image generation options
 * @returns Promise that resolves when all images have been generated
 */
export async function pregenerateImages(
  requests: GenerateMockImageOptions[]
): Promise<void> {
  if (!IS_DEV && !ENABLE_MOCK_IMAGES) {
    return;
  }
  
  try {
    // Generate all images in parallel
    await Promise.all(
      requests.map(request => generateMockImage(request))
    );
    
    console.log(`Successfully pregenerated ${requests.length} mock images`);
  } catch (error) {
    console.error('Error pregenerating mock images:', error);
  }
}
