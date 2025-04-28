'use client';

import { useState } from 'react';
import { useProfile } from '@/app/hooks/useProfile';
import { withSafeTranslations, WithTranslationsProps } from '@/app/utils/withSafeTranslations';
import { PROFILE_KEYS } from '@/app/constants/translationKeys';

/**
 * LanguagePreference component
 * 
 * Allows users to change their language preference in the profile settings.
 * Uses the BuildTrack Pro design system with light neumorphism effects.
 * Implements mobile-first design for construction professionals in the field.
 */
export default function LanguagePreference({ t }: WithTranslationsProps) {
  // Get profile management hooks and current locale from custom hooks
  const { profile, updateProfile, isUpdating } = useProfile();
  const [isChanging, setIsChanging] = useState(false);
  
  // Get the current locale from the document's html tag
  const currentLocale = document.documentElement.lang || 'en';
  
  // Function to change locale by updating cookies and reloading page
  const changeLocale = (locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    window.location.pathname = window.location.pathname.replace(
      /^\/(en|es|fr|pt-BR)(\/|$)/, `/${locale}$2`
    );
  };
  
  // Language options
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }
  ];
  
  // Handle language change
  const handleLanguageChange = async (languageCode: string) => {
    setIsChanging(true);
    
    try {
      // Update the profile with the new language preference
      await updateProfile({ language: languageCode });
      
      // Change the UI language
      changeLocale(languageCode);
      
      // Success message
      console.log(`Language changed to ${languageCode}`);
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsChanging(false);
    }
  };
  
  return (
    <div className="p-6 rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-bold mb-4 text-[rgb(24,62,105)]">
        {t(PROFILE_KEYS.LANGUAGE)}
      </h3>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          {t('currentLanguage')}: <span className="font-medium">{
            languages.find(lang => lang.code === (profile?.language || currentLocale))?.name
          }</span>
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              disabled={isUpdating || isChanging || (profile?.language === language.code)}
              className={`
                p-4 
                rounded-xl 
                border-2
                transition-all 
                duration-300
                flex 
                items-center 
                justify-center
                ${(profile?.language === language.code) 
                  ? 'bg-[rgb(24,62,105)] text-white border-[rgb(24,62,105)]' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[rgb(236,107,44)] hover:text-[rgb(24,62,105)]'}
                ${isUpdating || isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span>{language.name}</span>
              
              {/* Check mark for selected language */}
              {(profile?.language === language.code) && (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 ml-2" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
        
        {isChanging && (
          <div className="flex items-center justify-center mt-4 text-[rgb(24,62,105)]">
            <svg 
              className="animate-spin h-5 w-5 mr-2" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t('changing')}
          </div>
        )}
      </div>
    </div>
  );
}
