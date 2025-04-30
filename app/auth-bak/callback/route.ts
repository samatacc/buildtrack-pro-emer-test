import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

/**
 * Redirect handler for the non-internationalized OAuth callback
 * Ensures consistent routing by redirecting to the internationalized version
 */
export async function GET(request: NextRequest) {
  // Get the URL and parameters
  const url = new URL(request.url);
  const params = url.searchParams;
  
  // Preserve all query parameters in the redirect
  // This is essential for OAuth callbacks to work properly
  let queryString = '';
  if (params.toString()) {
    queryString = `?${params.toString()}`;
  }
  
  // Redirect to the internationalized version with default locale (en)
  return redirect(`/en/auth/callback${queryString}`);
}
