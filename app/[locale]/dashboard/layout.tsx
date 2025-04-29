import React from 'react';
import { getTranslations } from 'next-intl/server';
import DashboardLayoutClient from './layout-client';
import { UnifiedAuthProvider } from '../../../lib/auth/UnifiedAuthProvider';
import { NavigationProvider } from '../../../app/contexts/NavigationContext';

/**
 * Dashboard Layout Server Component
 * 
 * Provides the outer wrapper for the dashboard, handling:
 * - Server-side internationalization (translations)
 * - Authentication context provider
 * - Core layout structure
 * 
 * This component delegates client-side functionality to DashboardLayoutClient
 */

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

/**
 * Dashboard Layout Component
 * 
 * Provides the layout structure for all dashboard pages including
 * the enhanced profile management system. Implements internationalization
 * support through the LanguageSelector component and useTranslations hook.
 * 
 * Features BuildTrack Pro's design system with:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 * - Light neumorphism for subtle depth
 * - Glassmorphism for overlays/modals and UI panels
 * - Mobile-first responsive design
 */
export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  // Get translations for the dashboard
  const t = await getTranslations({ locale: params.locale, namespace: 'dashboard' });
  
  // Prepare translations for the dashboard navigation
  const translations = {
    dashboard: t('navigation.dashboard', { fallback: 'Dashboard' }),
    projects: t('navigation.projects', { fallback: 'Projects' }),
    tasks: t('navigation.tasks', { fallback: 'Tasks' }),
    materials: t('navigation.materials', { fallback: 'Materials' }),
    documents: t('navigation.documents', { fallback: 'Documents' }),
    reports: t('navigation.reports', { fallback: 'Reports' }),
    team: t('navigation.team', { fallback: 'Team' }),
    schedule: t('navigation.schedule', { fallback: 'Schedule' }),
    settings: t('navigation.settings', { fallback: 'Settings' }),
    collapse: t('navigation.collapse', { fallback: 'Collapse' }),
    expand: t('navigation.expand', { fallback: 'Expand' }),
    search: t('navigation.search', { fallback: 'Search' }),
    notifications: t('navigation.notifications', { fallback: 'Notifications' }),
    profile: t('navigation.profile', { fallback: 'Profile' }),
    help: t('navigation.help', { fallback: 'Help & Support' }),
    logout: t('navigation.logout', { fallback: 'Log out' }),
    searchPlaceholder: t('navigation.searchPlaceholder', { fallback: 'Search BuildTrack Pro...' }),
  };

  return (
    <UnifiedAuthProvider>
      <NavigationProvider>
        <DashboardLayoutClient
          locale={params.locale}
          translations={translations}
        >
          {children}
        </DashboardLayoutClient>
      </NavigationProvider>
    </UnifiedAuthProvider>
  );
}
