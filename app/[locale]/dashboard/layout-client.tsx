'use client';

import React from 'react';
import { useUnifiedAuth } from '../../../lib/auth/UnifiedAuthProvider';
import { useNavigation } from '../../contexts/NavigationContext';
import Sidebar from '../../components/navigation/Sidebar';
import Header from '../../components/navigation/Header';
import Breadcrumbs from '../../components/navigation/Breadcrumbs';
import MobileNav from '../../components/navigation/MobileNav';
import ConnectionStatus from '../../components/shared/ConnectionStatus';

/**
 * Dashboard Layout Client Component
 * 
 * Handles the client-side functionality for the dashboard layout, including:
 * - Sidebar navigation with collapsible feature
 * - Header with search, notifications, and profile
 * - Mobile responsiveness with appropriate breakpoints
 * - Authentication state management
 * - Network connectivity monitoring
 * 
 * Follows BuildTrack Pro's design system with:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 * - Mobile-first approach for construction professionals in the field
 */

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  locale: string;
  translations: {
    dashboard: string;
    projects: string;
    tasks: string;
    materials: string;
    documents: string;
    reports: string;
    team: string;
    schedule: string;
    settings: string;
    collapse: string;
    expand: string;
    search: string;
    notifications: string;
    profile: string;
    help: string;
    logout: string;
    searchPlaceholder: string;
  };
}

export default function DashboardLayoutClient({ 
  children, 
  locale,
  translations 
}: DashboardLayoutClientProps) {
  const { user, isAuthenticated, isLoading } = useUnifiedAuth();
  const { isSidebarCollapsed, toggleSidebar } = useNavigation();
  
  // Use the sidebar state from navigation context instead of local state
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(24,62,105)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Not authenticated state
  if (!isAuthenticated) {
    // This will be handled by middleware redirecting to login
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Session expired or not authenticated</p>
          <a 
            href={`/${locale}/auth/login`}
            className="px-4 py-2 bg-[rgb(24,62,105)] text-white rounded-md hover:bg-[rgb(19,50,86)] transition-colors"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Hidden on mobile when collapsed */}
      <div className={`${!isSidebarCollapsed ? 'block' : 'hidden md:block'} flex-shrink-0 transition-all duration-300 ease-in-out`}>
        <Sidebar 
          locale={locale}
          translations={translations}
        />
      </div>
      
      {/* Mobile sidebar overlay */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          locale={locale}
          translations={translations}
        />
        
        {/* Breadcrumbs (below header) */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 hidden md:block">
          <Breadcrumbs 
            locale={locale} 
            homeLinkText={translations.dashboard}
            customSegments={{
              'projects': translations.projects,
              'tasks': translations.tasks,
              'materials': translations.materials,
              'documents': translations.documents,
              'reports': translations.reports,
              'team': translations.team,
              'settings': translations.settings,
            }}
          />
        </div>
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 pb-20 md:pb-4">
          {/* Page Content */}
          {children}
        </main>
        
        {/* Footer (only visible on desktop) */}
        <footer className="bg-white border-t border-gray-200 py-3 px-4 text-center text-sm text-gray-500 hidden md:block">
          <p>© {new Date().getFullYear()} BuildTrack Pro. All rights reserved.</p>
        </footer>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav 
        locale={locale}
        translations={translations}
      />
      
      {/* Connection Status */}
      <ConnectionStatus />
    </div>
  );
}
