'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

/**
 * IntlProvider Component
 * 
 * Provides internationalization context to the application.
 * Supporting multiple languages for BuildTrack Pro's diverse user base.
 */
type IntlProviderProps = {
  locale: string;
  messages: Record<string, any>;
  children: ReactNode;
  timeZone?: string;
};

export default function IntlProvider({ 
  locale, 
  messages, 
  children,
  timeZone = 'UTC'
}: IntlProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
      formats={{
        dateTime: {
          short: { day: 'numeric', month: 'short' },
          long: { day: 'numeric', month: 'long', year: 'numeric' }
        }
      }}
      now={new Date()}
    >
      {children}
    </NextIntlClientProvider>
  );
}
