/**
 * API route for generating mock images with GPT-Image-1
 * Only available in development environment or when explicitly enabled
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPromptForCategory } from '../../utils/mockData/imagePrompts';
import { ImageCategory, ImageVariant } from '../../utils/mockData/imagePrompts/types';

// Environment-specific constants
const IS_DEV = process.env.NODE_ENV === 'development';
const ENABLE_MOCK_IMAGES = process.env.ENABLE_MOCK_IMAGES === 'true';
const DEFAULT_FALLBACK_IMAGE = '/images/placeholders/default.png';

// Define fallback images for each category
const FALLBACK_IMAGES: Record<ImageCategory, string> = {
  project: '/images/placeholders/project.png',
  material: '/images/placeholders/material.png',
  report: '/images/placeholders/report.png',
  floorplan: '/images/placeholders/floorplan.png',
  document: '/images/placeholders/document.png',
};

/**
 * GET handler for mock image generation
 */
export async function GET(request: NextRequest) {
  // Only allow in development or when explicitly enabled
  if (!IS_DEV && !ENABLE_MOCK_IMAGES) {
    return NextResponse.json(
      { error: 'Mock image generation is only available in development environment' },
      { status: 403 }
    );
  }

  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') as ImageCategory;
  const variant = searchParams.get('variant') as ImageVariant | null;
  const size = searchParams.get('size') || '1024x1024';

  // Validate parameters
  if (!category) {
    return NextResponse.json(
      { error: 'Category parameter is required' },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    console.log('Environment variables available:', {
      NODE_ENV: process.env.NODE_ENV,
      ENABLE_MOCK_IMAGES: process.env.ENABLE_MOCK_IMAGES,
      hasApiKey: !!apiKey,
    });
    
    // Check if API key is available
    if (!apiKey) {
      console.warn('No OpenAI API key found in environment variables');
      return NextResponse.json(
        { 
          url: FALLBACK_IMAGES[category] || DEFAULT_FALLBACK_IMAGE,
          success: false,
          error: 'API key not configured'
        },
        { status: 200 } // Still return 200 to allow the app to function
      );
    }
    
    console.log('Generating image for:', { category, variant, size });

    // Get the prompt for the specified category and variant
    const prompt = getPromptForCategory(category, variant || undefined);

    // Call OpenAI API for image generation
    console.log('Making request to OpenAI API with prompt:', prompt);
    
    // Call OpenAI API for image generation
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: size === '1024x1024' || size === '1024x1792' || size === '1792x1024' ? size : '1024x1024',
        quality: 'standard',
        style: 'natural',  // Adding style parameter for DALL-E 3
        response_format: 'url'
      })
    });

    console.log('OpenAI API response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Failed to generate image';
      try {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // If we can't parse JSON, try to get text
        const errorText = await response.text().catch(() => 'Could not read error response');
        console.error('OpenAI API error (text):', errorText);
        errorMessage = `Request failed with status ${response.status}: ${errorText}`;
      }
      
      console.error('Detailed error info:', { 
        status: response.status, 
        statusText: response.statusText,
        errorMessage
      });
      
      return NextResponse.json(
        { 
          url: FALLBACK_IMAGES[category] || DEFAULT_FALLBACK_IMAGE,
          success: false,
          error: errorMessage
        },
        { status: 200 } // Still return 200 to allow the app to function
      );
    }
    
    // For debugging, log the raw response text first
    const responseClone = response.clone();
    const responseText = await responseClone.text();
    console.log('OpenAI API response text:', responseText);
    
    // Now parse the JSON
    const data = await response.json().catch(error => {
      console.error('Error parsing OpenAI API response:', error);
      throw new Error('Invalid response format from OpenAI API');
    });
    
    const imageUrl = data.data?.[0]?.url;
    
    if (!imageUrl) {
      console.error('No image URL in response:', data);
      return NextResponse.json(
        { 
          url: FALLBACK_IMAGES[category] || DEFAULT_FALLBACK_IMAGE,
          success: false,
          error: 'No image URL in response'
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      url: imageUrl,
      success: true
    });
  } catch (error) {
    console.error('Error generating mock image:', error);
    
    return NextResponse.json(
      { 
        url: FALLBACK_IMAGES[category] || DEFAULT_FALLBACK_IMAGE,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 200 } // Still return 200 to allow the app to function
    );
  }
}
