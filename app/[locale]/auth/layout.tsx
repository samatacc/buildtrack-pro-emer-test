import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { ManualTranslationProvider } from '../../../src/i18n/TranslationProvider';

const inter = Inter({ subsets: ['latin'] });

interface AuthLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

/**
 * Internationalized Auth Layout
 * 
 * Provides a consistent layout for all authentication pages with proper
 * internationalization support via next-intl. Follows BuildTrack Pro's
 * design system with primary colors:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 */
export default async function LocalizedAuthLayout({ 
  children, 
  params 
}: AuthLayoutProps) {
  // Get the translations for the auth namespace
  const t = await getTranslations({ locale: params.locale, namespace: 'auth' });
  
  // Set current year for copyright notice
  const currentYear = new Date().getFullYear();
  
  // Get messages for auth namespace
  const messages = {
    auth: {}
  };
  
  return (
    <ManualTranslationProvider locale={params.locale} messages={messages}>
        <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {/* Background with pattern */}
          <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white">
            <div 
              className="absolute inset-0 opacity-10" 
              style={{ 
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23183e69\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                backgroundSize: '60px 60px'
              }}>
            </div>
          </div>
          
          {/* Content overlay */}
          <div className="relative z-10 flex-1 flex flex-col py-12 sm:px-6 lg:px-8">
            {/* Logo Header - Used across all auth pages */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
              <div className="flex justify-center">
                <Link href={`/${params.locale}`} className="flex items-center group" style={{ textDecoration: 'none' }}>
                  <div 
                    className="h-14 w-14 rounded-full text-white flex items-center justify-center text-xl font-bold mr-3 shadow-lg" 
                    style={{ 
                      backgroundColor: 'rgb(24,62,105)',
                      transition: 'background-color 0.3s'
                    }}
                  >
                    BT
                  </div>
                  <div className="flex flex-col">
                    <span 
                      className="text-2xl font-bold" 
                      style={{ 
                        color: 'rgb(24,62,105)',
                        transition: 'color 0.3s'
                      }}
                    >
                      BuildTrack
                    </span>
                    <span 
                      className="text-sm font-semibold" 
                      style={{ 
                        color: 'rgb(236,107,44)',
                        transition: 'color 0.3s'
                      }}
                    >
                      Pro
                    </span>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Main Content Container */}
            <main className="flex-1">
              {children}
            </main>
            
            {/* Footer */}
            <footer className="mt-8 text-center text-sm text-gray-500">
              <div className="space-x-6 mb-4">
                <Link 
                  href={`/${params.locale}/privacy`} 
                  className="hover:text-[rgb(236,107,44)] transition-colors"
                >
                  {t('privacy', { fallback: 'Privacy Policy' })}
                </Link>
                <Link 
                  href={`/${params.locale}/terms`} 
                  className="hover:text-[rgb(236,107,44)] transition-colors"
                >
                  {t('terms', { fallback: 'Terms of Service' })}
                </Link>
                <Link 
                  href={`/${params.locale}/contact`} 
                  className="hover:text-[rgb(236,107,44)] transition-colors"
                >
                  {t('contact', { fallback: 'Contact Us' })}
                </Link>
              </div>
              <p>
                &copy; {currentYear} BuildTrack Pro. {t('allRightsReserved', { fallback: 'All rights reserved.' })}
              </p>
            </footer>
          </div>
        </div>
      </ManualTranslationProvider>
  );
}

/**
 * Generate metadata for the auth pages with proper translations
 */
export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'auth' });
  
  return {
    title: t('authTitle', { fallback: 'Authentication | BuildTrack Pro' }),
    description: t('authDescription', { 
      fallback: 'Log in to your BuildTrack Pro account or create a new one to access your construction management tools' 
    })
  };
}
