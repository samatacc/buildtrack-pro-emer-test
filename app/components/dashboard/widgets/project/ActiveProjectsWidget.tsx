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

const ActiveProjectsWidget: React.FC<WidgetProps> = ({ id, title, settings }) => {
  const { t, locale } = useTranslation('dashboard');
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Display mode from settings
  const displayMode = settings?.displayMode || 'detailed';
  
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
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
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
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4">
        {projects.map(project => (
          <div 
            key={project.id}
            className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-3">
              {/* Project Thumbnail (only in detailed view) */}
              {displayMode === 'detailed' && (
                <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {project.thumbnail ? (
                    <img 
                      src={project.thumbnail} 
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {project.name}
                  </h3>
                  
                  {/* Health Indicator */}
                  <span 
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getHealthColor(project.health)} text-white`}
                  >
                    {t(`project.health.${project.health}`)}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getHealthColor(project.health)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{t('project.progress', { percent: project.progress })}</span>
                  
                  {/* Days ahead/behind schedule */}
                  <span>{formatDaysDeviation(project.daysAhead, t)}</span>
                </div>
                
                {/* Due Date (only in detailed view) */}
                {displayMode === 'detailed' && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {t('project.dueDate')}: {new Intl.DateTimeFormat(locale, { 
                      dateStyle: 'medium' 
                    }).format(project.dueDate)}
                  </div>
                )}
                
                {/* Action buttons (only in detailed view) */}
                {displayMode === 'detailed' && (
                  <div className="mt-3 flex items-center space-x-2">
                    <Link 
                      href={`/dashboard/projects/${project.id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                    >
                      {t('project.viewDetails')} <ArrowRightIcon className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Widget Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <Link 
          href="/dashboard/projects"
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
        >
          {t('project.viewAllProjects')} <ArrowRightIcon className="w-4 h-4 ml-1" />
        </Link>
        
        <Link 
          href="/dashboard/projects/create"
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-1" /> {t('project.createProject')}
        </Link>
      </div>
    </div>
  );
};

export default ActiveProjectsWidget;
