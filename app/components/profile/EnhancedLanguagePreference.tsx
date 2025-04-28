/**
 * Enhanced Language Preferences Component
 * 
 * This component provides a comprehensive language selection interface
 * that allows users to:
 * 1. Enable/disable automatic language detection
 * 2. Manually select their preferred language
 * 3. Save their preferences for future visits
 * 
 * Following BuildTrack Pro's design principles:
 * - Mobile-first responsive design
 * - Primary colors: Blue (rgb(24,62,105)), Orange (rgb(236,107,44))
 * - Neumorphism for subtle depth
 * - Glassmorphism for overlays
 * - Accessibility-focused design (WCAG 2.1 AA compliant)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getLocaleDisplayName, LOKALISE_CONFIG } from '@/app/utils/lokaliseConfig';
import { useLanguageDetection } from '@/app/hooks/useLanguageDetection';
import { useUserPreferences } from '@/app/hooks/useUserPreferences';
import { withSafeTranslations } from '@/app/utils/withSafeTranslations';

interface EnhancedLanguagePreferenceProps {
  t: (key: string) => string;
}

function EnhancedLanguagePreference({ t }: EnhancedLanguagePreferenceProps) {
  const { userPreferences, updateUserPreferences, isLoaded } = useUserPreferences();
  const { detectedLocale } = useLanguageDetection();
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract the current locale from the URL
  const currentLocale = pathname?.split('/')[1] || LOKALISE_CONFIG.defaultLocale;
  
  // State for language selection
  const [selectedLocale, setSelectedLocale] = useState<string>(currentLocale);
  const [useAutoDetect, setUseAutoDetect] = useState<boolean>(userPreferences.locale === undefined);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  
  // Update local state when user preferences are loaded
  useEffect(() => {
    if (isLoaded) {
      setUseAutoDetect(userPreferences.locale === undefined);
      if (userPreferences.locale) {
        setSelectedLocale(userPreferences.locale);
      }
    }
  }, [isLoaded, userPreferences.locale]);
  
  const handleAutoDetectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUseAutoDetect(e.target.checked);
    if (e.target.checked) {
      // When auto-detect is enabled, show the detected locale in the dropdown
      setSelectedLocale(detectedLocale);
    }
  };
  
  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocale(e.target.value);
  };
  
  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await updateUserPreferences({
        locale: useAutoDetect ? undefined : selectedLocale
      });
      
      // If the selected locale differs from current URL locale, navigate to the new locale version
      if (!useAutoDetect && selectedLocale !== currentLocale) {
        const newPath = pathname?.replace(`/${currentLocale}`, `/${selectedLocale}`);
        if (newPath) {
          router.push(newPath);
        }
      }
      
      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving language preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!isLoaded) {
    return (
      <div className="p-4 rounded-2xl bg-white/30 backdrop-blur-sm shadow-md animate-pulse h-48">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6 rounded-2xl bg-white shadow-md border border-gray-100 mb-6">
      <h2 className="text-lg font-bold text-[rgb(24,62,105)] mb-4">
        {t('common.preferences.language')}
      </h2>
      
      {/* Auto-detect option */}
      <div className="mb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useAutoDetect}
            onChange={handleAutoDetectChange}
            className="w-4 h-4 text-[rgb(236,107,44)] rounded-md focus:ring-[rgb(24,62,105)]"
          />
          <span className="text-gray-700">
            {t('common.preferences.autoDetect')}
            {useAutoDetect && detectedLocale && (
              <span className="ml-2 text-sm text-gray-500">
                ({getLocaleDisplayName(detectedLocale)})
              </span>
            )}
          </span>
        </label>
      </div>
      
      {/* Manual language selection */}
      <div className={`mb-6 ${useAutoDetect ? 'opacity-50' : ''}`}>
        <label className="block text-gray-700 mb-2">
          {t('common.preferences.manualSelect')}
        </label>
        <select
          value={selectedLocale}
          onChange={handleLocaleChange}
          disabled={useAutoDetect}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] disabled:bg-gray-100"
          aria-disabled={useAutoDetect}
        >
          {LOKALISE_CONFIG.supportedLocales.map(locale => (
            <option key={locale} value={locale}>
              {getLocaleDisplayName(locale)}
            </option>
          ))}
        </select>
      </div>
      
      {/* Save button */}
      <div className="flex items-center">
        <button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="px-4 py-2 bg-[rgb(236,107,44)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSaving ? t('common.loading') : t('common.preferences.savePreferences')}
        </button>
        
        {/* Success message */}
        {saveSuccess && (
          <span className="ml-3 text-green-600 animate-fade-in">
            {t('common.success')}
          </span>
        )}
      </div>
    </div>
  );
}

export default withSafeTranslations(EnhancedLanguagePreference, 'common');
