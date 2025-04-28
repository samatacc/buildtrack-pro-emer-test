'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useProfile } from '@/app/hooks/useProfile';
import { localeNames, localeFlags } from '@/i18n';

/**
 * LanguageSelector Component
 * 
 * A reusable language selector dropdown with animations that integrates 
 * with the profile management system. Follows BuildTrack Pro's design system
 * with Primary Blue (rgb(24,62,105)) and Primary Orange (rgb(236,107,44)),
 * featuring light neumorphism for subtle depth and micro-animations
 * for improved user engagement.
 * 
 * @param props.variant 'minimal' | 'full' - Display style
 * @param props.position 'header' | 'footer' | 'sidebar' - Positioning context
 * @param props.showFlags Whether to show country flags
 */
interface LanguageSelectorProps {
  variant?: 'minimal' | 'full';
  position?: 'header' | 'footer' | 'sidebar';
  showFlags?: boolean;
  className?: string;
}

export default function LanguageSelector({ 
  variant = 'full', 
  position = 'header',
  showFlags = true,
  className = '',
}: LanguageSelectorProps) {
  const { t, changeLocale, currentLocale } = useTranslations();
  const { updateProfile, isUpdating } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Language options with ISO codes and names from i18n.ts
  const languages = Object.entries(localeNames).map(([code, name]) => ({
    code,
    name,
    flag: localeFlags[code as keyof typeof localeFlags]
  }));
  
  // Current language display
  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];
  
  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle language change
  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === currentLocale) {
      setIsOpen(false);
      return;
    }
    
    try {
      // Update the profile with the new language preference
      // This ensures language preference is persisted across sessions
      await updateProfile({ language: languageCode });
      
      // Change the UI language
      changeLocale(languageCode);
      
      // Close the dropdown
      setIsOpen(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };
  
  // Determine button styles based on variant and position
  const getButtonStyles = () => {
    const baseStyles = 'transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] focus:ring-opacity-50';
    
    if (variant === 'minimal') {
      return `${baseStyles} text-gray-600 hover:text-[rgb(24,62,105)] p-2 rounded-lg`;
    }
    
    switch (position) {
      case 'header':
        return `${baseStyles} bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm hover:shadow px-3 py-2 rounded-xl text-[rgb(24,62,105)]`;
      case 'footer':
        return `${baseStyles} bg-gray-800 text-white hover:bg-gray-700 px-3 py-2 rounded-xl`;
      case 'sidebar':
        return `${baseStyles} bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl text-[rgb(24,62,105)]`;
      default:
        return `${baseStyles} bg-white border border-gray-200 shadow-sm hover:shadow px-3 py-2 rounded-xl text-[rgb(24,62,105)]`;
    }
  };
  
  // Dropdown menu styles based on position
  const getDropdownStyles = () => {
    const baseStyles = 'absolute z-10 mt-2 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden border border-gray-100 backdrop-blur-sm';
    
    switch (position) {
      case 'header':
        return `${baseStyles} right-0 w-48`;
      case 'footer':
        return `${baseStyles} bottom-full mb-2 left-0 w-48`;
      case 'sidebar':
        return `${baseStyles} right-0 w-48`;
      default:
        return `${baseStyles} right-0 w-48`;
    }
  };
  
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Language Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${getButtonStyles()} ${isUpdating ? 'opacity-70 cursor-wait' : ''} flex items-center space-x-2`}
        disabled={isUpdating}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Show flag if enabled */}
        {showFlags && (
          <span className="text-lg" aria-hidden="true">
            {currentLanguage.flag}
          </span>
        )}
        
        {/* Show language name depending on variant */}
        {variant === 'full' && (
          <span>{currentLanguage.name}</span>
        )}
        
        {/* Dropdown indicator */}
        <svg 
          className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Dropdown Menu with Animation */}
      {isOpen && (
        <div 
          className={`${getDropdownStyles()} animate-fade-in-down`}
          role="menu" 
          aria-orientation="vertical" 
          aria-labelledby="language-menu"
        >
          <div className="py-1" role="none">
            {languages.map((language, index) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  w-full text-left px-4 py-2 text-sm ${
                    language.code === currentLocale 
                      ? 'bg-gray-100 text-[rgb(24,62,105)] font-medium' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-[rgb(24,62,105)]'
                  } transition-colors duration-150
                  flex items-center space-x-3
                  animate-fade-in
                `}
                style={{ animationDelay: `${index * 50}ms` }}
                role="menuitem"
              >
                {showFlags && (
                  <span className="text-lg" aria-hidden="true">
                    {language.flag}
                  </span>
                )}
                <span>{language.name}</span>
                
                {/* Checkmark for selected language */}
                {language.code === currentLocale && (
                  <svg 
                    className="ml-auto h-5 w-5 text-[rgb(236,107,44)]" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
