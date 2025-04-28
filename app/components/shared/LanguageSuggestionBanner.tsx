'use client';

/**
 * Language Suggestion Banner
 *
 * This component displays a suggestion to switch to the user's browser language
 * when it differs from the current application language.
 *
 * Following BuildTrack Pro's design principles:
 * - Mobile-first responsive design
 * - Primary colors: Blue (rgb(24,62,105)), Orange (rgb(236,107,44))
 * - Neumorphism for subtle depth
 * - Glassmorphism for the banner background
 * - Accessibility-focused with clear text and controls
 */
import React, { useState } from 'react';
import { getLocaleDisplayName } from '@/app/utils/lokaliseConfig';
import { useLanguageDetection } from '@/app/hooks/useLanguageDetection';
import { withSafeTranslations } from '@/app/utils/withSafeTranslations';

// Props are optional when using withSafeTranslations as it injects the t prop
interface LanguageSuggestionBannerProps {
  t?: (key: string) => string;
}

function LanguageSuggestionBanner({ t }: LanguageSuggestionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const {
    detectedLocale,
    suggestChange,
    currentLocale,
    applyDetectedLanguage,
  } = useLanguageDetection();

  // If t wasn't provided (which shouldn't happen with the HOC), use a fallback
  const translate =
    t ||
    ((key: string) => {
      // Simple fallback to handle basic cases if the HOC somehow doesn't provide t
      if (key === 'common.languageSuggestion.detected')
        return 'Language detected';
      if (key === 'common.languageSuggestion.message')
        return 'We detected your browser language. Would you like to switch?';
      if (key === 'common.languageSuggestion.switchTo')
        return 'Switch to {language}';
      if (key === 'common.languageSuggestion.noThanks') return 'No, thanks';
      return key.split('.').pop() || key;
    });

  // Don't render if the banner should not be shown
  if (!suggestChange || dismissed || detectedLocale === currentLocale) {
    return null;
  }

  const detectedLanguageName = getLocaleDisplayName(detectedLocale);
  const currentLanguageName = getLocaleDisplayName(currentLocale);

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleApply = async () => {
    await applyDetectedLanguage();
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-0">
      <div className="max-w-5xl mx-auto">
        <div
          className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl 
                     p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between
                     transform transition-transform animate-fade-in-up"
        >
          <div className="mb-3 sm:mb-0">
            <p className="text-[rgb(24,62,105)] text-sm md:text-base">
              <span className="font-medium">
                {translate('common.languageSuggestion.detected')}:{' '}
              </span>
              {translate('common.languageSuggestion.message')
                .replace('{detectedLanguage}', detectedLanguageName)
                .replace('{currentLanguage}', currentLanguageName)}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 border border-[rgb(24,62,105)] text-[rgb(24,62,105)] 
                         rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              aria-label={translate('common.languageSuggestion.noThanks')}
            >
              {translate('common.languageSuggestion.noThanks')}
            </button>

            <button
              onClick={handleApply}
              className="px-3 py-1.5 bg-[rgb(236,107,44)] text-white 
                         rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
              aria-label={translate(
                'common.languageSuggestion.switchTo',
              ).replace('{language}', detectedLanguageName)}
            >
              {translate('common.languageSuggestion.switchTo').replace(
                '{language}',
                detectedLanguageName,
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export with HOC for safe translations
export default withSafeTranslations(LanguageSuggestionBanner, 'common');
