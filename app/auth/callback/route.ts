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
    // Simulate a slight delay for API processing
    await new Promise(resolve => setTimeout(resolve, 800));
    
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
    
    // Create HTML response that shows success and auto-redirects
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Authentication Successful</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f9fafb;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 1rem;
          }
          .container {
            max-width: 28rem;
            width: 100%;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            padding: 2rem;
            text-align: center;
          }
          h1 {
            color: rgb(24, 62, 105);
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }
          p {
            color: #6b7280;
            margin-bottom: 2rem;
          }
          .success-icon {
            width: 4rem;
            height: 4rem;
            margin: 0 auto 1.5rem;
            border-radius: 9999px;
            background-color: #d1fae5;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .success-icon svg {
            width: 2.5rem;
            height: 2.5rem;
            color: #059669;
          }
          .redirect-text {
            font-size: 0.875rem;
            color: #9ca3af;
            margin-top: 1.5rem;
          }
          /* BuildTrack Pro brand color for spinner */
          .spinner {
            border: 3px solid rgba(236, 107, 44, 0.3);
            border-radius: 50%;
            border-top: 3px solid rgb(236, 107, 44);
            width: 1.5rem;
            height: 1.5rem;
            animation: spin 1s linear infinite;
            margin: 0 auto;
            display: inline-block;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
        <script>
          // Set cookies with authentication data
          function setCookie(name, value, days) {
            var expires = "";
            if (days) {
              var date = new Date();
              date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
              expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
          }

          // Store auth data and redirect
          window.onload = function() {
            // Store authentication data
            const userData = ${JSON.stringify(userData)};
            const token = "${token}";
            
            // Store in localStorage
            localStorage.setItem('buildtrack_user', JSON.stringify(userData));
            localStorage.setItem('buildtrack_token', token);
            
            // Also set in cookies for middleware
            setCookie('buildtrack_token', token, 30);
            
            // Redirect after a brief delay
            setTimeout(function() {
              window.location.href = "/dashboard";
            }, 1500);
          };
        </script>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1>Authentication Successful</h1>
          <p>You have successfully signed in with ${state === 'google' ? 'Google' : 'Microsoft'}.</p>
          <div class="redirect-text">
            Redirecting to dashboard <span class="spinner"></span>
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`, request.url)
    );
  }
}
