import { NextRequest, NextResponse } from 'next/server';

// Handle OAuth provider callbacks
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state') || 'google'; // Default to google if not specified
  const error = searchParams.get('error');
  
  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(`Authentication failed: ${error}`)}`, request.url));
  }
  
  // Handle missing authorization code
  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(new URL('/auth/login?error=No+authorization+code+received', request.url));
  }
  
  try {
    // In a real implementation, we would exchange the code for tokens here
    // For our demo, we'll simulate a successful authentication
    
    // Generate mock user data based on the provider
    const userData = {
      id: `usr_${Math.random().toString(36).substring(2, 11)}`,
      email: state === 'google' ? 'user@gmail.com' : 'user@outlook.com',
      firstName: state === 'google' ? 'Google' : 'Microsoft',
      lastName: 'User',
      role: 'project_manager',
      organizationId: 'org_123456789',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authProvider: state === 'google' ? 'google' : 'microsoft'
    };
    
    // Generate a JWT token
    const token = `${state}_mock_jwt_token_${Math.random().toString(36).substring(2)}`;
    
    // Create response with redirects
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    // Set auth cookies
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
    
    return response;
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`, request.url)
    );
  }
}
