import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

/**
 * Redirect handler for the non-internationalized reset-password page
 * Ensures consistent routing by redirecting to the internationalized version
 */
export async function GET(request: NextRequest) {
  // Redirect to the internationalized version with default locale (en)
  return redirect('/en/auth/reset-password');
}
