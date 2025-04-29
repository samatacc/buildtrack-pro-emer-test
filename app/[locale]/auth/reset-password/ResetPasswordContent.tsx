'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '../../../../lib/auth/SupabaseAuthContext';
import { useTranslations } from '../../../hooks/useTranslations';

interface ResetPasswordContentProps {
  locale: string;
}

export default function ResetPasswordContent({ locale }: ResetPasswordContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmPasswordReset, isLoading, error: authError, clearErrors } = useSupabaseAuth();
  const { t } = useTranslations('auth');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  useEffect(() => {
    // Clear any auth errors when component mounts
    clearErrors();
    
    // Get token from URL parameters
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setValidationError(t('invalidResetToken', { 
        fallback: 'Invalid or missing reset token. Please request a new password reset link.'
      }));
    }
  }, [searchParams, clearErrors, t]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    clearErrors();
    
    // Validate password
    if (!password || !confirmPassword) {
      setValidationError(t('enterConfirmPassword', { 
        fallback: 'Please enter and confirm your new password'
      }));
      return;
    }
    
    if (password !== confirmPassword) {
      setValidationError(t('passwordsDoNotMatch', { 
        fallback: 'Passwords do not match'
      }));
      return;
    }
    
    if (password.length < 8) {
      setValidationError(t('passwordMinLength', { 
        fallback: 'Password must be at least 8 characters long'
      }));
      return;
    }
    
    try {
      // Call the auth service to confirm password reset
      await confirmPasswordReset(token, password);
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push(`/${locale}/auth/login`);
      }, 3000);
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
            {isSuccess ? 
              t('passwordResetSuccess', { fallback: 'Password Reset Successful!' }) : 
              t('createNewPassword', { fallback: 'Create New Password' })
            }
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSuccess ? 
              t('redirectingToLogin', { fallback: 'Redirecting you to login page...' }) : 
              t('enterNewPasswordBelow', { fallback: 'Please enter your new password below' })
            }
          </p>
        </div>
        
        {/* Password Reset Form */}
        {!isSuccess ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('newPassword', { fallback: 'New Password' })}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] focus:z-10 sm:text-sm"
                  placeholder={t('enterNewPassword', { fallback: 'Enter new password' })}
                  disabled={isLoading || !!validationError}
                />
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('confirmPassword', { fallback: 'Confirm Password' })}
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] focus:z-10 sm:text-sm"
                  placeholder={t('confirmNewPassword', { fallback: 'Confirm new password' })}
                  disabled={isLoading || !!validationError}
                />
              </div>
            </div>
            
            {/* Error Messages */}
            {(validationError || authError) && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{validationError || authError}</h3>
                  </div>
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || !!validationError}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[rgb(24,62,105)] hover:bg-[rgb(19,50,86)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(236,107,44)] transition-colors ${
                  (isLoading || !!validationError) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {t('resetPassword', { fallback: 'Reset Password' })}
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
                  {t('passwordSuccessfullyReset', { 
                    fallback: 'Your password has been successfully reset. You will be redirected to login shortly.' 
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Back to Login Link */}
        <div className="text-center mt-4">
          <Link 
            href={`/${locale}/auth/login`}
            className="font-medium text-[rgb(236,107,44)] hover:text-[rgb(214,97,40)] transition-colors"
          >
            {t('backToLogin', { fallback: 'Back to login' })}
          </Link>
        </div>
      </div>
    </div>
  );
}
