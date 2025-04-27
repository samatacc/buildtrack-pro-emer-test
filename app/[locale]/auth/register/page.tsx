'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSupabaseAuth } from '@/lib/auth/SupabaseAuthContext';
import { useTranslations } from '@/app/hooks/useTranslations';

/**
 * Internationalized Register Page
 * 
 * Follows BuildTrack Pro's mobile-first design approach with light neumorphism
 * and glassmorphism effects using the primary color scheme:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 */
export default function LocalizedRegisterPage() {
  const { signUp, signInWithGoogle, isLoading, error, clearErrors } = useSupabaseAuth();
  const { t } = useTranslations('auth');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Clear any auth errors when component mounts
  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  // Validate passwords match
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError(t('passwordsDoNotMatch', { fallback: 'Passwords do not match' }));
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password || !firstName || !lastName || !agreeTerms) {
      return; // Form validation is handled by HTML5 required attributes
    }
    
    if (password !== confirmPassword) {
      return; // Password mismatch is shown to user
    }
    
    // Call signup function from auth context with user metadata
    await signUp(
      email, 
      password, 
      {
        first_name: firstName,
        last_name: lastName,
        job_title: jobTitle,
        company: company,
        name: `${firstName} ${lastName}`,
        language: 'en', // Default language
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // Get user's timezone
      }
    );
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
          <h2 className="mt-6 text-3xl font-bold text-[rgb(24,62,105)]">
            {t('signUp')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('alreadyHaveAccount')}{' '}
            <Link href="/auth/login" className="font-medium text-[rgb(236,107,44)] hover:text-[rgb(216,87,24)] transition-colors">
              {t('signIn')}
            </Link>
          </p>
        </div>
        
        {/* Registration Form with Neumorphic Design */}
        <div className="bg-white rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-gray-100">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-lg animate-fade-in">
              <p>{error}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Fields - 2 column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  {t('firstName')}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] transition-all"
                />
              </div>
              
              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  {t('lastName')}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] transition-all"
                />
              </div>
            </div>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('email')}
              </label>
              <div className="mt-1 relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            
            {/* Password Fields */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('password')}
              </label>
              <div className="mt-1 relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] transition-all"
                />
              </div>
            </div>
            
            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('confirmPassword')}
              </label>
              <div className="mt-1 relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    passwordError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)]'
                  } rounded-2xl transition-all`}
                />
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>
            
            {/* Optional Professional Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Job Title */}
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                  {t('jobTitle')} <span className="text-gray-400">({t('optional')})</span>
                </label>
                <input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  autoComplete="organization-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] transition-all"
                />
              </div>
              
              {/* Company */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  {t('company')} <span className="text-gray-400">({t('optional')})</span>
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] transition-all"
                />
              </div>
            </div>
            
            {/* Terms Agreement */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 text-[rgb(236,107,44)] focus:ring-[rgb(236,107,44)] border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-600">
                  {t('agreeToTerms')}{' '}
                  <Link href="/terms" className="font-medium text-[rgb(24,62,105)] hover:text-[rgb(19,49,84)] transition-colors">
                    {t('termsAndConditions')}
                  </Link>{' '}
                  {t('and')}{' '}
                  <Link href="/privacy" className="font-medium text-[rgb(24,62,105)] hover:text-[rgb(19,49,84)] transition-colors">
                    {t('privacyPolicy')}
                  </Link>
                </label>
              </div>
            </div>
            
            {/* Sign Up Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || !!passwordError}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white bg-[rgb(236,107,44)] hover:bg-[rgb(216,87,24)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(236,107,44)] transition-colors ${
                  (isLoading || !!passwordError) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('signingUp')}
                  </div>
                ) : (
                  t('createAccount')
                )}
              </button>
            </div>
          </form>
          
          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {t('orContinueWith')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Social Registration Button */}
          <div className="mt-6">
            <button
              onClick={signInWithGoogle}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-2xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(24,62,105)] transition-all"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                </g>
              </svg>
              {t('signUpWithGoogle')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
