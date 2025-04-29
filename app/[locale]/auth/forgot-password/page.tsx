'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSupabaseAuth } from '../../../../lib/auth/SupabaseAuthContext';
import { useTranslations } from '../../../hooks/useTranslations';

/**
 * Internationalized Forgot Password Page
 * 
 * Follows BuildTrack Pro's mobile-first design approach with light neumorphism
 * and glassmorphism effects using the primary color scheme:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 */
export default function LocalizedForgotPasswordPage() {
  const { resetPassword, isLoading, error, clearErrors } = useSupabaseAuth();
  const { t } = useTranslations('auth');
  
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    if (!email) {
      return; // Form validation is handled by HTML5 required attributes
    }
    
    try {
      await resetPassword(email);
      // Set submitted state to show success message
      setIsSubmitted(true);
    } catch (err) {
      // Error is handled by the auth context
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 animate-fade-in-up">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-[rgb(24,62,105)] text-white flex items-center justify-center text-2xl font-bold">
              BP
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[rgb(24,62,105)]">
            {t('resetYourPassword', { fallback: 'Reset your password' })}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {!isSubmitted ? (
              t('resetPasswordInstructions', { 
                fallback: 'Enter your email and we\'ll send you instructions to reset your password.'
              })
            ) : (
              t('resetPasswordEmailSent', { 
                fallback: 'Check your inbox for the reset link.'
              })
            )}
          </p>
        </div>
        
        {/* Form */}
        {!isSubmitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  {t('emailAddress', { fallback: 'Email address' })}
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] focus:z-10 sm:text-sm"
                  placeholder={t('emailAddress', { fallback: 'Email address' })}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[rgb(24,62,105)] hover:bg-[rgb(19,50,86)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(236,107,44)] transition-colors ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {t('sendResetLink', { fallback: 'Send reset link' })}
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-md bg-green-50 p-4 animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {t('resetLinkSent', { fallback: 'Reset link sent successfully!' })}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center mt-4">
          <Link 
            href="/auth/login" 
            className="font-medium text-[rgb(236,107,44)] hover:text-[rgb(214,97,40)] transition-colors"
          >
            {t('backToLogin', { fallback: 'Back to login' })}
          </Link>
        </div>
      </div>
    </div>
  );
}
