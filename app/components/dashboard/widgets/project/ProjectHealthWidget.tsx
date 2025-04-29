import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-intl';
import Link from 'next/link';
import { ProjectStatus, ProjectHealth } from '@/lib/types/project';
import { WidgetProps } from '@/lib/types/widget';

// Mock service for project health data
const fetchProjectHealth = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return {
    onTrack: 12,
    atRisk: 5,
    delayed: 3,
    completed: 8,
    notStarted: 4,
    projects: [
      {
        id: 'proj-001',
        name: 'Downtown Office Renovation',
        status: ProjectStatus.IN_PROGRESS,
        health: ProjectHealth.ON_TRACK,
        tasksOverdue: 0,
        openIssues: 2
      },
      {
        id: 'proj-002',
        name: 'Highland Park Residence',
        status: ProjectStatus.IN_PROGRESS,
        health: ProjectHealth.AT_RISK,
        tasksOverdue: 7,
        openIssues: 4
      },
      {
        id: 'proj-003',
        name: 'Riverside Mall Expansion',
        status: ProjectStatus.IN_PROGRESS,
        health: ProjectHealth.DELAYED,
        tasksOverdue: 12,
        openIssues: 8
      },
      {
        id: 'proj-004',
        name: 'Metro Transit Terminal',
        status: ProjectStatus.IN_PROGRESS,
        health: ProjectHealth.ON_TRACK,
        tasksOverdue: 1,
        openIssues: 3
      },
      {
        id: 'proj-005',
        name: 'Harbor View Apartments',
        status: ProjectStatus.PLANNING,
        health: ProjectHealth.ON_TRACK,
        tasksOverdue: 0,
        openIssues: 0
      },
      {
        id: 'proj-006',
        name: 'Westfield Community Center',
        status: ProjectStatus.COMPLETED,
        health: ProjectHealth.ON_TRACK,
        tasksOverdue: 0,
        openIssues: 0
      }
    ]
  };
};

// Helper function to get color for project health
const getHealthColor = (health: ProjectHealth) => {
  switch (health) {
    case ProjectHealth.ON_TRACK:
      return 'bg-green-500 text-white';
    case ProjectHealth.AT_RISK:
      return 'bg-orange-500 text-white';
    case ProjectHealth.DELAYED:
      return 'bg-red-500 text-white';
    case ProjectHealth.NOT_STARTED:
      return 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200';
    case ProjectHealth.COMPLETED:
      return 'bg-blue-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

// Filter types
type FilterType = 'all' | 'my-projects' | 'favorites';
type SortType = 'alphabetical' | 'due-date' | 'creation-date' | 'status';
type ViewType = 'list' | 'grid';

const ProjectHealthWidget: React.FC<WidgetProps> = ({ id, title, settings }) => {
  const { t } = useTranslation('dashboard');
  const [healthData, setHealthData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Filter and sort state
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('status');
  const [viewType, setViewType] = useState<ViewType>(settings?.viewType || 'grid');
  
  // Load project health data
  useEffect(() => {
    const loadHealthData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProjectHealth();
        setHealthData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading project health data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load project health data'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHealthData();
    
    // Set up refresh interval if specified in settings
    const refreshRate = settings?.refreshRate ? parseInt(settings.refreshRate) : null;
    if (refreshRate && refreshRate !== 'auto') {
      const interval = setInterval(loadHealthData, refreshRate * 1000);
      return () => clearInterval(interval);
    }
  }, [settings]);
  
  // Apply filtering and sorting
  const getFilteredProjects = () => {
    if (!healthData) return [];
    
    let filtered = [...healthData.projects];
    
    // Apply filter
    if (filter === 'my-projects') {
      // In a real implementation, this would filter by the current user's projects
      filtered = filtered.filter(p => ['proj-001', 'proj-002', 'proj-004'].includes(p.id));
    } else if (filter === 'favorites') {
      // In a real implementation, this would filter by favorite projects
      filtered = filtered.filter(p => ['proj-003', 'proj-004'].includes(p.id));
    }
    
    // Apply sorting
    if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'status') {
      // Sort by health status: Delayed -> At Risk -> On Track -> Not Started -> Completed
      const healthOrder = {
        [ProjectHealth.DELAYED]: 0,
        [ProjectHealth.AT_RISK]: 1,
        [ProjectHealth.ON_TRACK]: 2,
        [ProjectHealth.NOT_STARTED]: 3,
        [ProjectHealth.COMPLETED]: 4,
      };
      
      filtered.sort((a, b) => healthOrder[a.health] - healthOrder[b.health]);
    }
    // due-date and creation-date would be implemented in the real data
    
    return filtered;
  };
  
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
  
  if (!healthData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p>{t('project.noHealthData')}</p>
      </div>
    );
  }
  
  const filteredProjects = getFilteredProjects();
  
  return (
    <div className="h-full flex flex-col">
      {/* Stats Summary */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        <div className="col-span-1 bg-green-100 dark:bg-green-900/20 rounded-md p-2 text-center">
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            {healthData.onTrack}
          </div>
          <div className="text-xs text-green-800 dark:text-green-300">
            {t('project.onTrack')}
          </div>
        </div>
        
        <div className="col-span-1 bg-orange-100 dark:bg-orange-900/20 rounded-md p-2 text-center">
          <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
            {healthData.atRisk}
          </div>
          <div className="text-xs text-orange-800 dark:text-orange-300">
            {t('project.atRisk')}
          </div>
        </div>
        
        <div className="col-span-1 bg-red-100 dark:bg-red-900/20 rounded-md p-2 text-center">
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
            {healthData.delayed}
          </div>
          <div className="text-xs text-red-800 dark:text-red-300">
            {t('project.delayed')}
          </div>
        </div>
        
        <div className="col-span-1 bg-blue-100 dark:bg-blue-900/20 rounded-md p-2 text-center">
          <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            {healthData.completed}
          </div>
          <div className="text-xs text-blue-800 dark:text-blue-300">
            {t('project.completed')}
          </div>
        </div>
        
        <div className="col-span-1 bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-center">
          <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            {healthData.notStarted}
          </div>
          <div className="text-xs text-gray-800 dark:text-gray-300">
            {t('project.notStarted')}
          </div>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="flex justify-between items-center mb-3 text-sm">
        <div className="flex space-x-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 rounded-md ${
              filter === 'all' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {t('project.filterAll')}
          </button>
          
          <button
            onClick={() => setFilter('my-projects')}
            className={`px-2 py-1 rounded-md ${
              filter === 'my-projects' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {t('project.filterMyProjects')}
          </button>
          
          <button
            onClick={() => setFilter('favorites')}
            className={`px-2 py-1 rounded-md ${
              filter === 'favorites' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {t('project.filterFavorites')}
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            className="text-xs border-gray-300 rounded-md py-1 dark:bg-gray-700 dark:border-gray-600"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            aria-label={t('project.sortBy')}
          >
            <option value="status">{t('project.sortStatus')}</option>
            <option value="alphabetical">{t('project.sortAlphabetical')}</option>
            <option value="due-date">{t('project.sortDueDate')}</option>
            <option value="creation-date">{t('project.sortCreationDate')}</option>
          </select>
          
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setViewType('list')}
              className={`px-2 py-1 ${
                viewType === 'list' 
                  ? 'bg-gray-200 dark:bg-gray-600' 
                  : 'bg-white dark:bg-gray-800'
              }`}
              aria-label={t('project.viewList')}
              title={t('project.viewList')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <button
              onClick={() => setViewType('grid')}
              className={`px-2 py-1 ${
                viewType === 'grid' 
                  ? 'bg-gray-200 dark:bg-gray-600' 
                  : 'bg-white dark:bg-gray-800'
              }`}
              aria-label={t('project.viewGrid')}
              title={t('project.viewGrid')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Project List/Grid */}
      <div className="flex-1 overflow-auto">
        {filteredProjects.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>{t('project.noProjectsMatch')}</p>
          </div>
        ) : viewType === 'list' ? (
          <div className="space-y-2">
            {filteredProjects.map((project: any) => (
              <Link 
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getHealthColor(project.health).split(' ')[0]}`}></div>
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{project.name}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                  {project.tasksOverdue > 0 && (
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {project.tasksOverdue}
                    </span>
                  )}
                  
                  {project.openIssues > 0 && (
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {project.openIssues}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProjects.map((project: any) => (
              <Link 
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate" title={project.name}>
                    {project.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getHealthColor(project.health)}`}>
                    {t(`project.health.${project.health}`)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>{t(`project.status.${project.status}`)}</span>
                  
                  <div className="flex items-center space-x-2">
                    {project.tasksOverdue > 0 && (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {project.tasksOverdue}
                      </span>
                    )}
                    
                    {project.openIssues > 0 && (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {project.openIssues}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectHealthWidget;
