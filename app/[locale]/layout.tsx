import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SupabaseAuthProvider } from '../../lib/auth/SupabaseAuthContext'
import { notFound } from 'next/navigation'
import { locales, defaultLocale } from '../../i18n'

// Import animation styles
import '../styles/animations.css'

// Import components for providers
import QueryProvider from '../providers/QueryProviderClient'
import IntlProvider from '../providers/IntlProviderClient'

// Use a simpler font setup
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BuildTrack Pro - Construction Management Solution',
  description: 'Streamline your construction projects with our all-in-one management platform',
}

// Generate static params for all supported locales
export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

/**
 * Simplified Locale Layout
 * 
 * This is a minimal version of the locale layout with improved error handling
 * for internationalization to restore basic functionality.
 */
export default async function LocaleLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode,
  params: { locale: string }
}>) {
  // Validate that the locale is supported, default to English if not
  if (!locales.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}, defaulting to ${defaultLocale}`);
    locale = defaultLocale;
  }
  
  // Load messages with robust error handling
  let messages = {};
  try {
    // Try to load combined messages file first
    try {
      messages = (await import(`../../messages/${locale}.json`)).default;
      console.log(`Successfully loaded combined messages for locale: ${locale}`);
    } catch (error) {
      console.warn(`Could not load combined messages for ${locale}, trying individual files...`);
      
      // Try to load individual namespace files
      const commonMessages = await import(`../../messages/${locale}/common.json`).then(m => m.default).catch(() => ({}));
      const authMessages = await import(`../../messages/${locale}/auth.json`).then(m => m.default).catch(() => ({}));
      const marketingMessages = await import(`../../messages/${locale}/marketing.json`).then(m => m.default).catch(() => ({}));
      const dashboardMessages = await import(`../../messages/${locale}/dashboard.json`).then(m => m.default).catch(() => ({}));
      
      // Combine all namespace messages
      messages = {
        common: commonMessages,
        auth: authMessages,
        marketing: marketingMessages,
        dashboard: dashboardMessages
      };
      
      console.log(`Loaded individual message files for locale: ${locale}`);
    }
  } catch (error) {
    console.error(`Failed to load any messages for locale ${locale}:`, error);
    // Provide fallback messages to prevent crashes
    messages = {
      common: {
        app: {
          name: 'BuildTrack Pro',
          tagline: 'Construction Project Management'
        },
        actions: {
          save: 'Save',
          cancel: 'Cancel',
          confirm: 'Confirm'
        }
      }
    };
  }
  
  return (
    <html lang={locale}>
      <body className={inter.className}>
        <SupabaseAuthProvider>
          <QueryProvider>
            <IntlProvider 
              locale={locale} 
              messages={messages}
              timeZone="UTC"
            >
              {children}
            </IntlProvider>
          </QueryProvider>
        </SupabaseAuthProvider>
      </body>
    </html>
  )
}
