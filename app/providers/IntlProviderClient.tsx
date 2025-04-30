'use client'

import React from 'react'
import { NextIntlClientProvider } from 'next-intl'

/**
 * IntlProviderClient
 * 
 * Client component wrapper for Next-Intl internationalization
 * Follows BuildTrack Pro's client-server component architecture
 */
export default function IntlProviderClient({ 
  locale, 
  messages, 
  children,
  timeZone = 'UTC'
}: { 
  locale: string;
  messages: Record<string, any>;
  children: React.ReactNode;
  timeZone?: string;
}) {
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
    >
      {children}
    </NextIntlClientProvider>
  );
}
