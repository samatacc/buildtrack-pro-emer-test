import React, { useEffect, useState } from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import dynamic from 'next/dynamic';
import { PlusCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useWidgets } from '../../../lib/contexts/WidgetContext';
import { WidgetType } from '@/lib/types/widget';
import DndProvider from '@/lib/providers/DndProvider';

// Import the WidgetSelector modal
const WidgetSelector = dynamic(() => import('@/app/components/dashboard/widgets/WidgetSelector'), {
  ssr: false,
});

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
  // Add fallback message handling to prevent rendering failures
  const { t } = useTranslations('dashboard');
  
  // State for widget selector modal
  const [isWidgetSelectorOpen, setIsWidgetSelectorOpen] = useState(false);
  
  // Safe translation function that won't crash on missing keys
  const safeT = (key: string, defaultMessage: string = '', params: Record<string, any> = {}) => {
    try {
      return t(key, params);
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return defaultMessage || key.split('.').pop() || 'Translation Error';
    }
  };
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

  // Define breakpoints and columns for responsive layout
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 9, sm: 6, xs: 4, xxs: 2 };
  
  // Define different row heights based on screen size for better mobile view
  const rowHeights = { lg: 100, md: 90, sm: 75, xs: 65, xxs: 55 };
  
  // Define margin sizes based on screen size for better spacing
  const margins: { [key: string]: [number, number] } = { 
    lg: [20, 20], 
    md: [15, 15], 
    sm: [12, 12], 
    xs: [10, 10], 
    xxs: [8, 8] 
  };
  
  // State to track current breakpoint for responsive adjustments
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  
  // Handle breakpoint change
  const handleBreakpointChange = (newBreakpoint: string) => {
    setCurrentBreakpoint(newBreakpoint);
  };

  // Save layout when it changes if not in edit mode
  const handleLayoutChange = (layout: any) => {
    updateWidgetLayout(layout);
    if (!isEditMode) {
      saveDashboard();
    }
  };

  // Handle opening widget selector modal
  const openWidgetSelector = () => {
    setIsWidgetSelectorOpen(true);
  };
  
  // Close widget selector modal
  const closeWidgetSelector = () => {
    setIsWidgetSelectorOpen(false);
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
          <p className="text-xl font-semibold">{safeT('dashboard.error', 'Dashboard Error')}</p>
          <p className="mt-2">{error.message}</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {safeT('dashboard.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardConfig) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold">{safeT('dashboard.noDashboard', 'No Dashboard Found')}</p>
          <p className="mt-2">{safeT('dashboard.createFirst', 'Create your first dashboard to get started')}</p>
          <button 
            onClick={() => loadDashboard()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {safeT('dashboard.createDefault', 'Create Default Dashboard')}
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
                {safeT('dashboard.cancel', 'Cancel')}
              </button>
              
              <button
                onClick={handleSave}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {safeT('dashboard.saveLayout', 'Save Layout')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRefresh}
                className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                aria-label={safeT('dashboard.refresh', 'Refresh Dashboard')}
                title={safeT('dashboard.refresh', 'Refresh Dashboard')}
                data-testid="refresh-dashboard-button"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={openWidgetSelector}
                className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                aria-label={safeT('dashboard.addWidget', 'Add Widget')}
                title={safeT('dashboard.addWidget', 'Add Widget')}
                data-testid="add-widget-button"
              >
                <PlusCircleIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleEditMode}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                data-testid="toggle-edit-mode-button"
              >
                {safeT('dashboard.editLayout', 'Edit Layout')}
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Widget Selector Modal */}
      <WidgetSelector 
        isOpen={isWidgetSelectorOpen} 
        onClose={closeWidgetSelector}
        screenSize={currentBreakpoint} 
      />
      
      {/* Dashboard Grid Layout */}
      <div className="flex-1 overflow-hidden">
        {dashboardConfig.widgets.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-semibold">{safeT('dashboard.noWidgets', 'No Widgets Found')}</p>
              <p className="mt-2">{safeT('dashboard.addWidgetPrompt', 'Click the button below to add your first widget')}</p>
              <button 
                onClick={openWidgetSelector}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {safeT('dashboard.addWidget', 'Add Widget')}
              </button>
            </div>
          </div>
        ) : (
          <GridLayout
            className="layout"
            layouts={{
              lg: currentLayout,
              md: currentLayout.map(item => ({
                ...item,
                w: Math.min(item.w, cols.md), // Ensure width doesn't exceed column count
                h: Math.max(Math.round(item.h * 0.9), 2) // Scale height but keep minimum
              })),
              sm: currentLayout.map(item => ({
                ...item,
                w: Math.min(item.w, cols.sm),
                x: item.w > cols.sm ? 0 : item.x, // Reset x position if width exceeds columns
                h: Math.max(Math.round(item.h * 0.85), 2)
              })),
              xs: currentLayout.map(item => ({
                ...item,
                w: Math.min(item.w, cols.xs),
                x: Math.min(item.x, cols.xs - Math.min(item.w, cols.xs)), // Ensure item stays within bounds
                h: Math.max(Math.round(item.h * 0.8), 2)
              })),
              xxs: currentLayout.map(item => ({
                ...item,
                w: cols.xxs, // Full width on smallest screens
                x: 0, // Always start at the beginning of the row
                h: Math.max(Math.round(item.h * 0.75), 2)
              }))
            }}
            breakpoints={breakpoints}
            cols={cols}
            rowHeight={rowHeights[currentBreakpoint as keyof typeof rowHeights] || 100}
            width={1200} // This will be overridden with the actual container width
            isDraggable={isEditMode}
            isResizable={isEditMode}
            onLayoutChange={handleLayoutChange}
            onBreakpointChange={handleBreakpointChange}
            compactType="vertical"
            useCSSTransforms={true}
            margin={margins[currentBreakpoint as keyof typeof margins]}
            containerPadding={currentBreakpoint === 'xxs' ? [5, 5] : [10, 10]}
            draggableHandle=".widget-drag-handle"
            autoSize={true}
          >
            {dashboardConfig.widgets.map((widget) => (
              <div key={widget.id} className="h-full">
                <div className="flex flex-col h-full rounded-lg overflow-hidden shadow bg-white dark:bg-gray-800 transition-all">
                  {/* Widget drag handle - only visible in edit mode */}
                  {isEditMode && (
                    <div className="widget-drag-handle bg-gray-100 dark:bg-gray-700 h-6 flex items-center justify-center cursor-move border-b border-gray-200 dark:border-gray-600">
                      <span className="h-1 w-8 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                    </div>
                  )}
                  <WidgetRegistry 
                    widgetId={widget.id} 
                    screenSize={currentBreakpoint}
                  />
                </div>
              </div>
            ))}
          </GridLayout>
        )}
      </div>
    </div>
  );
};

const WrappedDashboardLayout = (props: DashboardLayoutProps) => {
  return (
    <DndProvider>
      <DashboardLayout {...props} />
    </DndProvider>
  );
};

export default WrappedDashboardLayout;
