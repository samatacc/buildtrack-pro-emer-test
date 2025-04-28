'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { User } from '../../../lib/auth/types'
import { useAuth } from '../../../lib/auth/AuthContext'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const { login } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get auth code and provider from URL
        const code = searchParams.get('code')
        const state = searchParams.get('state') || 'google' // Default to google if not specified
        const error = searchParams.get('error')

        if (error) {
          console.error('OAuth error:', error)
          setStatus('error')
          setTimeout(() => router.push('/auth/login'), 1500)
          return
        }

        if (!code) {
          console.error('No authorization code received')
          setStatus('error')
          setTimeout(() => router.push('/auth/login'), 1500)
          return
        }

        // Create user data based on provider
        const userData: User = {
          id: `usr_${Math.random().toString(36).substring(2, 11)}`,
          email: state === 'google' ? 'user@gmail.com' : 'user@outlook.com',
          firstName: state === 'google' ? 'Google' : 'Microsoft',
          lastName: 'User',
          role: 'project_manager',
          organizationId: 'org_123456789',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          authProvider: (state === 'google' ? 'google' : 'microsoft') as 'google' | 'microsoft'
        }

        // Generate token
        const token = `${state}_token_${Math.random().toString(36).substring(2)}`

        // Store auth data
        localStorage.setItem('buildtrack_user', JSON.stringify(userData))
        localStorage.setItem('buildtrack_token', token)

        // Also set cookies for middleware
        document.cookie = `buildtrack_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`

        setStatus('success')
        
        // Redirect to dashboard
        setTimeout(() => router.push('/dashboard'), 1000)
      } catch (error) {
        console.error('Error handling OAuth callback:', error)
        setStatus('error')
        setTimeout(() => router.push('/auth/login'), 1500)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-[rgb(24,62,105)]">
            {status === 'loading' && 'Signing in...'}
            {status === 'success' && 'Sign in successful!'}
            {status === 'error' && 'Sign in failed'}
          </h2>
          
          <div className="mt-8 flex justify-center">
            {status === 'loading' && (
              <div className="w-12 h-12 border-4 border-t-[rgb(236,107,44)] border-[rgb(24,62,105)] rounded-full animate-spin"></div>
            )}
            
            {status === 'success' && (
              <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            
            {status === 'error' && (
              <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          
          <p className="mt-4 text-sm text-gray-600">
            {status === 'loading' && 'Please wait while we complete your authentication...'}
            {status === 'success' && 'Redirecting you to the dashboard...'}
            {status === 'error' && 'Something went wrong. Redirecting you back to login...'}
          </p>
        </div>
      </div>
    </div>
  )
}
