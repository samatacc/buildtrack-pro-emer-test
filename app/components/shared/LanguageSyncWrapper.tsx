'use client';

import { useProfileLanguageSync } from '../../../app/hooks/useProfileLanguageSync';
import { ReactNode } from 'react';

interface LanguageSyncWrapperProps {
  children: ReactNode;
}

/**
 * LanguageSyncWrapper component
 * 
 * Ensures that user language preferences are synchronized between
 * the profile settings and the UI.
 * 
 * Following BuildTrack Pro's mobile-first approach with the specified
 * design system using Primary Blue (rgb(24,62,105)) and Primary Orange
 * (rgb(236,107,44)).
 */
export default function LanguageSyncWrapper({ children }: LanguageSyncWrapperProps) {
  // Initialize the profile language sync hook
  useProfileLanguageSync();
  
  // This is just a wrapper component that adds the side effect
  // of synchronizing the language, it doesn't render anything extra
  return <>{children}</>;
}
