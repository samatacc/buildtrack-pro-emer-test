import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-intl';
import Link from 'next/link';
import { PlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { ProjectStatus, ProjectHealth } from '@/lib/types/project';
import { WidgetProps } from '@/lib/types/widget';

// Mock service for now, will be replaced with actual API call
const fetchActiveProjects = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: 'proj-001',
      name: 'Downtown Office Renovation',
      status: ProjectStatus.IN_PROGRESS,
      health: ProjectHealth.ON_TRACK,
      progress: 45,
      daysAhead: 2,
      dueDate: new Date(2025, 7, 15),
      thumbnail: '/images/projects/downtown-office.jpg'
    },
    {
      id: 'proj-002',
      name: 'Highland Park Residence',
      status: ProjectStatus.IN_PROGRESS,
      health: ProjectHealth.AT_RISK,
      progress: 32,
      daysAhead: -5,
      dueDate: new Date(2025, 5, 30),
      thumbnail: '/images/projects/highland-residence.jpg'
    },
    {
      id: 'proj-003',
      name: 'Riverside Mall Expansion',
      status: ProjectStatus.IN_PROGRESS,
      health: ProjectHealth.DELAYED,
      progress: 68,
      daysAhead: -3,
      dueDate: new Date(2025, 9, 10),
      thumbnail: '/images/projects/riverside-mall.jpg'
    },
    {
      id: 'proj-004',
      name: 'Metro Transit Terminal',
      status: ProjectStatus.IN_PROGRESS,
      health: ProjectHealth.ON_TRACK,
      progress: 15,
      daysAhead: 0,
      dueDate: new Date(2026, 1, 28),
      thumbnail: '/images/projects/metro-terminal.jpg'
    }
  ];
};

// Helper function to get color for project health
const getHealthColor = (health: ProjectHealth) => {
  switch (health) {
    case ProjectHealth.ON_TRACK:
      return 'bg-green-500';
    case ProjectHealth.AT_RISK:
      return 'bg-orange-500';
    case ProjectHealth.DELAYED:
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

// Helper function to format days ahead/behind
const formatDaysDeviation = (days: number, t: any) => {
  if (days > 0) {
    return t('project.daysAhead', { count: days });
  } else if (days < 0) {
    return t('project.daysBehind', { count: Math.abs(days) });
  } else {
    return t('project.onSchedule');
  }
};

// Interface for widget-specific settings
interface ProjectWidgetSettings {
  displayMode?: 'detailed' | 'compact';
  displayCount?: number;
  filterStatus?: ProjectStatus;
  filterHealth?: ProjectHealth;
  screenSize?: string; // Current screen size for responsive design
}

const ActiveProjectsWidget: React.FC<WidgetProps> = ({ id, title, settings }) => {
  const { t, locale } = useTranslation('dashboard');
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Extract settings with defaults
  const { 
    displayMode = 'detailed',
    screenSize = 'lg',
    displayCount = screenSize === 'xxs' ? 3 : (screenSize === 'xs' ? 4 : 5),
    filterStatus,
    filterHealth 
  } = settings as ProjectWidgetSettings;
  
  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        const data = await fetchActiveProjects();
        setProjects(data);
        setError(null);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError(err instanceof Error ? err : new Error('Failed to load projects'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
    
    // Set up refresh interval if specified in settings
    const refreshRate = settings?.refreshRate ? parseInt(settings.refreshRate) : null;
    if (refreshRate && refreshRate !== 'auto') {
      const interval = setInterval(loadProjects, refreshRate * 1000);
      return () => clearInterval(interval);
    }
  }, [settings]);
  
  if (isLoading) {
    // Responsive loading indicator size
    const spinnerSize = screenSize === 'xxs' || screenSize === 'xs' ? 'h-4 w-4' : 'h-6 w-6';
    const loadingText = screenSize === 'xxs' ? '' : t('widget.loading');
    
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className={`animate-spin rounded-full ${spinnerSize} border-t-2 border-b-2 border-blue-600`}></div>
        {loadingText && <p className="mt-2 text-sm text-gray-500">{loadingText}</p>}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-500">
        <p>{t('widget.errorLoading')}</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }
  
  if (projects.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p>{t('project.noActiveProjects')}</p>
        <Link 
          href="/dashboard/projects/create"
          className="mt-4 inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-1" /> {t('project.createProject')}
        </Link>
      </div>
    );
  }
  
  // Adjust spacing between projects based on screen size
  const projectSpacing = screenSize === 'xxs' ? 'space-y-2' : 
                        screenSize === 'xs' || screenSize === 'sm' ? 'space-y-3' : 
                        'space-y-4';
  
  return (
    <div className="h-full flex flex-col">
      <div className={`flex-1 overflow-y-auto ${projectSpacing}`}>
        {projects.map(project => (
          <div 
            key={project.id}
            className={`${screenSize === 'xxs' ? 'p-2' : 'p-3'} bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow`}
            style={{ touchAction: 'manipulation' }} // Improve touch interactions on mobile
          >
            <div className={`flex ${screenSize === 'xxs' || screenSize === 'sm' || screenSize === 'xs' ? 'flex-col' : 'items-start space-x-3'}`}>
              {/* Project Thumbnail (only in detailed view and larger screens) */}
              {displayMode === 'detailed' && !(screenSize === 'xs') && (
                <div className={`flex-shrink-0 ${screenSize === 'xxs' ? 'w-10 h-10 mb-1.5' : screenSize === 'sm' ? 'w-12 h-12 mb-2' : 'w-16 h-16'} rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700`}>
                  {project.thumbnail ? (
                    <img 
                      src={project.thumbnail} 
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className={`${screenSize === 'sm' ? 'w-6 h-6' : 'w-8 h-8'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className={`flex ${screenSize === 'xs' || screenSize === 'sm' ? 'flex-col space-y-1' : 'items-center justify-between'}`}>
                  <h3 className={`${screenSize === 'xxs' ? 'text-xs' : screenSize === 'xs' ? 'text-xs' : screenSize === 'sm' ? 'text-sm' : 'text-base'} font-medium text-gray-900 dark:text-white truncate`}>
                    {project.name}
                  </h3>
                  
                  {/* Health Indicator */}
                  <span 
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getHealthColor(project.health)} text-white ${screenSize === 'xs' || screenSize === 'sm' ? 'self-start' : ''}`}
                  >
                    {t(`project.health.${project.health}`)}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className={`${screenSize === 'xxs' ? 'mt-1.5' : 'mt-2'} w-full bg-gray-200 dark:bg-gray-700 rounded-full ${screenSize === 'xxs' ? 'h-1.5' : 'h-2.5'}`}>
                  <div 
                    className={`${screenSize === 'xxs' ? 'h-1.5' : 'h-2.5'} rounded-full ${getHealthColor(project.health)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                
                <div className={`${screenSize === 'xxs' ? 'mt-1' : 'mt-2'} flex ${screenSize === 'xxs' || screenSize === 'xs' ? 'flex-col space-y-1' : 'items-center justify-between'} ${screenSize === 'xxs' ? 'text-[10px]' : 'text-xs'} text-gray-500 dark:text-gray-400`}>
                  <span>{t('project.progress', { percent: project.progress })}</span>
                  
                  {/* Days ahead/behind schedule */}
                  <span className={project.daysAhead < 0 ? 'text-red-500' : project.daysAhead > 0 ? 'text-green-500' : ''}>
                    {formatDaysDeviation(project.daysAhead, t)}
                  </span>
                </div>
                
                <div className={`${screenSize === 'xs' || screenSize === 'sm' ? 'mt-1.5' : 'mt-2'}`}>
                  {/* Due Date - more compact on mobile */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center">
                    <span className={screenSize === 'xs' ? 'mr-1' : ''}>{t('project.dueDate')}:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                      {new Date(project.dueDate).toLocaleDateString(locale, { 
                        year: screenSize === 'xs' ? '2-digit' : 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
                
                {/* Action buttons (only in detailed view) */}
                {displayMode === 'detailed' && (
                  <div className="mt-3 flex items-center justify-between">
                    <Link 
                      href={`/projects/${project.id}`}
                      className={`${screenSize === 'xs' ? 'text-xs' : 'text-sm'} text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center`}
                    >
                      {t('project.viewDetails')} 
                      <ArrowRightIcon className={`ml-1 ${screenSize === 'xs' ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Widget Footer - adjust spacing based on screen size */}
      <div className={`${screenSize === 'xxs' || screenSize === 'xs' ? 'mt-2 pt-2' : 'mt-3 pt-3'} border-t border-gray-200 dark:border-gray-700 flex ${screenSize === 'xxs' ? 'flex-col space-y-2' : 'justify-between items-center'}`}>
        <Link 
          href="/dashboard/projects"
          className={`${screenSize === 'xxs' ? 'text-xs py-1.5' : 'text-sm'} text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center ${screenSize === 'xxs' ? 'justify-center w-full rounded-md border border-blue-200 hover:bg-blue-50' : ''}`}
        >
          {t('project.viewAllProjects')} <ArrowRightIcon className={`${screenSize === 'xxs' ? 'w-3 h-3 ml-1' : 'w-4 h-4 ml-1'}`} />
        </Link>
        
        <Link 
          href="/dashboard/projects/create"
          className={`${screenSize === 'xxs' ? 'text-xs py-1.5' : 'text-sm'} text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center ${screenSize === 'xxs' ? 'justify-center w-full rounded-md border border-blue-200 hover:bg-blue-50' : ''}`}
        >
          <PlusIcon className={`${screenSize === 'xxs' ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1'}`} /> {t('project.createProject')}
        </Link>
      </div>
    </div>
  );
};

export default ActiveProjectsWidget;
