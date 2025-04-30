'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../../lib/auth/AuthContext'
import '../auth-styles.css'

export default function LoginPage() {
  const { login, loginWithGoogle, loginWithMicrosoft, loginWithApple, isLoading, error, clearErrors } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  
  // Clear any auth errors when component mounts
  useEffect(() => {
    clearErrors()
  }, [clearErrors])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!email || !password) {
      return // Form validation is handled by HTML5 required attributes
    }
    
    // Call login function from auth context
    await login({
      email,
      password,
      rememberMe
    })
  }

  return (
    <div className="auth-container">
      
      <div className="auth-form-container">
        <div className="auth-heading">Sign in to your account</div>
        <div className="auth-subheading">
        Don't have an account?{' '}
        <Link href="/auth/register" className="link">
          Start your 14-day free trial
        </Link>
      </div>
        
        <div className="auth-card">
          {error && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '0.75rem', 
              backgroundColor: '#fee2e2', 
              color: '#b91c1c', 
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}>
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <div className="checkbox-container">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox"
                />
                <label htmlFor="remember-me" className="checkbox-label">
                  Remember me
                </label>
              </div>

              <div>
                <Link href="/auth/forgot-password" className="link">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`btn btn-primary ${isLoading ? 'btn-disabled' : ''}`}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="social-login-divider">
            <span className="social-login-divider-text">Or continue with</span>
          </div>

          <div className="social-buttons-container">
            <a 
              href="/api/auth/google?callbackUrl=/dashboard" 
              className="social-button"
              role="button"
              aria-disabled={isLoading}
              onClick={(e) => {
                if (isLoading) {
                  e.preventDefault();
                  return;
                }
              }}
            >
              <span className="sr-only">Sign in with Google</span>
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </a>

            <a 
              href="/api/auth/microsoft?callbackUrl=/dashboard" 
              className="social-button"
              role="button"
              aria-disabled={isLoading}
              onClick={(e) => {
                if (isLoading) {
                  e.preventDefault();
                  return;
                }
              }}
            >
              <span className="sr-only">Sign in with Microsoft</span>
              <svg width="20" height="20" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
            </a>

            <a 
              href="#" 
              className="social-button relative"
              role="button"
              aria-disabled={true}
              onClick={(e) => {
                e.preventDefault();
                alert('Apple Sign In is coming soon!');
              }}
              title="Coming Soon!"
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[rgb(24,62,105)] text-white text-xs py-1 px-2 rounded opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                Coming Soon
              </div>
              <span className="sr-only">Sign in with Apple</span>
              <svg width="20" height="20" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
            </a>
          </div>
          
          <div className="create-account-button">
            <Link href="/auth/register" className="w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[rgb(24,62,105)] hover:bg-[rgb(19,49,84)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(24,62,105)]">
              Create an account with email
            </Link>
          </div>
        </div>
      </div>
      
      <div className="auth-footer">
        <p>
          By using BuildTrack Pro, you agree to our{' '}
          <Link href="/terms" className="link">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="link">
            Privacy Policy
          </Link>
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          © {new Date().getFullYear()} BuildTrack Pro. All rights reserved.
        </p>
      </div>
    </div>
  )
}
