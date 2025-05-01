import React, { useState } from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import DragHandle from '../DragHandle';

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed';
  progress: number;
  dueDate: string;
}

interface ActiveProjectsWidgetProps {
  isEditMode?: boolean;
}

const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Riverfront Residences',
    status: 'in_progress',
    progress: 65,
    dueDate: '2025-07-15'
  },
  {
    id: 'p2',
    name: 'Silver Creek Office Complex',
    status: 'planning',
    progress: 20,
    dueDate: '2025-08-30'
  },
  {
    id: 'p3',
    name: 'Oakridge Mall Renovation',
    status: 'on_hold',
    progress: 45,
    dueDate: '2025-06-10'
  },
  {
    id: 'p4',
    name: 'Downtown Renovation',
    status: 'in_progress',
    progress: 80,
    dueDate: '2025-05-25'
  }
];

// Status color mapping
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'planning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'on_hold':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const ActiveProjectsWidget: React.FC<ActiveProjectsWidgetProps> = ({ isEditMode = false }) => {
  const { t } = useTranslations('dashboard.widgets');
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  
  // Format due date
  const formatDueDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-medium text-[rgb(24,62,105)] dark:text-white flex items-center">
          {t('activeProjects.title') || 'Active Projects'}
          
          {isEditMode && (
            <div className="ml-2">
              <DragHandle widgetId="active-projects" isEditMode={isEditMode} />
            </div>
          )}
        </h3>
        
        <a 
          href="/dashboard/projects" 
          className="text-sm text-[rgb(236,107,44)] hover:text-[rgb(216,87,24)] flex items-center"
        >
          {t('common.viewAll') || 'View All'}
          <ArrowTopRightOnSquareIcon className="ml-1 h-3 w-3" />
        </a>
      </div>
      
      <div className="flex-1 overflow-y-auto p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {projects.map(project => (
            <div key={project.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-gray-900 dark:text-white">
                  {project.name}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="mb-1">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-[rgb(236,107,44)] h-2 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Due: {formatDueDate(project.dueDate)}
              </div>
            </div>
          ))}
          
          {projects.length === 0 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {t('activeProjects.empty') || 'No active projects found'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveProjectsWidget;
