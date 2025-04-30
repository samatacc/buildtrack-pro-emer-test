import React, { useState } from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { WidgetType } from '@/lib/types/widget';
import { useWidgets } from '@/lib/contexts/WidgetContext';

// Widget option icons
import { 
  BriefcaseIcon, 
  ClockIcon, 
  ChartBarIcon, 
  CheckCircleIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  UserIcon,
  BellIcon,
  PresentationChartLineIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';

interface WidgetOption {
  type: WidgetType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface WidgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  screenSize?: string; // Current screen size for responsive design
}

const WidgetSelector: React.FC<WidgetSelectorProps> = ({ isOpen, onClose, screenSize = 'lg' }) => {
  const { t } = useTranslations('dashboard.widgets');
  const { addWidget } = useWidgets();
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Define all available widgets
  const widgetOptions: WidgetOption[] = [
    {
      type: WidgetType.ACTIVE_PROJECTS,
      title: t('activeProjects.title'),
      description: t('activeProjects.description'),
      icon: <BriefcaseIcon className="h-8 w-8 text-blue-500" />
    },
    {
      type: WidgetType.PROJECT_TIMELINE,
      title: t('projectTimeline.title'),
      description: t('projectTimeline.description'),
      icon: <ClockIcon className="h-8 w-8 text-green-500" />
    },
    {
      type: WidgetType.PROJECT_HEALTH,
      title: t('projectHealth.title'),
      description: t('projectHealth.description'),
      icon: <ChartBarIcon className="h-8 w-8 text-purple-500" />
    },
    {
      type: WidgetType.ANALYTICS,
      title: t('analytics.title'),
      description: t('analytics.description'),
      icon: <PresentationChartLineIcon className="h-8 w-8 text-pink-500" />
    },
    {
      type: WidgetType.MY_TASKS,
      title: t('myTasks.title'),
      description: t('myTasks.description'),
      icon: <CheckCircleIcon className="h-8 w-8 text-teal-500" />
    },
    {
      type: WidgetType.TEAM_TASKS,
      title: t('teamTasks.title'),
      description: t('teamTasks.description'),
      icon: <UserGroupIcon className="h-8 w-8 text-indigo-500" />
    },
    {
      type: WidgetType.CRITICAL_PATH,
      title: t('criticalPath.title'),
      description: t('criticalPath.description'),
      icon: <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" />
    },
    {
      type: WidgetType.PROGRESS_REPORTS,
      title: t('progressReports.title'),
      description: t('progressReports.description'),
      icon: <ArrowTrendingUpIcon className="h-8 w-8 text-emerald-500" />
    },
    {
      type: WidgetType.FINANCIAL_DASHBOARD,
      title: t('financialDashboard.title'),
      description: t('financialDashboard.description'),
      icon: <CurrencyDollarIcon className="h-8 w-8 text-red-500" />
    },
    {
      type: WidgetType.TEAM_PERFORMANCE,
      title: t('teamPerformance.title'),
      description: t('teamPerformance.description'),
      icon: <UserIcon className="h-8 w-8 text-cyan-500" />
    },
    {
      type: WidgetType.NOTIFICATION_CENTER,
      title: t('notificationCenter.title'),
      description: t('notificationCenter.description'),
      icon: <BellIcon className="h-8 w-8 text-orange-500" />
    }
  ];

  const handleAddWidget = async () => {
    if (!selectedType) return;
    
    try {
      setIsAdding(true);
      const success = await addWidget(selectedType);
      
      if (success) {
        onClose();
      } else {
        // Handle failed widget addition
        console.error('Failed to add widget');
        // Could add error state or toast notification here
      }
    } catch (error) {
      console.error('Error adding widget:', error);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={handleBackdropClick}
      ></div>
      
      {/* Modal content */}
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${screenSize === 'xxs' || screenSize === 'xs' ? 'max-w-full' : 'max-w-3xl'} max-h-[90vh] overflow-hidden z-10 relative flex flex-col`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('selector.title')}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={t('selector.close')}
          >
            <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('selector.description')}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {widgetOptions.map((option) => (
              <div 
                key={option.type}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${screenSize === 'xxs' || screenSize === 'xs' ? 'p-3' : 'p-4'} ${
                  selectedType === option.type 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
                onClick={() => setSelectedType(option.type)}
                data-testid={`widget-option-${option.type}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {option.icon}
                  </div>
                  <div>
                    <h3 className={`font-medium text-gray-900 dark:text-white ${screenSize === 'xxs' || screenSize === 'xs' ? 'text-sm' : ''}`}>
                      {option.title}
                    </h3>
                    <p className={`${screenSize === 'xxs' || screenSize === 'xs' ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400 mt-1`}>
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t('selector.cancel')}
          </button>
          <button
            onClick={handleAddWidget}
            disabled={!selectedType || isAdding}
            className={`px-4 py-2 rounded-md ${!selectedType || isAdding ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            {isAdding ? t('common.adding') + '...' : t('common.add')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetSelector;
