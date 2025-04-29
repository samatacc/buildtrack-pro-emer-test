import React from 'react';
import { getTranslations } from 'next-intl/server';
import ReportsClient from '@/app/dashboard/reports/reports-client';

// Define props interface for the page component
interface Props {
  params: { locale: string };
}

// Server component for reports page with proper i18n implementation
export default async function ReportsPage({ params }: Props) {
  // Get the translations for the page content
  const t = await getTranslations('reports');

  return (
    <div className="report-dashboard-container">
      <h1 className="sr-only">{t('dashboardTitle')}</h1>
      <ReportsClient />
    </div>
  );
}

// Generate metadata with translations
export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'reports' });
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  };
}
