'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { handleOAuthRedirect } from './OAuthHandler'
import { 
  User, 
  AuthState, 
  LoginFormData, 
  RegisterFormData,
  OnboardingData
} from './types'

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: false,  // Start with false to prevent immediate loading state
  isAuthenticated: false,
  error: null
}

// Create context
interface AuthContextType extends AuthState {
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (token: string, newPassword: string) => Promise<void>;
  clearErrors: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  loginWithApple: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to set cookies to work with middleware
const setCookie = (name: string, value: string, days: number = 30) => {
  if (typeof document === 'undefined') return; // Only run in browser
  
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + value + expires + "; path=/; sameSite=lax";
}

// Helper function to delete cookies
const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return; // Only run in browser
  document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; sameSite=lax";
}

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState)
  const router = useRouter()
  
  // Initialize auth state from storage on page load
  useEffect(() => {
    // Skip during server side rendering
    if (typeof window === 'undefined') return;
    
    const loadAuthState = async () => {
      setState(prev => ({ ...prev, isLoading: true }))
      
      try {
        // Check for OAuth redirect first (cookies from API route)
        const oauthUser = await handleOAuthRedirect()
        
        if (oauthUser) {
          // User was redirected from OAuth
          setState({
            user: oauthUser,
            isLoading: false,
            isAuthenticated: true,
            error: null
          })
          
          // Navigate to dashboard after OAuth login
          setTimeout(() => {
            router.push('/dashboard')
          }, 100)
          
          return
        }
        
        // Otherwise check localStorage
        const storedUser = localStorage.getItem('buildtrack_user')
        const token = localStorage.getItem('buildtrack_token')
        
        if (storedUser && token) {
          const user = JSON.parse(storedUser) as User
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
            error: null
          })
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false
          }))
        }
      } catch (error) {
        console.error('Failed to load auth state:', error)
        setState(prev => ({
          ...prev,
          isLoading: false
        }))
      }
    }
    
    loadAuthState()
  }, [router])
  
  // Login handler
  const login = useCallback(async (data: LoginFormData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // For demo, accept any email with valid format
      if (data.email.includes('@') && data.password.length >= 3) {
        await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
        
        const mockUser: User = {
          id: 'usr_' + Math.random().toString(36).substring(2, 11),
          email: data.email,
          firstName: data.email.split('@')[0], // Extract name from email
          lastName: 'User',
          role: 'project_manager',
          organizationId: 'org_123456789',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          authProvider: 'email'
        }
        
        // Generate a simple token for the demo
        const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2)
        
        // Store in localStorage
        localStorage.setItem('buildtrack_user', JSON.stringify(mockUser))
        localStorage.setItem('buildtrack_token', token)
        
        // Also store in cookie for middleware
        setCookie('buildtrack_token', token)
        
        // Update auth state
        setState({
          user: mockUser,
          isLoading: false,
          isAuthenticated: true,
          error: null
        })
        
        // Navigate to dashboard after successful login
        setTimeout(() => {
          router.push('/dashboard')
        }, 100)
        
        return
      }
      
      throw new Error('Invalid email or password')
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }))
    }
  }, [router])
  
  // Logout handler
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
      
      // Clear storage
      localStorage.removeItem('buildtrack_user')
      localStorage.removeItem('buildtrack_token')
      
      // Clear cookies
      deleteCookie('buildtrack_token')
      deleteCookie('redirect_count')
      
      // Reset state
      setState({
        ...initialState,
        isLoading: false
      })
      
      // Navigate back to login page
      router.push('/auth/login')
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      }))
    }
  }, [router])
  
  // Register handler
  const register = useCallback(async (data: RegisterFormData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
      
      // Create a mock user record
      const mockUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 11),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'project_manager',
        organizationId: 'org_' + Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Store temp user data for onboarding
      localStorage.setItem('buildtrack_temp_user', JSON.stringify(mockUser))
      
      setState(prev => ({ ...prev, isLoading: false }))
      
      // Navigate to onboarding
      router.push('/auth/onboarding')
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      }))
    }
  }, [router])
  
  // Complete onboarding handler
  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
      
      // Get the temporary user data
      const tempUserJson = localStorage.getItem('buildtrack_temp_user')
      if (!tempUserJson) throw new Error('Registration session expired')
      
      const tempUser = JSON.parse(tempUserJson) as User
      
      // Generate token
      const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2, 11)
      
      // Setup permanent user
      localStorage.removeItem('buildtrack_temp_user')
      localStorage.setItem('buildtrack_user', JSON.stringify(tempUser))
      localStorage.setItem('buildtrack_token', token)
      
      // Also set token in cookie
      setCookie('buildtrack_token', token)
      
      setState({
        user: tempUser,
        isLoading: false,
        isAuthenticated: true,
        error: null
      })
      
      // Navigate to dashboard
      router.push('/dashboard')
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Onboarding failed'
      }))
      
      // Redirect back to registration on error
      setTimeout(() => router.push('/auth/register'), 2000)
    }
  }, [router])
  
  // Password reset request handler
  const resetPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
      
      // In a real app, this would send a reset email
      setState(prev => ({ ...prev, isLoading: false }))
      return Promise.resolve()
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset failed'
      }))
      return Promise.reject(error)
    }
  }, [])
  
  // Password update handler
  const updatePassword = useCallback(async (token: string, newPassword: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
      
      // In a real app, this would validate the token and update password
      setState(prev => ({ ...prev, isLoading: false }))
      return Promise.resolve()
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password update failed'
      }))
      return Promise.reject(error)
    }
  }, [])
  
  // Clear errors helper
  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])
  
  // OAuth handlers
  const loginWithGoogle = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // In a real implementation, this would redirect to Google OAuth
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
      
      const mockUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 11),
        email: 'user@gmail.com',
        firstName: 'Google',
        lastName: 'User',
        role: 'project_manager',
        organizationId: 'org_123456789',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authProvider: 'google'
      }
      
      // Generate a simple token for the demo
      const token = 'google_mock_jwt_token_' + Math.random().toString(36).substring(2)
      
      // Store in localStorage
      localStorage.setItem('buildtrack_user', JSON.stringify(mockUser))
      localStorage.setItem('buildtrack_token', token)
      
      // Also store in cookie for middleware
      setCookie('buildtrack_token', token)
      
      // Update auth state
      setState({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        error: null
      })
      
      // Navigate to dashboard after successful login
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Google login failed'
      }))
    }
  }, [router])
  
  const loginWithMicrosoft = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // In a real implementation, this would redirect to Microsoft OAuth
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
      
      const mockUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 11),
        email: 'user@outlook.com',
        firstName: 'Microsoft',
        lastName: 'User',
        role: 'project_manager',
        organizationId: 'org_123456789',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authProvider: 'microsoft'
      }
      
      // Generate a simple token for the demo
      const token = 'microsoft_mock_jwt_token_' + Math.random().toString(36).substring(2)
      
      // Store in localStorage
      localStorage.setItem('buildtrack_user', JSON.stringify(mockUser))
      localStorage.setItem('buildtrack_token', token)
      
      // Also store in cookie for middleware
      setCookie('buildtrack_token', token)
      
      // Update auth state
      setState({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        error: null
      })
      
      // Navigate to dashboard after successful login
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Microsoft login failed'
      }))
    }
  }, [router])
  
  const loginWithApple = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // In a real implementation, this would redirect to Apple OAuth
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
      
      const mockUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 11),
        email: 'user@icloud.com',
        firstName: 'Apple',
        lastName: 'User',
        role: 'project_manager',
        organizationId: 'org_123456789',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authProvider: 'apple'
      }
      
      // Generate a simple token for the demo
      const token = 'apple_mock_jwt_token_' + Math.random().toString(36).substring(2)
      
      // Store in localStorage
      localStorage.setItem('buildtrack_user', JSON.stringify(mockUser))
      localStorage.setItem('buildtrack_token', token)
      
      // Also store in cookie for middleware
      setCookie('buildtrack_token', token)
      
      // Update auth state
      setState({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        error: null
      })
      
      // Navigate to dashboard after successful login
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Apple login failed'
      }))
    }
  }, [router])
  
  // Context value
  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    completeOnboarding,
    resetPassword,
    updatePassword,
    clearErrors,
    loginWithGoogle,
    loginWithMicrosoft,
    loginWithApple
  }
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
