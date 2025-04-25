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
import { UserServiceFactory } from '../data/services/UserServiceFactory'
import { UserCredentials, UserRegistrationData } from '../data/models/User'

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
      // Get user service instance
      const userService = UserServiceFactory.getInstance()
      
      // Authenticate with credentials
      const credentials: UserCredentials = {
        email: data.email,
        password: data.password
      }
      
      const result = await userService.authenticateWithCredentials(credentials)
      
      if (!result) {
        throw new Error('Invalid email or password')
      }
      
      // Extract user and token
      const { token, ...user } = result
      
      // Convert to our User model
      const appUser: User = {
        id: user.id,
        email: user.email,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        role: (user.role as 'admin' | 'project_manager' | 'contractor' | 'client' | 'user') || 'user',
        organizationId: user.organizationId || '',
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        authProvider: user.authProvider || 'email'
      }
      
      // Store in localStorage
      localStorage.setItem('buildtrack_user', JSON.stringify(appUser))
      localStorage.setItem('buildtrack_token', token)
      
      // Also store in cookie for middleware
      setCookie('buildtrack_token', token)
      
      // Update auth state
      setState({
        user: appUser,
        isLoading: false,
        isAuthenticated: true,
        error: null
      })
      
      // Navigate to dashboard after successful login
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
    } catch (error) {
      // Safely handle errors without instanceof
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? error.message as string
        : 'Login failed';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
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
        error: error && typeof error === 'object' && 'message' in error ? error.message as string : 'Logout failed'
      }))
    }
  }, [router])
  
  // Register handler
  const register = useCallback(async (data: RegisterFormData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Get user service instance
      const userService = UserServiceFactory.getInstance()
      
      // Check if user already exists
      const existingUser = await userService.getUserByEmail(data.email)
      
      if (existingUser) {
        throw new Error('A user with this email already exists')
      }
      
      // Prepare user data
      const userData: UserRegistrationData = {
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        password: data.password,
        authProvider: 'email'
      }
      
      // Create temp user data for onboarding
      const tempUser: User = {
        id: '', // Will be generated by service
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'user',
        organizationId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Store temp user data for onboarding
      localStorage.setItem('buildtrack_temp_user', JSON.stringify(tempUser))
      localStorage.setItem('buildtrack_registration_data', JSON.stringify(userData))
      
      setState(prev => ({ ...prev, isLoading: false }))
      
      // Navigate to onboarding
      router.push('/auth/onboarding')
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error && typeof error === 'object' && 'message' in error ? error.message as string : 'Registration failed'
      }))
    }
  }, [router])
  
  // Complete onboarding handler
  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Get user service instance
      const userService = UserServiceFactory.getInstance()
      
      // Get the temporary user data
      const tempUserJson = localStorage.getItem('buildtrack_temp_user')
      const registrationDataJson = localStorage.getItem('buildtrack_registration_data')
      
      if (!tempUserJson || !registrationDataJson) {
        throw new Error('Registration session expired')
      }
      
      const tempUser = JSON.parse(tempUserJson) as User
      const regData = JSON.parse(registrationDataJson) as UserRegistrationData
      
      // Add organization preferences from onboarding
      const userData: UserRegistrationData = {
        ...regData,
        // Additional onboarding data could be added here
      }
      
      // Register the user with the service
      const result = await userService.registerUser(userData)
      
      if (!result) {
        throw new Error('Failed to create user account')
      }
      
      // Extract user and token
      const { token, ...user } = result
      
      // Setup permanent user
      localStorage.removeItem('buildtrack_temp_user')
      localStorage.removeItem('buildtrack_registration_data')
      
      // Convert to our User model
      const appUser: User = {
        id: user.id,
        email: user.email,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        role: (user.role as 'admin' | 'project_manager' | 'contractor' | 'client' | 'user') || 'user',
        organizationId: user.organizationId || '',
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        authProvider: user.authProvider || 'email'
      }
      
      localStorage.setItem('buildtrack_user', JSON.stringify(appUser))
      localStorage.setItem('buildtrack_token', token)
      
      // Also set token in cookie
      setCookie('buildtrack_token', token)
      
      setState({
        user: appUser,
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
        error: error && typeof error === 'object' && 'message' in error ? error.message as string : 'Onboarding failed'
      }))
      
      // Redirect back to registration on error
      setTimeout(() => router.push('/auth/register'), 2000)
    }
  }, [router])
  
  // Password reset request handler
  const resetPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Get user service instance
      const userService = UserServiceFactory.getInstance()
      
      // Check if user exists
      const user = await userService.getUserByEmail(email)
      
      if (!user) {
        // Don't reveal if user exists or not for security
        setState(prev => ({ ...prev, isLoading: false }))
        return Promise.resolve()
      }
      
      // Request password reset
      const success = await userService.requestPasswordReset(email)
      
      setState(prev => ({ ...prev, isLoading: false }))
      return Promise.resolve()
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error && typeof error === 'object' && 'message' in error ? error.message as string : 'Password reset failed'
      }))
      return Promise.reject(error)
    }
  }, [])
  
  // Password update handler
  const updatePassword = useCallback(async (token: string, newPassword: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Get user service instance
      const userService = UserServiceFactory.getInstance()
      
      // Reset password with token
      const success = await userService.resetPassword(token, newPassword)
      
      if (!success) {
        throw new Error('Invalid or expired token')
      }
      
      setState(prev => ({ ...prev, isLoading: false }))
      return Promise.resolve()
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error && typeof error === 'object' && 'message' in error ? error.message as string : 'Password update failed'
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
      // For now, redirect to the API route that handles OAuth
      window.location.href = '/api/auth/google'
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error && typeof error === 'object' && 'message' in error ? error.message as string : 'Google login failed'
      }))
    }
  }, [router])
  
  const loginWithMicrosoft = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // For now, redirect to the API route that handles OAuth
      window.location.href = '/api/auth/microsoft'
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error && typeof error === 'object' && 'message' in error ? error.message as string : 'Microsoft login failed'
      }))
    }
  }, [router])
  
  const loginWithApple = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Apple OAuth is coming soon, just show an error for now
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Apple Sign In is coming soon'
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error && typeof error === 'object' && 'message' in error ? error.message as string : 'Apple login failed'
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
