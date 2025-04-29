import React, { useState } from 'react';
import { useTranslation } from 'next-intl';
import { 
  ArrowsPointingOutIcon, 
  ArrowsPointingInIcon, 
  Cog6ToothIcon, 
  XMarkIcon, 
  EyeIcon, 
  EyeSlashIcon 
} from '@heroicons/react/24/outline';
import { useWidgets } from '@/lib/contexts/WidgetContext';
import type { Widget } from '@/lib/contexts/WidgetContext';

interface WidgetContainerProps {
  widget: Widget;
  children: React.ReactNode;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({ widget, children }) => {
  const { t } = useTranslation('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { 
    isEditMode, 
    removeWidget, 
    toggleWidgetVisibility, 
    updateWidgetSettings 
  } = useWidgets();

  const handleToggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    // In a real implementation, this would trigger a layout change
  };

  const handleRemoveWidget = () => {
    if (confirm(t('widget.confirmRemove'))) {
      removeWidget(widget.id);
    }
  };

  const handleToggleVisibility = () => {
    toggleWidgetVisibility(widget.id);
  };

  return (
    <div 
      className={`flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all ${
        isExpanded ? 'absolute inset-4 z-50' : 'h-full'
      }`}
      data-testid={`widget-${widget.id}`}
      aria-label={widget.title}
      role="region"
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white truncate">
          {widget.title}
        </h3>
        
        <div className="flex items-center space-x-1">
          {/* Widget Controls - Only shown in edit mode or when settings/expand are active */}
          {(isEditMode || isSettingsOpen || isExpanded) && (
            <>
              {/* Visibility Toggle */}
              <button
                onClick={handleToggleVisibility}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                aria-label={widget.isVisible ? t('widget.hide') : t('widget.show')}
                title={widget.isVisible ? t('widget.hide') : t('widget.show')}
              >
                {widget.isVisible ? (
                  <EyeIcon className="w-5 h-5" />
                ) : (
                  <EyeSlashIcon className="w-5 h-5" />
                )}
              </button>
              
              {/* Settings Toggle */}
              <button
                onClick={handleToggleSettings}
                className={`p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 ${
                  isSettingsOpen ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
                aria-label={t('widget.settings')}
                title={t('widget.settings')}
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
              
              {/* Expand/Collapse Toggle */}
              <button
                onClick={handleToggleExpand}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                aria-label={isExpanded ? t('widget.collapse') : t('widget.expand')}
                title={isExpanded ? t('widget.collapse') : t('widget.expand')}
              >
                {isExpanded ? (
                  <ArrowsPointingInIcon className="w-5 h-5" />
                ) : (
                  <ArrowsPointingOutIcon className="w-5 h-5" />
                )}
              </button>
              
              {/* Remove Widget (only in edit mode) */}
              {isEditMode && (
                <button
                  onClick={handleRemoveWidget}
                  className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
                  aria-label={t('widget.remove')}
                  title={t('widget.remove')}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Widget Content */}
      <div className={`flex-1 overflow-auto p-4 ${!widget.isVisible ? 'opacity-50' : ''}`}>
        {isSettingsOpen ? (
          // Settings Panel - would be customized per widget type
          <div className="h-full flex flex-col">
            <h4 className="font-medium mb-4">{t('widget.settingsTitle')}</h4>
            <div className="space-y-4">
              {/* Example settings controls */}
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor={`${widget.id}-refresh-rate`}>
                  {t('widget.settingsRefreshRate')}
                </label>
                <select 
                  id={`${widget.id}-refresh-rate`}
                  className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  value={widget.settings?.refreshRate || 'auto'}
                  onChange={(e) => updateWidgetSettings(widget.id, { 
                    ...widget.settings, 
                    refreshRate: e.target.value 
                  })}
                >
                  <option value="auto">{t('widget.refreshAuto')}</option>
                  <option value="30">{t('widget.refresh30Sec')}</option>
                  <option value="60">{t('widget.refresh1Min')}</option>
                  <option value="300">{t('widget.refresh5Min')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor={`${widget.id}-display-mode`}>
                  {t('widget.settingsDisplayMode')}
                </label>
                <select 
                  id={`${widget.id}-display-mode`}
                  className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  value={widget.settings?.displayMode || 'detailed'}
                  onChange={(e) => updateWidgetSettings(widget.id, { 
                    ...widget.settings, 
                    displayMode: e.target.value 
                  })}
                >
                  <option value="compact">{t('widget.displayCompact')}</option>
                  <option value="detailed">{t('widget.displayDetailed')}</option>
                </select>
              </div>
            </div>
            
            <div className="mt-auto pt-4">
              <button
                onClick={handleToggleSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t('widget.saveSettings')}
              </button>
            </div>
          </div>
        ) : (
          // Regular widget content
          children
        )}
      </div>
    </div>
  );
};

export default WidgetContainer;
