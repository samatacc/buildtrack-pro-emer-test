import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  // Redirect to the internationalized version of the reports page using the default locale
  return redirect('/en/dashboard/reports');
}
