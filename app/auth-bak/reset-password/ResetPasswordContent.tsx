'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  
  useEffect(() => {
    // Get token from URL parameters
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError('Invalid or missing reset token. Please request a new password reset link.')
    }
  }, [searchParams])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate password
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Here we would send the new password and token to your API
      // For now we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsSuccess(true)
      
      // Redirect to login after success
      setTimeout(() => {
        router.push('/auth/login?reset=success')
      }, 2000)
    } catch (err) {
      console.error('Error resetting password:', err)
      setError('An error occurred while resetting your password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[rgb(24,62,105)]">Reset Your Password</h1>
          <p className="mt-2 text-gray-600">Enter your new password below</p>
        </div>
        
        {!isSuccess ? (
          <div className="rounded-lg bg-white p-8 shadow-lg">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[rgb(24,62,105)] focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] focus:ring-opacity-20"
                  placeholder="Enter your new password"
                  disabled={isLoading || isSuccess}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[rgb(24,62,105)] focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] focus:ring-opacity-20"
                  placeholder="Confirm your new password"
                  disabled={isLoading || isSuccess}
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-[rgb(24,62,105)] px-4 py-2 text-white transition hover:bg-[rgb(24,62,125)] focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading || isSuccess || !token}
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-800">Password Reset Successful</h2>
              <p className="text-gray-600">Your password has been updated. You'll be redirected to the login page.</p>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Link 
            href="/auth/login"
            className="text-sm font-medium text-[rgb(24,62,105)] hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
