import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import { 
  ArrowsPointingOutIcon, 
  ArrowsPointingInIcon, 
  Cog6ToothIcon, 
  XMarkIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowsUpDownIcon,
  ViewColumnsIcon,
  Square2StackIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';
import DragHandle from '@/app/components/dashboard/widgets/DragHandle';
import { useWidgets } from '../../../../lib/contexts/WidgetContext';
import type { Widget } from '../../../../lib/contexts/WidgetContext';
import { WidgetSize } from '@/lib/types/widget';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Layout } from 'react-grid-layout';

interface WidgetContainerProps {
  widget: Widget;
  children: React.ReactNode;
  index?: number;
  moveWidget?: (dragIndex: number, hoverIndex: number) => void;
}

// Used for widget size selector dropdown
interface SizeOption {
  size: WidgetSize;
  label: string;
  icon: React.ReactNode;
  dimensions: string;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({ 
  widget, 
  children, 
  index = 0, 
  moveWidget 
}) => {
  const { t } = useTranslations('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSizeSelectorOpen, setIsSizeSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const sizeSelectorRef = useRef<HTMLDivElement>(null);
  
  const { 
    isEditMode, 
    removeWidget, 
    toggleWidgetVisibility, 
    updateWidgetSettings,
    updateWidgetSize 
  } = useWidgets();
  
  // Set up drag functionality
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'WIDGET',
    item: () => ({ id: widget.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => isEditMode, // Only allow dragging in edit mode
  });
  
  // Use empty image as preview (we'll use custom preview)
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);
  
  // Set up drop functionality
  const [, drop] = useDrop({
    accept: 'WIDGET',
    hover: (item: { id: string, index: number }, monitor) => {
      if (!ref.current || !moveWidget) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;
      
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      // Time to actually perform the action
      moveWidget(dragIndex, hoverIndex);
      
      // Note: We're mutating the monitor item here, which isn't ideal but works for now
      item.index = hoverIndex;
    },
  });
  
  // Initialize drag and drop refs
  drag(drop(ref));

  // Close size selector when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sizeSelectorRef.current && !sizeSelectorRef.current.contains(event.target as Node)) {
        setIsSizeSelectorOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sizeSelectorRef]);

  const handleToggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    // In a real implementation, this would trigger a layout change
  };

  const handleRemoveWidget = async () => {
    if (confirm(t('widget.confirmRemove'))) {
      try {
        setIsLoading(true);
        const success = await removeWidget(widget.id);
        
        if (!success) {
          console.error('Failed to remove widget');
          // Could add error state or toast notification here
        }
      } catch (error) {
        console.error('Error removing widget:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleVisibility = async () => {
    try {
      setIsLoading(true);
      await toggleWidgetVisibility(widget.id);
    } catch (error) {
      console.error('Error toggling widget visibility:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleSizeSelector = () => {
    setIsSizeSelectorOpen(!isSizeSelectorOpen);
  };
  
  const handleSizeChange = async (newSize: WidgetSize) => {
    try {
      setIsLoading(true);
      await updateWidgetSize(widget.id, newSize);
      setIsSizeSelectorOpen(false);
    } catch (error) {
      console.error('Error updating widget size:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Size options for the selector
  const sizeOptions: SizeOption[] = [
    {
      size: WidgetSize.SMALL,
      label: t('widget.sizes.small'),
      icon: <ViewColumnsIcon className="h-5 w-5" />,
      dimensions: '1x1'
    },
    {
      size: WidgetSize.MEDIUM,
      label: t('widget.sizes.medium'),
      icon: <Square2StackIcon className="h-5 w-5" />,
      dimensions: '2x1'
    },
    {
      size: WidgetSize.LARGE,
      label: t('widget.sizes.large'),
      icon: <Square3Stack3DIcon className="h-5 w-5" />,
      dimensions: '2x2'
    }
  ];

  return (
    <div 
      ref={ref}
      className={`flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all ${
        isExpanded ? 'absolute inset-4 z-50' : 'h-full'
      } ${
        isDragging ? 'opacity-50 border-dashed border-blue-400' : ''
      }`}
      data-testid={`widget-${widget.id}`}
      aria-label={widget.title}
      role="region"
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          {/* Drag Handle - Only visible in edit mode */}
          {isEditMode && (
            <div 
              className="cursor-move p-1 mr-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 touch-manipulation"
              aria-label={t('widget.dragHandle')}
              title={t('widget.dragToMove')}
            >
              <ArrowsUpDownIcon className="w-5 h-5" />
            </div>
          )}
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {widget.title}
          </h3>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Widget Controls - Only shown in edit mode or when settings/expand are active */}
          {(isEditMode || isSettingsOpen || isExpanded) && (
            <>
              {/* Settings button */}
              <button
                onClick={handleToggleSettings}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
                title={t('widgets.actions.settings')}
                data-testid={`widget-settings-${widget.id}`}
              >
                <Cog6ToothIcon className="h-5 w-5 text-gray-500" />
              </button>
              
              {/* Size selector button - Only visible in edit mode */}
              {isEditMode && (
                <div className="relative" ref={sizeSelectorRef}>
                  <button
                    onClick={handleToggleSizeSelector}
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
                    title={t('widgets.actions.resize')}
                    data-testid={`widget-resize-${widget.id}`}
                  >
                    {widget.size === WidgetSize.SMALL ? (
                      <ViewColumnsIcon className="h-5 w-5 text-gray-500" />
                    ) : widget.size === WidgetSize.MEDIUM ? (
                      <Square2StackIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Square3Stack3DIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  
                  {/* Size selector dropdown */}
                  {isSizeSelectorOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                         data-testid={`size-selector-${widget.id}`}>
                      <div className="py-1">
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                          {t('widgets.sizeSelector.title')}
                        </div>
                        {sizeOptions.map((option) => (
                          <button
                            key={option.size}
                            onClick={() => handleSizeChange(option.size)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 ${widget.size === option.size ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                            data-testid={`size-option-${option.size}`}
                          >
                            <span className="flex-shrink-0">{option.icon}</span>
                            <span className="flex-grow">{option.label}</span>
                            <span className="text-gray-400 text-xs">{option.dimensions}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Drag handle - Only visible in edit mode */}
              <DragHandle widgetId={widget.id} isEditMode={isEditMode} />
              
              {/* Toggle visibility button - Only visible in edit mode */}
              <button
                onClick={() => toggleWidgetVisibility(widget.id)}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
                title={widget.isVisible ? t('widgets.actions.hide') : t('widgets.actions.show')}
                data-testid={`widget-visibility-${widget.id}`}
              >
                {widget.isVisible ? (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {/* Remove widget button - Only visible in edit mode */}
              <button
                onClick={handleRemoveWidget}
                disabled={isLoading}
                className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition-colors duration-150"
                title={t('widgets.actions.remove')}
                data-testid={`widget-remove-${widget.id}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
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
