'use client';

import { useTranslations } from '../../hooks/useTranslations';
import Link from 'next/link';

/**
 * Internationalized Marketing Home Page
 * 
 * Mobile-first landing page for BuildTrack Pro following the design system with
 * Primary Blue (rgb(24,62,105)) and Primary Orange (rgb(236,107,44)).
 * 
 * Features light neumorphism for subtle depth and glassmorphism for UI panels
 * as specified in the project design guidelines.
 */
export default function LocalizedMarketingHome() {
  const { t } = useTranslations('marketing');
  
  // Mock client logos for the trusted by section
  const clients = [
    'Westfield Construction', 
    'Harbor Builders', 
    'Alpine Homes', 
    'Urban Development', 
    'Skyline Contractors', 
    'Premier Properties'
  ];
  
  // Features list with icons
  const features = [
    {
      title: 'projectManagement',
      description: 'projectManagementDesc',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[rgb(236,107,44)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      title: 'resourceTracking',
      description: 'resourceTrackingDesc',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[rgb(236,107,44)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'fieldMobileApp',
      description: 'fieldMobileAppDesc',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[rgb(236,107,44)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
  ];
  
  return (
    <>
      {/* Hero Section with subtle neumorphism */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[rgb(24,62,105)] sm:text-4xl md:text-5xl lg:text-6xl">
              {t('heroTitle', { fallback: 'Build Better, Track Smarter' })}
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              {t('heroSubtitle', { 
                fallback: 'The all-in-one construction management platform designed for builders who want to streamline their projects, reduce costs, and deliver exceptional results.'
              })}
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <Link
                  href="/auth/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-2xl text-white bg-[rgb(236,107,44)] hover:bg-[rgb(220,100,40)] transition-colors duration-300 md:py-4 md:text-lg md:px-10"
                >
                  {t('startFreeTrial', { fallback: 'Start Free Trial' })}
                </Link>
              </div>
              <div className="mt-3 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 sm:mt-0 sm:ml-3">
                <Link
                  href="#demo"
                  className="w-full flex items-center justify-center px-8 py-3 border border-[rgb(24,62,105)] text-base font-medium rounded-2xl text-[rgb(24,62,105)] bg-white hover:bg-gray-50 transition-colors duration-300 md:py-4 md:text-lg md:px-10"
                >
                  {t('watchDemo', { fallback: 'Watch Demo' })}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Strip - Social Proof with light neumorphism */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base font-semibold uppercase text-gray-500 tracking-wider">
            {t('trustedBy', { fallback: 'Trusted by industry leaders' })}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-6 lg:grid-cols-6">
            {clients.map((client) => (
              <div key={client} className="col-span-1 flex justify-center grayscale hover:grayscale-0 transition-all duration-300">
                <div className="h-12 px-4 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <span className="font-medium text-[rgb(24,62,105)] text-sm md:text-base">{client}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with glassmorphism panels */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[rgb(24,62,105)]">
              {t('featuresTitle', { fallback: 'Modern Features for Modern Builders' })}
            </h2>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl">
              {t('featuresSubtitle', { 
                fallback: 'Everything you need to manage complex construction projects from start to finish.'
              })}
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="relative bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="absolute -top-5 left-6 bg-white p-3 rounded-xl shadow-md">
                  {feature.icon}
                </div>
                <div className="pt-6">
                  <h3 className="text-xl font-bold text-[rgb(24,62,105)] mt-4">
                    {t(feature.title, { fallback: feature.title })}
                  </h3>
                  <p className="mt-3 text-gray-600">
                    {t(feature.description, { fallback: feature.description })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with neumorphism */}
      <section className="py-16 bg-[rgb(24,62,105)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {t('ctaTitle', { fallback: 'Ready to Transform Your Construction Business?' })}
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                {t('ctaSubtitle', { 
                  fallback: 'Join thousands of construction professionals who use BuildTrack Pro to deliver projects on time and under budget.'
                })}
              </p>
              <div className="mt-8">
                <Link
                  href="/auth/register"
                  className="inline-block px-8 py-3 border border-transparent text-lg font-medium rounded-xl text-[rgb(24,62,105)] bg-white hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('startNow', { fallback: 'Start Now' })}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer is now provided by the marketing layout */}
    </>
  );
}
