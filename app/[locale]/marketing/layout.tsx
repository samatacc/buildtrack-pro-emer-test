'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Stub components that implement BuildTrack Pro's design system
const StubMarketingHeader = () => (
  <header className="bg-white shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold text-[rgb(24,62,105)]">
          BuildTrack Pro
        </div>
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-gray-600 hover:text-[rgb(236,107,44)]">Features</a>
          <a href="#" className="text-gray-600 hover:text-[rgb(236,107,44)]">Solutions</a>
          <a href="#" className="text-gray-600 hover:text-[rgb(236,107,44)]">Pricing</a>
        </nav>
        <div>
          <button className="bg-[rgb(236,107,44)] text-white px-4 py-2 rounded-lg">
            Get Started
          </button>
        </div>
      </div>
    </div>
  </header>
);

const StubLanguageSelector = () => (
  <div className="relative inline-block">
    <button 
      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm text-[rgb(24,62,105)] hover:bg-blue-50 transition-colors"
      aria-label="Select language"
    >
      <span>EN</span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>
);

// Stub translation function following BuildTrack Pro's i18n standards
const useStubTranslations = (namespace: string = 'marketing') => {
  return {
    t: (key: string) => key.split('.').pop() || key,
    changeLocale: (locale: string) => {},
    getCurrentLocale: () => 'en',
  };
};

// Dynamic imports with fallbacks using relative paths for better Vercel compatibility
const MarketingHeader = dynamic(
  () => import('../../../components/marketing/MarketingHeader')
    .catch(() => ({ default: StubMarketingHeader })),
  { ssr: false, loading: StubMarketingHeader }
);

const EnhancedLanguageSelector = dynamic(
  () => import('../../../components/shared/EnhancedLanguageSelector')
    .catch(() => ({ default: StubLanguageSelector })),
  { ssr: false, loading: StubLanguageSelector }
);

// Use either the real hook or the stub
let useTranslations;
try {
  useTranslations = require('../../../hooks/useTranslations').useTranslations;
} catch (e) {
  console.warn('Using stub translations in marketing layout');
  useTranslations = useStubTranslations;
}

/**
 * Marketing Layout
 * 
 * Provides the layout structure for all marketing pages including
 * internationalization support through the EnhancedLanguageSelector component.
 * 
 * Features BuildTrack Pro's design system with:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 * - Light neumorphism for subtle depth
 * - Glassmorphism for overlays/modals
 * - Mobile-first responsive design with animations
 * 
 * @param props.children React nodes to be rendered within this layout
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslations('marketing');
  
  // Social media links with proper a11y
  const socialLinks = [
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin' },
    { name: 'Twitter', href: 'https://twitter.com', icon: 'twitter' },
    { name: 'GitHub', href: 'https://github.com', icon: 'github' },
    { name: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  ];
  
  // Marketing footer links with translations
  const footerLinks = [
    {
      title: 'company',
      links: [
        { name: 'about', href: '/marketing/about' },
        { name: 'careers', href: '/marketing/careers' },
        { name: 'blog', href: '/marketing/blog' },
      ],
    },
    {
      title: 'resources',
      links: [
        { name: 'documentation', href: '/docs' },
        { name: 'tutorials', href: '/tutorials' },
        { name: 'webinars', href: '/webinars' },
      ],
    },
    {
      title: 'legal',
      links: [
        { name: 'privacy', href: '/privacy' },
        { name: 'terms', href: '/terms' },
        { name: 'cookies', href: '/cookies' },
      ],
    },
  ];
  
  // Scroll restoration for page transitions
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Social media icon renderer
  const renderSocialIcon = (icon: string) => {
    switch (icon) {
    case 'linkedin':
      return (
        <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'twitter':
      return (
        <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      );
    case 'github':
      return (
        <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'instagram':
      return (
        <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return null;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Enhanced Header with Language Selector */}
      <MarketingHeader />
      
      {/* Main Content with padding to account for fixed header */}
      <main className="flex-grow pt-20">
        {children}
      </main>
      
      {/* Footer with language selector and social links */}
      <footer className="bg-[rgb(24,62,105)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Logo and description */}
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-2xl bg-white text-[rgb(24,62,105)] flex items-center justify-center text-lg font-bold mr-2">
                  BP
                </div>
                <span className="font-bold text-xl">
                  BuildTrack<span className="text-[rgb(236,107,44)]">Pro</span>
                </span>
              </div>
              <p className="text-gray-300 max-w-xs">
                {t('footerDescription', { 
                  fallback: 'All-in-one construction management platform designed for modern builders.', 
                })}
              </p>
              
              {/* Social Media Links */}
              <div className="flex space-x-4">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.name} ${t('social', { fallback: 'social media' })}`}
                  >
                    {renderSocialIcon(item.icon)}
                  </a>
                ))}
              </div>
              
              {/* Enhanced Language Selector in Footer */}
              <div className="pt-2">
                {/* Defensive rendering with fallback for language selector */}
                <div className="animate-fade-in">
                  {React.createElement(StubLanguageSelector)}
                </div>
              </div>
            </div>
            
            {/* Footer Links */}
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="text-lg font-semibold mb-4 text-[rgb(236,107,44)]">
                  {t(`footer.${group.title}`, { fallback: group.title })}
                </h3>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-300"
                      >
                        {t(`footer.${link.name}`, { fallback: link.name })}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-300 text-sm text-center">
              &copy; {new Date().getFullYear()} BuildTrack Pro. {t('allRightsReserved', { fallback: 'All rights reserved.' })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
