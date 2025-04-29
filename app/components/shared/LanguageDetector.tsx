'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getPreferredLanguage } from '@/app/utils/languageDetection';
import { localeNames, localeFlags, locales } from '@/i18n';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';

/**
 * LanguageDetector Component
 * 
 * Automatically detects user's preferred language and offers a suggestion
 * to switch if different from current language. Following BuildTrack Pro's
 * design principles with subtle animations and mobile-first approach.
 * 
 * Uses Primary Blue: rgb(24,62,105) and Primary Orange: rgb(236,107,44)
 * for consistent branding.
 */
export default function LanguageDetector() {
  const [detectedLocale, setDetectedLocale] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasUserDismissed, setHasUserDismissed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useNamespacedTranslations('common');
  
  // Get current locale from URL
  const currentLocale = pathname?.split('/')[1] || 'en';
  
  useEffect(() => {
    // Check if user has dismissed the suggestion recently
    const hasRecentlyDismissed = localStorage.getItem('language-suggestion-dismissed');
    if (hasRecentlyDismissed && 
        Date.now() - parseInt(hasRecentlyDismissed, 10) < 86400000) { // 24 hours
      return;
    }
    
    // Only show suggestion if user hasn't explicitly selected a language
    const hasExplicitPreference = localStorage.getItem('explicit-language-preference') === 'true';
    if (hasExplicitPreference) {
      return;
    }
    
    // Detect user's preferred language
    const detectLanguage = async () => {
      try {
        const preferred = await getPreferredLanguage();
        
        // Only suggest if detected language is different from current
        if (preferred && preferred !== currentLocale && locales.includes(preferred)) {
          setDetectedLocale(preferred);
          
          // Show with a slight delay for better UX
          setTimeout(() => {
            setIsVisible(true);
          }, 1500);
        }
      } catch (error) {
        console.error('Error detecting language:', error);
      }
    };
    
    detectLanguage();
  }, [currentLocale]);
  
  // Switch to detected language
  const switchLanguage = () => {
    if (!detectedLocale) return;
    
    // Mark as explicitly preferred
    localStorage.setItem('explicit-language-preference', 'true');
    
    // Update URL to include new locale
    const newPath = pathname?.replace(/^\/[^\/]+/, `/${detectedLocale}`) || `/${detectedLocale}`;
    router.push(newPath);
    
    // Hide suggestion
    setIsVisible(false);
  };
  
  // Dismiss suggestion
  const dismissSuggestion = () => {
    setIsVisible(false);
    setHasUserDismissed(true);
    
    // Remember dismissal with timestamp
    localStorage.setItem('language-suggestion-dismissed', Date.now().toString());
  };
  
  // Don't render if no suggestion or user dismissed
  if (!detectedLocale || hasUserDismissed || !isVisible) {
    return null;
  }
  
  // Get display name and flag for detected language
  const detectedLanguageName = localeNames[detectedLocale as keyof typeof localeNames] || detectedLocale;
  const currentLanguageName = localeNames[currentLocale as keyof typeof localeNames] || currentLocale;
  const detectedFlag = localeFlags[detectedLocale as keyof typeof localeFlags];
  
  return (
    <div 
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      style={{ 
        boxShadow: '0 10px 25px -5px rgba(24,62,105,0.2)',
        borderLeft: '4px solid rgb(236,107,44)'
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-2">{detectedFlag}</span>
        <h3 className="font-bold text-gray-800 dark:text-white text-sm">
          {t('languageSelector.languageSuggestion.detected')}
        </h3>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        {t('languageSelector.languageSuggestion.message', {
          detectedLanguage: detectedLanguageName,
          currentLanguage: currentLanguageName
        })}
      </p>
      
      <div className="flex justify-between">
        <button
          onClick={switchLanguage}
          className="px-3 py-1.5 bg-[rgb(236,107,44)] hover:bg-[rgb(216,87,24)] text-white text-sm rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {t('languageSelector.languageSuggestion.switchTo', { language: detectedLanguageName })}
        </button>
        
        <button
          onClick={dismissSuggestion}
          className="px-3 py-1.5 text-gray-600 dark:text-gray-300 text-sm hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
        >
          {t('languageSelector.languageSuggestion.noThanks')}
        </button>
      </div>
    </div>
  );
}
