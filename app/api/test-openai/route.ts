/**
 * Simple test endpoint for OpenAI API connectivity
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const testType = request.nextUrl.searchParams.get('test') || 'models';

  // Log all environment variables for debugging
  console.log('---- ENVIRONMENT VARIABLES ----');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
  console.log('OPENAI_API_KEY first 4 chars:', process.env.OPENAI_API_KEY?.substring(0, 4) || 'none');
  
  // Check if API key is available
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'API key not configured' },
      { status: 500 }
    );
  }
  
  try {
    // Based on test type, make the appropriate request
    if (testType === 'image') {
      // Test simple image generation with DALL-E 3
      console.log('Testing DALL-E 3 image generation...');
      
      const simplePrompt = 'A simple blue construction logo on a white background';
      
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: simplePrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'natural',
          response_format: 'url'
        })
      });
      
      console.log('DALL-E 3 API status code:', imageResponse.status);
      
      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error('DALL-E 3 API error:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          return NextResponse.json(
            { success: false, error: errorJson },
            { status: imageResponse.status }
          );
        } catch (e) {
          return NextResponse.json(
            { success: false, error: errorText },
            { status: imageResponse.status }
          );
        }
      }
      
      const imageData = await imageResponse.json();
      return NextResponse.json({
        success: true,
        image: imageData
      });
    } else {
      // Default: Test models endpoint
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });
      
      console.log('OpenAI API status code:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          return NextResponse.json(
            { success: false, error: errorJson },
            { status: response.status }
          );
        } catch (e) {
          return NextResponse.json(
            { success: false, error: errorText },
            { status: response.status }
          );
        }
      }
      
      const data = await response.json();
      
      // Return just the first few models to avoid a huge response
      return NextResponse.json({
        success: true,
        models: data.data?.slice(0, 5)?.map((model: any) => model.id) || []
      });
    }
  } catch (error: any) {
    console.error('Error testing OpenAI API:', error);
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
