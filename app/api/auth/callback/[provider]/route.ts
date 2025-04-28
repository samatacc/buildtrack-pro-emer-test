import { NextRequest, NextResponse } from 'next/server';

// This API route handles OAuth provider callbacks
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  // Get the callback URL from the cookie
  const callbackUrl = request.cookies.get('auth_callback_url')?.value || '/dashboard';
  
  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(`Authentication with ${provider} failed: ${error}`)}`, request.url)
    );
  }
  
  // Handle missing authorization code
  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/login?error=No+authorization+code+received', request.url)
    );
  }
  
  try {
    // In a real implementation, we would exchange the code for tokens here
    // For our demo, we'll simulate a successful authentication
    
    // Generate user data based on the provider
    const userData = getMockUserData(provider);
    
    // Generate a JWT token
    const token = `${provider}_mock_jwt_token_${Math.random().toString(36).substring(2)}`;
    
    // Create response with redirects
    const response = NextResponse.redirect(new URL(callbackUrl, request.url));
    
    // Set auth cookies and remove callback URL cookie
    response.cookies.set('buildtrack_token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
    });
    
    // Store user data in a cookie (in a real app, only the user ID would be stored in a cookie)
    response.cookies.set('buildtrack_user', JSON.stringify(userData), {
      httpOnly: false, // Allow JavaScript access for our demo
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
    });
    
    // Remove the callback URL cookie
    response.cookies.delete('auth_callback_url');
    
    return response;
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`, request.url)
    );
  }
}

// Generate mock user data based on OAuth provider
function getMockUserData(provider: string) {
  const commonFields = {
    id: `usr_${Math.random().toString(36).substring(2, 11)}`,
    role: 'project_manager',
    organizationId: 'org_123456789',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  switch (provider.toLowerCase()) {
    case 'google':
      return {
        ...commonFields,
        email: 'user@gmail.com',
        firstName: 'Google',
        lastName: 'User',
        authProvider: 'google',
      };
      
    case 'microsoft':
      return {
        ...commonFields,
        email: 'user@outlook.com',
        firstName: 'Microsoft',
        lastName: 'User',
        authProvider: 'microsoft',
      };
      
    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
}
