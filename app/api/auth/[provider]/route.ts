import { NextRequest, NextResponse } from 'next/server';

// This API route handles the initiation of OAuth flows
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;
  const searchParams = request.nextUrl.searchParams;
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  // Store the callback URL in a cookie so we can redirect after auth
  const response = NextResponse.redirect(getAuthorizationUrl(provider));
  response.cookies.set('auth_callback_url', callbackUrl, {
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    path: '/',
    sameSite: 'lax',
  });
  
  return response;
}

// Generate the OAuth authorization URL based on provider
function getAuthorizationUrl(provider: string): URL {
  switch (provider.toLowerCase()) {
    case 'google':
      return new URL(
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent('653127657176-un8iitv8brlhu4hkpghn2srl5utinm8l.apps.googleusercontent.com')}` +
        `&redirect_uri=${encodeURIComponent('http://localhost:3000/auth/callback')}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('openid email profile')}` +
        `&prompt=select_account` +
        `&state=google` // Adding state parameter to identify provider during callback
      );
      
    case 'microsoft':
      return new URL(
        `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${process.env.MICROSOFT_CLIENT_ID || 'demo_client_id'}` +
        `&redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URI || 'http://localhost:3003/api/auth/callback/microsoft')}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('openid email profile User.Read')}`
      );
      
    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
}
