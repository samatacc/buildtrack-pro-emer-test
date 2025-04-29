'use client';

import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '../../../lib/auth/UnifiedAuthProvider';
import { saveLanguagePreference, syncLanguageWithProfile } from '../../../lib/i18n/languageStorage';

/**
 * Language Preferences Component
 * 
 * Allows users to manage their language preferences across BuildTrack Pro.
 * Integrates with the unified auth system and profile management.
 * 
 * Follows BuildTrack Pro's design system with:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 */

interface LanguagePreferencesProps {
  onPreferenceChange?: (locale: string) => void;
}

export default function LanguagePreferences({ onPreferenceChange }: LanguagePreferencesProps) {
  const { user, locale: userLocale, setUserLocale, isAuthenticated } = useUnifiedAuth();
  const [selectedLocale, setSelectedLocale] = useState(userLocale || 'en');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Update component state when user locale changes
  useEffect(() => {
    if (userLocale && userLocale !== selectedLocale) {
      setSelectedLocale(userLocale);
    }
  }, [userLocale]);
  
  // Supported languages with native names
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' }
  ];
  
  const handleLanguageChange = async (locale: string) => {
    setSelectedLocale(locale);
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Save to cookie first for immediate feedback
      saveLanguagePreference(locale);
      
      // If user is authenticated, sync with profile
      if (isAuthenticated && user) {
        await syncLanguageWithProfile(user.id, locale);
      }
      
      // Update auth context
      setUserLocale(locale);
      
      // Notify parent component
      if (onPreferenceChange) {
        onPreferenceChange(locale);
      }
      
      setSaveMessage('Language preference saved successfully');
      
      // Reload page after a short delay to apply the new language
      setTimeout(() => {
        window.location.href = window.location.href.replace(/\/[^\/]+\/dashboard/, `/${locale}/dashboard`);
      }, 1500);
    } catch (error) {
      console.error('Error saving language preference:', error);
      setSaveMessage('Failed to save language preference');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="p-6 mb-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-[rgb(24,62,105)] mb-4">Language Preferences</h2>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Select your preferred language for BuildTrack Pro. This will be used across all devices when you're signed in.
        </p>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {languages.map((language) => (
            <div 
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all
                ${selectedLocale === language.code 
                  ? 'border-[rgb(236,107,44)] bg-orange-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <div className="font-medium">{language.name}</div>
              <div className="text-sm text-gray-500">{language.nativeName}</div>
            </div>
          ))}
        </div>
        
        {isSaving && (
          <div className="mt-4 flex items-center text-gray-600">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[rgb(24,62,105)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving language preference...
          </div>
        )}
        
        {saveMessage && (
          <div className={`mt-4 text-sm ${saveMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
            {saveMessage}
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500">
          <p>Note: Changing your language will reload the page to apply the new setting.</p>
        </div>
      </div>
    </div>
  );
}
