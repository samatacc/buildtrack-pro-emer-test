import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SupabaseAuthProvider } from '../../lib/auth/SupabaseAuthContext'
import QueryProvider from '../providers/QueryProvider'
import NetworkAwareDataFetcher from '../components/shared/NetworkAwareDataFetcher'
import IntlProvider from '../providers/IntlProvider'
import { useLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n'
import LanguageSyncWrapper from '../components/shared/LanguageSyncWrapper'

// Import animation styles
import '../styles/animations.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BuildTrack Pro - Construction Management Solution',
  description: 'Streamline your construction projects with our all-in-one management platform',
}

// Generate static params for all supported locales
export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode,
  params: { locale: string }
}>) {
  // Validate that the locale is supported
  if (!locales.includes(locale)) {
    notFound()
  }
  
  // Import the messages for the current locale
  const messages = (await import(`../../messages/${locale}.json`)).default
  
  return (
    <html lang={locale}>
      <body className={inter.className}>
        <SupabaseAuthProvider>
          <QueryProvider>
            <IntlProvider locale={locale} messages={messages}>
              <NetworkAwareDataFetcher>
                <LanguageSyncWrapper>
                  {children}
                </LanguageSyncWrapper>
              </NetworkAwareDataFetcher>
            </IntlProvider>
          </QueryProvider>
        </SupabaseAuthProvider>
      </body>
    </html>
  )
}
