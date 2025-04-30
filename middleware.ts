import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales, defaultLocale } from './i18n'

/**
 * BuildTrack Pro Middleware
 * 
 * Handles internationalization and authentication routing
 * This simplified version focuses on reliable locale handling first
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const url = request.nextUrl.clone()
  
  // Get token from cookies - middleware needs to use cookies, not localStorage
  const token = request.cookies.get('buildtrack_token')?.value
  
  // STEP 1: Handle internationalization routing
  
  // Skip internationalization handling for static assets and API routes
  if (
    pathname.includes('/_next') || 
    pathname.includes('/api/') || 
    pathname.match(/\.(ico|png|jpg|svg|css|js)$/)
  ) {
    return NextResponse.next()
  }
  
  // Check if the pathname starts with a locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  // If no locale in URL, redirect to default locale version
  if (!pathnameHasLocale && !pathname.startsWith('/_next')) {
    // For dashboard test page - make it accessible directly for debugging
    if (pathname === '/i18n-test') {
      return NextResponse.next()
    }
    
    // For root path, append the locale
    if (pathname === '/') {
      url.pathname = `/${defaultLocale}`
      return NextResponse.redirect(url)
    }
    
    // For all other paths, insert the locale prefix
    url.pathname = `/${defaultLocale}${pathname}`
    return NextResponse.redirect(url)
  }
  
  // STEP 2: Handle authentication requirements
  
  // Extract locale and main path for processing
  let locale = defaultLocale
  let mainPath = pathname
  
  if (pathnameHasLocale) {
    // Extract locale from URL
    const segments = pathname.split('/')
    locale = segments[1]
    // Get path without locale prefix
    mainPath = '/' + segments.slice(2).join('/')
  }
  
  // Define protected routes (require authentication)
  const protectedPaths = [
    '/dashboard',
    '/projects',
    '/materials',
    '/documents',
    '/settings'
  ]
  
  const isProtectedRoute = protectedPaths.some(path => mainPath.startsWith(path))
  
  // If user is attempting to access a protected route without authentication
  if (isProtectedRoute && !token) {
    // Redirect to login, maintaining the current locale
    url.pathname = `/${locale}/auth/login`
    return NextResponse.redirect(url)
  }
  
  // Continue for all other routes
  return NextResponse.next()
}

// Define which paths should be processed by this middleware
export const config = {
  matcher: [
    // Match protected routes
    '/dashboard/:path*',
    '/projects/:path*',
    '/materials/:path*',
    '/documents/:path*',
    '/settings/:path*',
  ],
}
