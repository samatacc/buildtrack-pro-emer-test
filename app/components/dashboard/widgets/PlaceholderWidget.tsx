import React from 'react';
import { WidgetProps } from '@/lib/types/widget';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useTranslations } from '@/app/hooks/useTranslations';

/**
 * Placeholder widget used for widget types that aren't fully implemented yet.
 * Shows a friendly message to users that the widget is coming soon.
 */
const PlaceholderWidget: React.FC<WidgetProps> = ({ id, title, settings }) => {
  const { t } = useTranslations('dashboard');
  const widgetName = settings?.widgetName || title || 'This widget';
  
  // Extract screen size from settings with default to medium
  const screenSize = settings?.screenSize || 'md';
  
  // Adjust sizes based on screen size
  const iconSize = screenSize === 'xxs' || screenSize === 'xs' ? 'w-8 h-8' : 
                  screenSize === 'sm' ? 'w-10 h-10' : 'w-12 h-12';
  
  const titleSize = screenSize === 'xxs' || screenSize === 'xs' ? 'text-sm' : 
                    screenSize === 'sm' ? 'text-base' : 'text-lg';
  
  const descSize = screenSize === 'xxs' ? 'text-xs' : 
                   screenSize === 'xs' || screenSize === 'sm' ? 'text-sm' : 'text-base';
  
  const padding = screenSize === 'xxs' || screenSize === 'xs' ? 'p-2' : 
                  screenSize === 'sm' ? 'p-3' : 'p-4';
  
  return (
    <div className={`h-full flex flex-col items-center justify-center ${padding} text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg`}>
      <ExclamationCircleIcon className={`${iconSize} text-blue-500 ${screenSize === 'xxs' || screenSize === 'xs' ? 'mb-2' : 'mb-3'}`} />
      <h3 className={`${titleSize} font-medium text-gray-900 dark:text-white mb-2`}>
        {widgetName} {t('widget.comingSoon') || 'is Coming Soon'}
      </h3>
      <p className={`${descSize} text-gray-600 dark:text-gray-400 max-w-xs`}>
        {t('widget.workInProgress') || "We're currently working on this widget to provide you with the best experience."}
        {t('widget.checkBack') || 'Check back soon for updates!'}
      </p>
    </div>
  );
};

export default PlaceholderWidget;
