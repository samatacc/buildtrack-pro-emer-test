'use client';

import { useState, useRef, useEffect } from 'react';
import { useProfile } from '@/app/hooks/useProfile';
import { localeNames, localeFlags } from '@/i18n';
import {
  getPreferredLanguage,
  setLanguageCookie,
} from '@/app/utils/languageDetection';
import {
  withSafeTranslations,
  WithTranslationsProps,
} from '@/app/utils/withSafeTranslations';

/**
 * EnhancedLanguageSelector Component
 *
 * An improved language selector with intelligent language detection,
 * micro-animations, and accessibility features following BuildTrack Pro's
 * mobile-first approach and design system with Primary Blue (rgb(24,62,105))
 * and Primary Orange (rgb(236,107,44)).
 *
 * Features:
 * - Intelligent language detection (profile > cookie > browser > geo)
 * - Smooth micro-animations for enhanced engagement
 * - Responsive design for mobile-first approach
 * - Accessible for screen readers and keyboard navigation
 * - Visual language flags with proper accessibility support
 * - Light neumorphism for subtle depth
 * - Glassmorphism for dropdown
 *
 * @param props.variant 'minimal' | 'full' | 'compact' - Display style
 * @param props.position 'header' | 'footer' | 'sidebar' | 'floating' - Positioning context
 * @param props.showFlags Whether to show country flags
 * @param props.showLanguageName Whether to show language name
 */
interface EnhancedLanguageSelectorProps {
  variant?: 'minimal' | 'full' | 'compact';
  position?: 'header' | 'footer' | 'sidebar' | 'floating';
  showFlags?: boolean;
  showLanguageName?: boolean;
  className?: string;
}

function EnhancedLanguageSelector({
  variant = 'full',
  position = 'header',
  showFlags = true,
  showLanguageName = true,
  className = '',
  t,
}: EnhancedLanguageSelectorProps & WithTranslationsProps) {
  // Get the current locale from the document's html tag
  const currentLocale = document.documentElement.lang || 'en';

  // Function to change locale by updating cookies and reloading page
  const changeLocale = (locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    window.location.pathname = window.location.pathname.replace(
      /^\/(en|es|fr|pt-BR)(\/|$)/,
      `/${locale}$2`,
    );
  };
  const { updateProfile, isUpdating } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Language options from i18n.ts
  const languages = Object.entries(localeNames).map(([code, name]) => ({
    code,
    name,
    flag: localeFlags[code as keyof typeof localeFlags],
  }));

  // Current language display
  const currentLanguage =
    languages.find((lang) => lang.code === currentLocale) || languages[0];

  // Close dropdown with animation
  const closeDropdown = () => {
    if (!isOpen) return;

    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
    }, 200);
  };

  // Helper for keyboard navigation
  const focusNextLanguage = (direction: number) => {
    const items = dropdownRef.current?.querySelectorAll('[role="menuitem"]');
    if (!items?.length) return;

    const currentIndex = Array.from(items).findIndex(
      (item) => item === document.activeElement,
    );
    let nextIndex = currentIndex + direction;

    if (nextIndex < 0) nextIndex = items.length - 1;
    if (nextIndex >= items.length) nextIndex = 0;

    (items[nextIndex] as HTMLElement).focus();
  };

  // Focus language by index
  const focusLanguageByIndex = (index: number) => {
    const items = dropdownRef.current?.querySelectorAll('[role="menuitem"]');
    if (!items?.length) return;

    (items[index] as HTMLElement).focus();
  };

  // Handle language change with animations and profile updates
  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === currentLocale || isUpdating) {
      closeDropdown();
      return;
    }

    try {
      // Start closing animation
      closeDropdown();

      // Set cookie for language persistence
      setLanguageCookie(languageCode);

      // Update the profile with the new language preference
      await updateProfile({ language: languageCode });

      // Change the UI language after dropdown is closed
      setTimeout(() => {
        changeLocale(languageCode);
      }, 200);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Initialize with intelligent language detection
  useEffect(() => {
    const detectAndSetLanguage = async () => {
      try {
        // Only detect if we're on the default locale and haven't explicitly set one
        if (
          currentLocale === 'en' &&
          !document.cookie.includes('NEXT_LOCALE=')
        ) {
          const detectedLocale = await getPreferredLanguage();
          if (detectedLocale && detectedLocale !== currentLocale) {
            changeLocale(detectedLocale);
          }
        }
      } catch (error) {
        console.error('Error detecting language:', error);
      }
    };

    detectAndSetLanguage();
  }, [currentLocale, changeLocale]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeDropdown]);

  // Handle keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
      case 'Escape':
        closeDropdown();
        break;
      case 'ArrowDown':
        e.preventDefault();
        focusNextLanguage(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusNextLanguage(-1);
        break;
      case 'Home':
        e.preventDefault();
        focusLanguageByIndex(0);
        break;
      case 'End':
        e.preventDefault();
        focusLanguageByIndex(languages.length - 1);
        break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isOpen,
    languages.length,
    closeDropdown,
    focusNextLanguage,
    focusLanguageByIndex,
  ]);

  // Determine button styles based on variant and position
  const getButtonStyles = () => {
    const baseStyles =
      'transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] focus:ring-opacity-50';

    if (variant === 'minimal') {
      return `${baseStyles} text-gray-600 hover:text-[rgb(24,62,105)] p-2 rounded-2xl`;
    }

    if (variant === 'compact') {
      return `${baseStyles} bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm hover:shadow p-2 rounded-2xl text-[rgb(24,62,105)]`;
    }

    switch (position) {
    case 'header':
      return `${baseStyles} bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm hover:shadow-md px-3 py-2 rounded-2xl text-[rgb(24,62,105)]`;
    case 'footer':
      return `${baseStyles} bg-gray-800 text-white hover:bg-gray-700 px-3 py-2 rounded-2xl`;
    case 'sidebar':
      return `${baseStyles} bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-2xl text-[rgb(24,62,105)]`;
    case 'floating':
      return `${baseStyles} bg-white/95 border border-gray-200 shadow-md hover:shadow-lg px-3 py-2 rounded-2xl text-[rgb(24,62,105)] fixed bottom-4 right-4 z-50`;
    default:
      return `${baseStyles} bg-white border border-gray-200 shadow-sm hover:shadow px-3 py-2 rounded-2xl text-[rgb(24,62,105)]`;
    }
  };

  // Dropdown menu styles based on position and variant
  const getDropdownStyles = () => {
    const baseStyles =
      'absolute z-50 bg-white/95 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden border border-gray-100 backdrop-blur-sm';

    switch (position) {
    case 'header':
      return `${baseStyles} right-0 w-48 mt-2 transform ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-200`;
    case 'footer':
      return `${baseStyles} bottom-full mb-2 left-0 w-48 transform ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-200`;
    case 'sidebar':
      return `${baseStyles} right-0 w-48 mt-2 transform ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-200`;
    case 'floating':
      return `${baseStyles} bottom-full mb-2 right-0 w-48 transform ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-200`;
    default:
      return `${baseStyles} right-0 w-48 mt-2 transform ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-200`;
    }
  };

  // ARIA label for accessibility
  const getAriaLabel = () => {
    return t('languageSelector', {
      fallback: 'Language selector, current language: ' + currentLanguage.name,
    });
  };

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
      aria-label={getAriaLabel()}
    >
      {/* Language Selector Button with Micro-animations */}
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`${getButtonStyles()} ${isUpdating ? 'opacity-70 cursor-wait' : ''} flex items-center space-x-2 group`}
        disabled={isUpdating}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={getAriaLabel()}
      >
        {/* Show flag if enabled with subtle hover animation */}
        {showFlags && (
          <span
            className="text-lg transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          >
            {currentLanguage.flag}
          </span>
        )}

        {/* Show language name depending on variant */}
        {variant === 'full' && showLanguageName && (
          <span className="transition-colors duration-300 group-hover:text-[rgb(236,107,44)]">
            {currentLanguage.name}
          </span>
        )}

        {/* Dropdown indicator with animation */}
        <svg
          className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''} group-hover:text-[rgb(236,107,44)]`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu with Animation */}
      {isOpen && (
        <div
          className={getDropdownStyles()}
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
                  w-full text-left px-4 py-2 text-sm 
                  ${
              language.code === currentLocale
                ? 'bg-gray-50 text-[rgb(24,62,105)] font-medium'
                : 'text-gray-700 hover:bg-gray-50 hover:text-[rgb(24,62,105)]'
              } 
                  transition-all duration-200
                  flex items-center space-x-3
                  animate-fade-in-up
                  focus:outline-none focus:bg-gray-50 focus:text-[rgb(24,62,105)]
                `}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationDuration: '400ms',
                }}
                role="menuitem"
                tabIndex={0}
                aria-current={
                  language.code === currentLocale ? 'true' : 'false'
                }
              >
                {showFlags && (
                  <span
                    className="text-lg transition-transform duration-200 hover:scale-110"
                    aria-hidden="true"
                  >
                    {language.flag}
                  </span>
                )}
                <span>{language.name}</span>

                {/* Checkmark for selected language with animation */}
                {language.code === currentLocale && (
                  <svg
                    className="ml-auto h-5 w-5 text-[rgb(236,107,44)] animate-scale-in"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    style={{ animationDuration: '300ms' }}
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
        </div>
      )}
    </div>
  );
}

// Export the component wrapped with safe translations
export default withSafeTranslations(EnhancedLanguageSelector);
