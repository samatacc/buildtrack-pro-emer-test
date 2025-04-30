'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { User } from '../../../lib/auth/types'
import { useAuth } from '../../../lib/auth/AuthContext'

export default function AuthCallbackContent() {
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

        // Login the user
        await login(userData, token)
        
        // Update status
        setStatus('success')
        
        // Redirect to dashboard after a short delay
        setTimeout(() => router.push('/dashboard'), 1500)
      } catch (err) {
        console.error('Error during OAuth callback:', err)
        setStatus('error')
        setTimeout(() => router.push('/auth/login'), 1500)
      }
    }

    handleCallback()
  }, [searchParams, router, login])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        {status === 'loading' && (
          <>
            <h2 className="mb-4 text-xl font-bold text-[rgb(24,62,105)]">Processing Login</h2>
            <p className="mb-4 text-gray-600">Please wait while we complete your authentication...</p>
            <div className="mx-auto h-4 w-32 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full animate-pulse rounded-full bg-[rgb(236,107,44)]"></div>
            </div>
          </>
        )}
        
        {status === 'success' && (
          <>
            <h2 className="mb-4 text-xl font-bold text-[rgb(24,62,105)]">Login Successful!</h2>
            <p className="mb-4 text-gray-600">You're being redirected to your dashboard...</p>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </>
        )}
        
        {status === 'error' && (
          <>
            <h2 className="mb-4 text-xl font-bold text-[rgb(24,62,105)]">Authentication Error</h2>
            <p className="mb-4 text-gray-600">We couldn't complete your login. Redirecting you back to the login page...</p>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
