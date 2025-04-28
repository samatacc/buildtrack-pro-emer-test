'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Session, User, AuthError } from '@supabase/supabase-js'
import { supabase } from '../supabase/client'

// Types for our auth context
export interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithMicrosoft: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearErrors: () => void
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Initial state
const initialState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null
}

// Provider component
export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState)
  const router = useRouter()

  // Initialize auth state from Supabase session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        if (session) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError)
          }

          setState({
            user: session.user,
            session,
            isLoading: false,
            isAuthenticated: true,
            error: null
          })
        } else {
          setState({
            ...initialState,
            isLoading: false
          })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setState({
          ...initialState,
          isLoading: false,
          error: 'Failed to initialize authentication'
        })
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Supabase auth event: ${event}`)
      
      if (session) {
        setState({
          user: session.user,
          session,
          isLoading: false,
          isAuthenticated: true,
          error: null
        })
      } else {
        setState({
          ...initialState,
          isLoading: false
        })
      }
    })

    initializeAuth()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      setState({
        user: data.user,
        session: data.session,
        isLoading: false,
        isAuthenticated: true,
        error: null
      })
      
      // Navigate to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Sign in error:', error)
      
      // Provide more specific user-friendly error messages
      let errorMessage = 'Failed to sign in';
      
      if (error instanceof AuthError) {
        // Check for the specific error code from AuthApiError
        if (error.name === 'AuthApiError' && 'code' in error) {
          // Handle AuthApiError with specific codes
          const apiError = error as unknown as { code: string };
          
          if (apiError.code === 'invalid_credentials') {
            errorMessage = 'Incorrect email or password. Please try again.';
          } else if (apiError.code === 'user_not_found') {
            errorMessage = 'No account found with this email address. Please check your email or sign up.';
          } else if (apiError.code === 'email_not_confirmed') {
            errorMessage = 'Please confirm your email address before signing in.';
          } else {
            errorMessage = error.message || 'Authentication failed. Please try again.';
          }
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Incorrect email or password. Please try again.';
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as any).message;
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
    }
  }, [router])

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      })
      
      if (error) throw error
      
      // If email confirmation is enabled, the user will need to confirm their email
      if (data.user?.identities?.length === 0) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null
        }))
        
        // Navigate to confirmation page
        router.push('/auth/check-email')
      } else {
        setState({
          user: data.user,
          session: data.session,
          isLoading: false,
          isAuthenticated: true,
          error: null
        })
        
        // Navigate to onboarding
        router.push('/auth/onboarding')
      }
    } catch (error) {
      console.error('Sign up error:', error)
      
      // Provide more specific user-friendly error messages
      let errorMessage = 'Failed to sign up';
      
      console.log('Raw error object:', JSON.stringify(error));
      
      if (error instanceof AuthError) {
        // Use the AuthError message
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle specific API errors - check various possible structures
        const apiError = error as any;
        
        if (apiError.code === 'user_already_exists' || 
            (apiError.error_description && apiError.error_description.includes('already exists'))) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (apiError.__isAuthError && apiError.code === 'user_already_exists') {
          // This matches the specific format we're seeing in the console
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
    }
  }, [router])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      setState({
        ...initialState,
        isLoading: false
      })
      
      // Navigate to home
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof AuthError ? error.message : 'Failed to sign out'
      }))
    }
  }, [router])

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
      // The user will be redirected to Google for authentication
    } catch (error) {
      console.error('Google sign in error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof AuthError ? error.message : 'Failed to sign in with Google'
      }))
    }
  }, [])

  // Sign in with Microsoft
  const signInWithMicrosoft = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
      // The user will be redirected to Microsoft for authentication
    } catch (error) {
      console.error('Microsoft sign in error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof AuthError ? error.message : 'Failed to sign in with Microsoft'
      }))
    }
  }, [])

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) throw error
      
      setState(prev => ({
        ...prev,
        isLoading: false
      }))
      
      // Navigate to check email page
      router.push('/auth/check-email?type=reset')
    } catch (error) {
      console.error('Reset password error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof AuthError ? error.message : 'Failed to reset password'
      }))
    }
  }, [router])

  // Clear errors
  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithMicrosoft,
        resetPassword,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for using the auth context
export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  
  return context
}
