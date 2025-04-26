/**
 * Diagnostic endpoint for OpenAI API issues
 * Tests different aspects of the OpenAI integration
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Gather diagnostic information
  const diagnostics = {
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      apiKeyExists: !!process.env.OPENAI_API_KEY,
      apiKeyFormat: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'none',
      mockImagesEnabled: process.env.NEXT_PUBLIC_ENABLE_MOCK_IMAGES === 'true',
      featureFlagSet: process.env.NEXT_PUBLIC_FEATURE_MOCK_IMAGES === 'true',
    },
    tests: {
      modelsEndpoint: null as any,
      simpleImageGeneration: null as any,
    },
    recommendations: [] as string[]
  };

  // Test 1: Check models endpoint
  try {
    console.log('Testing OpenAI models endpoint...');
    const modelsResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });
    
    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();
      diagnostics.tests.modelsEndpoint = {
        success: true,
        status: modelsResponse.status,
        models: modelsData.data?.slice(0, 3)?.map((model: any) => model.id) || []
      };
    } else {
      const errorText = await modelsResponse.text();
      diagnostics.tests.modelsEndpoint = {
        success: false,
        status: modelsResponse.status,
        error: errorText
      };
      diagnostics.recommendations.push('API key may be invalid or expired. Check your OpenAI account.');
    }
  } catch (error: any) {
    diagnostics.tests.modelsEndpoint = {
      success: false,
      error: error.message
    };
    diagnostics.recommendations.push('Network error connecting to OpenAI API.');
  }

  // Test 2: Check image generation specifically
  try {
    console.log('Testing simple image generation...');
    const simplePrompt = 'A simple construction blueprint, technical diagram';
    
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
    
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      diagnostics.tests.simpleImageGeneration = {
        success: true,
        status: imageResponse.status,
        imageUrl: imageData.data?.[0]?.url?.substring(0, 50) + '...' || 'No URL in response'
      };
    } else {
      let errorInfo;
      try {
        errorInfo = await imageResponse.json();
      } catch (e) {
        errorInfo = await imageResponse.text();
      }
      
      diagnostics.tests.simpleImageGeneration = {
        success: false,
        status: imageResponse.status,
        error: errorInfo
      };
      
      // Add specific recommendations based on error
      if (typeof errorInfo === 'object' && errorInfo.error) {
        if (errorInfo.error.code === 'invalid_api_key') {
          diagnostics.recommendations.push('Your API key appears to be invalid. Use an API key in the format "sk-..."');
        } else if (errorInfo.error.message?.includes('permission')) {
          diagnostics.recommendations.push('Your API key does not have permission to use image generation. Check your OpenAI account settings.');
        } else if (errorInfo.error.message?.includes('content filter')) {
          diagnostics.recommendations.push('The prompt is being blocked by content filtering.');
        } else {
          diagnostics.recommendations.push(`API error: ${errorInfo.error.message}`);
        }
      }
    }
  } catch (error: any) {
    diagnostics.tests.simpleImageGeneration = {
      success: false,
      error: error.message
    };
    diagnostics.recommendations.push('Network error during image generation.');
  }
  
  // If no specific recommendations, add general ones
  if (diagnostics.recommendations.length === 0) {
    if (diagnostics.environment.apiKeyFormat.startsWith('sk-proj-')) {
      diagnostics.recommendations.push('Your API key starts with "sk-proj-", which may indicate it\'s a project key and not a standard OpenAI key. Try using a standard API key starting with "sk-".');
    }
    
    diagnostics.recommendations.push('Ensure DALL-E is enabled on your OpenAI account.');
    diagnostics.recommendations.push('Check your OpenAI account billing status.');
  }

  return NextResponse.json(diagnostics);
}
