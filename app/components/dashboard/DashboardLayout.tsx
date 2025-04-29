import React, { useEffect } from 'react';
import { useTranslation } from 'next-intl';
import dynamic from 'next/dynamic';
import { PlusCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useWidgets } from '@/lib/contexts/WidgetContext';
import { WidgetType } from '@/lib/types/widget';

// Import ReactGridLayout dynamically to avoid SSR issues
const GridLayout = dynamic(
  () => import('react-grid-layout').then((mod) => mod.Responsive),
  { ssr: false }
);

// Import the required CSS for react-grid-layout
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Import widget components
const WidgetRegistry = dynamic(() => import('@/app/components/dashboard/widgets/WidgetRegistry'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center">Loading widgets...</div>
});

interface DashboardLayoutProps {
  className?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ className }) => {
  const { t } = useTranslation('dashboard');
  const { 
    dashboardConfig, 
    currentLayout, 
    isEditMode, 
    isLoading, 
    error,
    loadDashboard,
    saveDashboard,
    updateWidgetLayout,
    toggleEditMode,
    addWidget,
  } = useWidgets();

  // Define breakpoints for responsive layout
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

  // Save layout when it changes if not in edit mode
  const handleLayoutChange = (layout: any) => {
    updateWidgetLayout(layout);
    if (!isEditMode) {
      saveDashboard();
    }
  };

  // Handle widget addition
  const openWidgetSelector = () => {
    // In a real implementation, this would open a modal with widget options
    // For now, just add a default widget
    addWidget(WidgetType.ACTIVE_PROJECTS);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadDashboard(dashboardConfig?.id);
  };

  // Handle save
  const handleSave = () => {
    saveDashboard();
    toggleEditMode(); // Exit edit mode after saving
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reload to discard changes
    loadDashboard(dashboardConfig?.id);
    toggleEditMode();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-2">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">{t('dashboard.error')}</p>
          <p className="mt-2">{error.message}</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('dashboard.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardConfig) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold">{t('dashboard.noDashboard')}</p>
          <p className="mt-2">{t('dashboard.createFirst')}</p>
          <button 
            onClick={() => loadDashboard()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('dashboard.createDefault')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-4 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {dashboardConfig.name}
        </h1>
        
        <div className="flex items-center space-x-2">
          {isEditMode ? (
            <>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('dashboard.cancel')}
              </button>
              
              <button
                onClick={handleSave}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t('dashboard.saveLayout')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRefresh}
                className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                aria-label={t('dashboard.refresh')}
                title={t('dashboard.refresh')}
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={openWidgetSelector}
                className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                aria-label={t('dashboard.addWidget')}
                title={t('dashboard.addWidget')}
              >
                <PlusCircleIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleEditMode}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('dashboard.editLayout')}
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Dashboard Grid Layout */}
      <div className="flex-1 overflow-hidden">
        {dashboardConfig.widgets.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-semibold">{t('dashboard.noWidgets')}</p>
              <p className="mt-2">{t('dashboard.addWidgetPrompt')}</p>
              <button 
                onClick={openWidgetSelector}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t('dashboard.addWidget')}
              </button>
            </div>
          </div>
        ) : (
          <GridLayout
            className="layout"
            layouts={{ lg: currentLayout }}
            breakpoints={breakpoints}
            cols={cols}
            rowHeight={100}
            width={1200} // This will be overridden with the actual container width
            isDraggable={isEditMode}
            isResizable={isEditMode}
            onLayoutChange={handleLayoutChange}
            compactType="vertical"
            useCSSTransforms={true}
          >
            {dashboardConfig.widgets.map((widget) => (
              <div key={widget.id} className="h-full">
                <WidgetRegistry widgetId={widget.id} />
              </div>
            ))}
          </GridLayout>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
