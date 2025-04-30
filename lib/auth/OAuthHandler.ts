import { User } from './types';

// Helper function to parse cookies
function parseCookies() {
  if (typeof document === 'undefined') return {}; // Only run in browser
  
  return document.cookie.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=').map(decodeURIComponent);
    return { ...cookies, [name]: value };
  }, {} as Record<string, string>);
}

// Check for OAuth redirect and handle auth state
export async function handleOAuthRedirect(): Promise<User | null> {
  try {
    // Check if we have auth cookies from OAuth redirect
    const cookies = parseCookies();
    const token = cookies.buildtrack_token;
    const userData = cookies.buildtrack_user;
    
    if (token && userData) {
      try {
        // Parse user data from cookie
        const user = JSON.parse(userData) as User;
        
        // Store in localStorage for client-side access
        localStorage.setItem('buildtrack_token', token);
        localStorage.setItem('buildtrack_user', userData);
        
        return user;
      } catch (error) {
        console.error('Failed to parse OAuth user data:', error);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('OAuth redirect handling error:', error);
    return null;
  }
}

// Get current authentication provider display name
export function getAuthProviderDisplayName(provider?: string): string {
  if (!provider) return 'Email';
  
  const providers = {
    'email': 'Email',
    'google': 'Google',
    'microsoft': 'Microsoft Azure',
    'apple': 'Apple'
  };
  
  return providers[provider as keyof typeof providers] || 'Email';
}
