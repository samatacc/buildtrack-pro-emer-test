'use client';

import { useState } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import DashboardControl from '@/app/components/admin/DashboardControl';
import SubscriberManagement from '@/app/components/admin/SubscriberManagement';
import FeatureToggles from '@/app/components/admin/FeatureToggles';
import ConnectionStatus from '@/app/components/shared/ConnectionStatus';

/**
 * AdminConsole Component
 * 
 * Main admin page for BuildTrack Pro, providing access to all administrative
 * functions with full internationalization support.
 * 
 * Follows BuildTrack Pro's design principles:
 * - Primary Blue (rgb(24,62,105))
 * - Primary Orange (rgb(236,107,44))
 * - Mobile-first responsive design
 * - Full accessibility compliance
 * - Performance optimization for field environments
 */
export default function AdminConsole() {
  const { t, metrics } = useNamespacedTranslations('admin');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Define tabs
  const tabs = [
    { id: 'dashboard', label: t('tabs.dashboard') },
    { id: 'subscribers', label: t('tabs.subscribers') },
    { id: 'features', label: t('tabs.features') },
    { id: 'documents', label: t('tabs.documents') }
  ];
  
  return (
    <div className="pb-10">
      {/* Page header with connection status */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto relative">
        {/* Online/Offline Connection Status Indicator */}
        <ConnectionStatus />
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[rgb(24,62,105)] mb-2">
            {t('adminConsole')}
          </h1>
          <p className="text-gray-500">
            {t('adminDescription')}
            {metrics && <span className="text-xs ml-2">({t('loadedIn')} {metrics.loadTime}ms)</span>}
          </p>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-[rgb(236,107,44)] text-[rgb(236,107,44)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Dashboard Control Tab */}
        {activeTab === 'dashboard' && (
          <DashboardControl />
        )}
        
        {/* Subscriber Management Tab */}
        {activeTab === 'subscribers' && (
          <SubscriberManagement />
        )}
        
        {/* Feature Toggles Tab */}
        {activeTab === 'features' && (
          <FeatureToggles />
        )}
        
        {/* Documents Tab - Placeholder for Phase 3 */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-[rgb(24,62,105)] mb-4">{t('documentManager')}</h2>
            <p className="text-gray-500 mb-4">{t('documentManagerDescription')}</p>
            
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">{t('comingSoon')}</h3>
              <p className="mt-1 text-sm text-gray-500">{t('documentFeatureRelease')}</p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[rgb(24,62,105)] hover:bg-[rgb(19,49,84)]"
                >
                  {t('getEarlyAccess')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
