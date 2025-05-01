import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useWidgets } from '@/lib/contexts/WidgetContext';
import { useTranslations } from '@/app/hooks/useTranslations';
import { WidgetType } from '@/lib/types/widget';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/outline';

// Import widgets
import ActiveProjectsWidget from './widgets/project/ActiveProjectsWidget';
import ProjectTimelineWidget from './widgets/project/ProjectTimelineWidget';
import MyTasksWidget from './widgets/task/MyTasksWidget';
import PlaceholderWidget from './widgets/PlaceholderWidget';

// Enable responsive features for GridLayout
const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  className?: string;
}

// Map of widget types to components
const WIDGET_COMPONENTS: Record<string, React.FC<any>> = {
  'project_timeline': ProjectTimelineWidget,
  'active_projects': ActiveProjectsWidget,
  'my_tasks': MyTasksWidget,
  // Add other widgets here as they are implemented
};

const DashboardGrid: React.FC<DashboardGridProps> = ({ className = '' }) => {
  const { t } = useTranslations('dashboard');
  const { 
    userWidgets, 
    currentLayout, 
    updateWidgetLayout, 
    saveDashboard,
    isEditMode, 
    toggleEditMode,
    isLoading
  } = useWidgets();
  
  const [isMounted, setIsMounted] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Ensure we're mounted before rendering react-grid-layout to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Watch for layout changes to track unsaved changes
  useEffect(() => {
    if (isMounted) {
      setUnsavedChanges(true);
    }
  }, [currentLayout]);
  
  // Handle layout change
  const handleLayoutChange = (layout: any) => {
    if (isMounted) {
      updateWidgetLayout(layout);
    }
  };
  
  // Handle save
  const handleSave = async () => {
    const success = await saveDashboard();
    if (success) {
      setUnsavedChanges(false);
    }
  };
  
  // Render widget based on type
  const renderWidget = (type: WidgetType) => {
    switch (type) {
      case WidgetType.ACTIVE_PROJECTS:
        return <ActiveProjectsWidget isEditMode={isEditMode} />;
      case WidgetType.PROJECT_TIMELINE:
        return <ProjectTimelineWidget isEditMode={isEditMode} />;
      case WidgetType.MY_TASKS:
        return <MyTasksWidget isEditMode={isEditMode} />;
      default:
        return <PlaceholderWidget type={type} isEditMode={isEditMode} />;
    }
  };
  
  // If not mounted yet, show loading
  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(24,62,105)]"></div>
      </div>
    );
  }
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative">
        {/* Dashboard actions */}
        <div className="absolute top-0 right-0 z-10 flex gap-2 p-4">
          {isEditMode && (
            <>
              <button
                onClick={handleSave}
                disabled={!unsavedChanges}
                className={`px-3 py-1.5 text-sm rounded-md border shadow-sm ${
                  unsavedChanges
                    ? 'bg-[rgb(236,107,44)] text-white hover:bg-[rgb(216,87,24)]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                }`}
              >
                {t('actions.saveLayout')}
              </button>
              
              <button
                onClick={toggleEditMode}
                className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
              >
                {t('actions.doneEditing')}
              </button>
            </>
          )}
          
          {!isEditMode && (
            <button
              onClick={toggleEditMode}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
            >
              {t('actions.editDashboard')}
            </button>
          )}
        </div>
        
        {/* Grid */}
        <ResponsiveGridLayout
          className={`min-h-[500px] ${className}`}
          layouts={{ lg: currentLayout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
          compactType="vertical"
          margin={[16, 16]}
          containerPadding={[16, 16]}
          draggableHandle=".drag-handle"
        >
          {currentLayout.map((item) => {
            const widget = userWidgets.find(w => w.id === item.i);
            
            if (!widget || !widget.isVisible) return null;
            
            return (
              <div 
                key={item.i} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                data-widget-id={item.i}
                data-widget-type={widget.type}
              >
                {renderWidget(widget.type)}
              </div>
            );
          })}
        </ResponsiveGridLayout>
        
        {/* Empty state */}
        {currentLayout.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
              {t('dashboard.emptyState.title')}
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
              {t('dashboard.emptyState.description')}
            </p>
            <button
              onClick={toggleEditMode}
              className="px-4 py-2 bg-[rgb(24,62,105)] text-white rounded-md hover:bg-[rgb(19,49,84)]"
            >
              {t('dashboard.emptyState.addWidgets')}
            </button>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default DashboardGrid;
