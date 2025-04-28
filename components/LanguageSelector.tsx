'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { locales, localeNames, localeFlags } from '../i18n';
import { getLocalizedUrl, getLocaleDisplayName, getLocaleFlag } from '../lib/i18n/utils';
import { saveLanguagePreference } from '../lib/i18n/languageStorage';
import { useTranslations } from '../hooks/useTranslations';

/**
 * LanguageSelector component
 * 
 * A mobile-first, accessible language selector component that follows 
 * BuildTrack Pro's design principles:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 * - Light neumorphism for subtle depth
 * - Micro-animations for engagement
 */
export default function LanguageSelector({ type = 'dropdown' }: { type?: 'dropdown' | 'buttons' }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslations('common');

  // Handle keyboard navigation for accessibility
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.language-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isOpen]);

  // Change language handler with transition animation
  const changeLanguage = useCallback((locale: string) => {
    if (locale === currentLocale) return;

    // Close the dropdown
    setIsOpen(false);
    
    // Save the language preference to persist it across sessions
    saveLanguagePreference(locale);

    // Get the localized URL for the current path
    const newPath = getLocalizedUrl(pathname || '/', locale);

    // Add a subtle fade out effect before navigation
    document.documentElement.classList.add('language-transition');
    
    // Use transition to avoid blocking the UI during navigation
    setTimeout(() => {
      startTransition(() => {
        router.push(newPath);
        router.refresh();
        
        // Remove the transition class after navigation
        setTimeout(() => {
          document.documentElement.classList.remove('language-transition');
        }, 300);
      });
    }, 150); // Short delay for the fade out effect to be visible
  }, [currentLocale, pathname, router]);
  
  // Add transition styles once on component mount
  useEffect(() => {
    // Add the CSS if it doesn't exist yet
    if (!document.getElementById('language-transition-style')) {
      const style = document.createElement('style');
      style.id = 'language-transition-style';
      style.innerHTML = `
        .language-transition {
          opacity: 0.8;
          transition: opacity 150ms ease-in-out;
        }
        .language-transition-complete {
          opacity: 1;
          transition: opacity 300ms ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      // Clean up transition effects if component unmounts
      document.documentElement.classList.remove('language-transition');
      document.documentElement.classList.remove('language-transition-complete');
    };
  }, []);

  if (type === 'buttons') {
    return (
      <div className="flex space-x-2" role="region" aria-label={t('languageSelector')}>
        {locales.map(locale => (
          <button
            key={locale}
            onClick={() => changeLanguage(locale)}
            className={`flex items-center px-3 py-1.5 rounded-lg text-sm transition duration-200 ease-in-out ${
              locale === currentLocale
                ? 'bg-blue-900 text-white shadow-inner'
                : 'hover:bg-blue-50 text-blue-900 hover:shadow-sm'
            }`}
            aria-current={locale === currentLocale ? 'true' : 'false'}
            disabled={isPending}
            style={{ 
              backgroundColor: locale === currentLocale ? 'rgb(24,62,105)' : '',
              opacity: isPending ? 0.7 : 1 
            }}
          >
            <span className="mr-1.5">{getLocaleFlag(locale)}</span>
            <span>{getLocaleDisplayName(locale)}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="language-selector relative" aria-label={t('languageSelector')}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 rounded-lg text-sm bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all duration-200 ease-in-out"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={isPending}
        style={{ 
          color: 'rgb(24,62,105)',
          opacity: isPending ? 0.7 : 1 
        }}
      >
        <span className="mr-1.5">{getLocaleFlag(currentLocale)}</span>
        <span className="mr-2">{getLocaleDisplayName(currentLocale)}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-48 rounded-xl bg-white border border-gray-100 shadow-lg animate-fadeIn overflow-hidden"
          style={{
            boxShadow: '0 4px 20px rgba(24, 62, 105, 0.1)',
            transform: 'translateY(0px)',
            opacity: 1,
          }}
          role="listbox"
        >
          <div className="py-1">
            {locales.map(locale => (
              <button
                key={locale}
                className={`flex w-full items-center px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors duration-150 ${
                  locale === currentLocale ? 'bg-blue-50/80' : ''
                }`}
                role="option"
                aria-selected={locale === currentLocale}
                onClick={() => changeLanguage(locale)}
                style={{ color: locale === currentLocale ? 'rgb(24,62,105)' : '' }}
              >
                <span className="mr-3 text-lg">{getLocaleFlag(locale)}</span>
                <span>{getLocaleDisplayName(locale)}</span>
                {locale === currentLocale && (
                  <svg
                    className="w-4 h-4 ml-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: 'rgb(236, 107, 44)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
