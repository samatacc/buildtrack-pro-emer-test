import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-intl';
import Link from 'next/link';
import { TaskStatus, TaskPriority } from '@/lib/types/task';
import { WidgetProps } from '@/lib/types/widget';

// Mock service for critical path tasks
const fetchCriticalPathTasks = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 550));
  
  return {
    tasks: [
      {
        id: 'task-501',
        title: 'Permit approval',
        projectId: 'proj-001',
        projectName: 'Downtown Office Renovation',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date(2025, 4, 12),
        daysUntilDue: 3,
        dependentTaskCount: 5,
        isBlocker: true
      },
      {
        id: 'task-502',
        title: 'Structural engineering sign-off',
        projectId: 'proj-002',
        projectName: 'Highland Park Residence',
        status: TaskStatus.BLOCKED,
        priority: TaskPriority.URGENT,
        dueDate: new Date(2025, 4, 9),
        daysUntilDue: 0,
        dependentTaskCount: 8,
        isBlocker: true,
        blockReason: 'Waiting for soil test results'
      },
      {
        id: 'task-503',
        title: 'Phase 1 demolition completion',
        projectId: 'proj-003',
        projectName: 'Riverside Mall Expansion',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date(2025, 4, 15),
        daysUntilDue: 6,
        dependentTaskCount: 3,
        isBlocker: false
      },
      {
        id: 'task-504',
        title: 'Vendor contract finalization',
        projectId: 'proj-004',
        projectName: 'Metro Transit Terminal',
        status: TaskStatus.TO_DO,
        priority: TaskPriority.HIGH,
        dueDate: new Date(2025, 4, 16),
        daysUntilDue: 7,
        dependentTaskCount: 4,
        isBlocker: true
      },
      {
        id: 'task-505',
        title: 'Material delivery confirmation',
        projectId: 'proj-002',
        projectName: 'Highland Park Residence',
        status: TaskStatus.TO_DO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(2025, 4, 18),
        daysUntilDue: 9,
        dependentTaskCount: 2,
        isBlocker: false
      }
    ]
  };
};

// Helper function to determine urgency color
const getUrgencyColor = (daysUntilDue: number, status: TaskStatus) => {
  if (status === TaskStatus.DONE) return 'text-green-600 dark:text-green-400';
  
  if (daysUntilDue < 0) return 'text-red-600 dark:text-red-400';
  if (daysUntilDue === 0) return 'text-red-600 dark:text-red-400';
  if (daysUntilDue <= 2) return 'text-orange-600 dark:text-orange-400';
  if (daysUntilDue <= 5) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
};

// Helper function to format days until due
const formatDaysUntilDue = (days: number, t: any) => {
  if (days < 0) return t('task.overdue', { count: Math.abs(days) });
  if (days === 0) return t('task.dueToday');
  return t('task.daysUntilDue', { count: days });
};

// Helper function to get status badge class
const getStatusBadgeClass = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TO_DO:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case TaskStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case TaskStatus.BLOCKED:
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case TaskStatus.DONE:
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

// Helper function to get priority badge class
const getPriorityBadgeClass = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.LOW:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case TaskPriority.MEDIUM:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case TaskPriority.HIGH:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case TaskPriority.URGENT:
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const CriticalPathWidget: React.FC<WidgetProps> = ({ id, title, settings }) => {
  const { t } = useTranslation('dashboard');
  const [criticalTasks, setCriticalTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'dependentCount'>('dueDate');
  
  // Load critical path tasks
  useEffect(() => {
    const loadCriticalTasks = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCriticalPathTasks();
        setCriticalTasks(data.tasks);
        setError(null);
      } catch (err) {
        console.error('Error loading critical path tasks:', err);
        setError(err instanceof Error ? err : new Error('Failed to load critical path tasks'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCriticalTasks();
    
    // Set up refresh interval if specified in settings
    const refreshRate = settings?.refreshRate ? parseInt(settings.refreshRate) : null;
    if (refreshRate && refreshRate !== 'auto') {
      const interval = setInterval(loadCriticalTasks, refreshRate * 1000);
      return () => clearInterval(interval);
    }
  }, [settings]);
  
  // Sort tasks based on selected sort criteria
  const getSortedTasks = () => {
    if (!criticalTasks) return [];
    
    const tasksCopy = [...criticalTasks];
    
    if (sortBy === 'dueDate') {
      // Sort by due date (ascending)
      return tasksCopy.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    } else if (sortBy === 'dependentCount') {
      // Sort by dependent task count (descending)
      return tasksCopy.sort((a, b) => b.dependentTaskCount - a.dependentTaskCount);
    }
    
    return tasksCopy;
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
  
  if (criticalTasks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p>{t('task.noCriticalTasks')}</p>
      </div>
    );
  }
  
  const sortedTasks = getSortedTasks();
  
  return (
    <div className="h-full flex flex-col">
      {/* Sort Controls */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
          <span className="mr-2">{t('task.sortBy')}:</span>
          <button
            onClick={() => setSortBy('dueDate')}
            className={`px-2 py-1 rounded-l-md border ${
              sortBy === 'dueDate'
                ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
            }`}
          >
            {t('task.dueDate')}
          </button>
          <button
            onClick={() => setSortBy('dependentCount')}
            className={`px-2 py-1 rounded-r-md border-t border-b border-r ${
              sortBy === 'dependentCount'
                ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
            }`}
          >
            {t('task.impact')}
          </button>
        </div>
      </div>
      
      {/* Task List */}
      <div className="flex-1 overflow-auto space-y-3">
        {sortedTasks.map((task) => (
          <Link
            key={task.id}
            href={`/dashboard/tasks/${task.id}`}
            className={`block p-3 rounded-lg border ${
              task.status === TaskStatus.BLOCKED
                ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10'
                : task.daysUntilDue <= 1
                  ? 'border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/10'
                  : 'border-gray-200 dark:border-gray-700'
            } hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {task.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {task.projectName}
                </p>
              </div>
              
              {/* Priority & Status Badges */}
              <div className="flex flex-col items-end gap-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(task.priority)}`}>
                  {t(`task.priority.${task.priority}`)}
                </span>
                
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                  {t(`task.status.${task.status}`)}
                </span>
              </div>
            </div>
            
            {/* Block Reason (if applicable) */}
            {task.status === TaskStatus.BLOCKED && task.blockReason && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400 italic">
                {task.blockReason}
              </div>
            )}
            
            {/* Task Metrics */}
            <div className="mt-2 flex flex-wrap justify-between items-center text-xs">
              {/* Due Date */}
              <div className={`flex items-center ${getUrgencyColor(task.daysUntilDue, task.status)}`}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDaysUntilDue(task.daysUntilDue, t)}</span>
              </div>
              
              {/* Dependent Tasks Count */}
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>
                  {t('task.dependentTasks', { count: task.dependentTaskCount })}
                </span>
              </div>
            </div>
            
            {/* Blocker Label */}
            {task.isBlocker && (
              <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {t('task.criticalBlocker')}
              </div>
            )}
          </Link>
        ))}
      </div>
      
      {/* Widget Footer */}
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Link 
          href="/dashboard/tasks/critical-path"
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
        >
          {t('task.viewCriticalPath')} 
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default CriticalPathWidget;
