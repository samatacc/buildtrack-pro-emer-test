'use client';

import { ReactNode, useEffect, useState } from 'react';
import { defaultLocale, locales } from '../../i18n';

interface IntlProviderProps {
  children: ReactNode;
  locale?: string;
  messages?: Record<string, any>;
}

/**
 * IntlProvider Component
 * 
 * This component provides internationalization support for the application.
 * It follows BuildTrack Pro's design system with Primary Blue (rgb(24,62,105))
 * and Primary Orange (rgb(236,107,44)) styling.
 */
export default function IntlProvider({ children, locale = defaultLocale, messages = {} }: IntlProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <div className="intl-provider" lang={locale}>
      {children}
    </div>
  );
}
