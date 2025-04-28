import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from cookies - middleware needs to use cookies, not localStorage
  const token = request.cookies.get('buildtrack_token')?.value
  
  // Define protected routes (require authentication)
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/projects') || 
    pathname.startsWith('/materials') || 
    pathname.startsWith('/documents') || 
    pathname.startsWith('/settings')
  
  // Define public routes (always accessible)
  const isPublicRoute = 
    pathname === '/' || 
    pathname.startsWith('/features') || 
    pathname.startsWith('/solutions') || 
    pathname.startsWith('/resources') || 
    pathname.startsWith('/about') || 
    pathname.startsWith('/contact') || 
    pathname.startsWith('/terms') || 
    pathname.startsWith('/privacy') || 
    pathname.startsWith('/help') || 
    pathname.includes('/_next') || 
    pathname.includes('/api/') || 
    pathname.includes('.ico') || 
    pathname.includes('.png') || 
    pathname.includes('.jpg') || 
    pathname.includes('.svg')
  
  // If user is attempting to access a protected route without authentication
  if (isProtectedRoute && !token) {
    // Redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url))
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
