import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import Link from 'next/link';
import { TaskStatus, TaskPriority } from '@/lib/types/task';
import { WidgetProps } from '@/lib/types/widget';

// Mock service for tasks data
const fetchMyTasks = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    tasks: [
      {
        id: 'task-001',
        title: 'Review design documents',
        projectId: 'proj-001',
        projectName: 'Downtown Office Renovation',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date(2025, 4, 15),
        isOverdue: false
      },
      {
        id: 'task-002',
        title: 'Approve contractor invoices',
        projectId: 'proj-001',
        projectName: 'Downtown Office Renovation',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(2025, 4, 18),
        isOverdue: false
      },
      {
        id: 'task-003',
        title: 'Site inspection for foundation',
        projectId: 'proj-002',
        projectName: 'Highland Park Residence',
        status: TaskStatus.TODO,
        priority: TaskPriority.CRITICAL,
        dueDate: new Date(2025, 4, 10),
        isOverdue: true
      },
      {
        id: 'task-004',
        title: 'Update budget forecast',
        projectId: 'proj-003',
        projectName: 'Riverside Mall Expansion',
        status: TaskStatus.BLOCKED,
        priority: TaskPriority.HIGH,
        dueDate: new Date(2025, 4, 12),
        isOverdue: true,
        blockReason: 'Waiting for updated cost estimates'
      },
      {
        id: 'task-005',
        title: 'Finalize material specifications',
        projectId: 'proj-002',
        projectName: 'Highland Park Residence',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(2025, 4, 17),
        isOverdue: false
      },
      {
        id: 'task-006',
        title: 'Environmental compliance review',
        projectId: 'proj-004',
        projectName: 'Metro Transit Terminal',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        dueDate: new Date(2025, 4, 5),
        isOverdue: false,
        completedDate: new Date(2025, 4, 4)
      }
    ]
  };
};

// Helper functions for UI
const getStatusBadgeClasses = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.COMPLETED:
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case TaskStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case TaskStatus.BLOCKED:
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case TaskStatus.TODO:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const getPriorityClasses = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.LOW:
      return 'text-gray-600 dark:text-gray-400';
    case TaskPriority.MEDIUM:
      return 'text-blue-600 dark:text-blue-400';
    case TaskPriority.HIGH:
      return 'text-orange-600 dark:text-orange-400';
    case TaskPriority.CRITICAL:
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

const getPriorityIcon = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.LOW:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    case TaskPriority.MEDIUM:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      );
    case TaskPriority.HIGH:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    case TaskPriority.CRITICAL:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    default:
      return null;
  }
};

// Group tasks by project
const groupTasksByProject = (tasks: any[]) => {
  return tasks.reduce((groups, task) => {
    const project = task.projectId;
    if (!groups[project]) {
      groups[project] = {
        projectName: task.projectName,
        tasks: []
      };
    }
    groups[project].tasks.push(task);
    return groups;
  }, {});
};

// Interface for widget-specific settings
interface TaskWidgetSettings {
  displayCount?: number;
  showCompleted?: boolean;
  screenSize?: string; // Current screen size for responsive design
  refreshRate?: string | number;
  groupByProject?: boolean;
}

const MyTasksWidget: React.FC<WidgetProps> = ({ id, title, settings }) => {
  const { t } = useTranslations('dashboard');
  // Get the current locale for date formatting
  const locale = typeof window !== 'undefined' ? navigator.language : 'en-US';
  
  // Extract settings with defaults
  const {
    displayCount = 10,
    showCompleted = true, 
    screenSize = 'lg',
    groupByProject = true,
    refreshRate
  } = settings as TaskWidgetSettings;
  const [tasksData, setTasksData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  
  // Load tasks data
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const data = await fetchMyTasks();
        setTasksData(data);
        
        // Initialize all projects as expanded
        const projectIds = Array.from(new Set(data.tasks.map((task: any) => task.projectId)));
        const initialExpandedState = projectIds.reduce((acc, projectId) => {
          acc[projectId] = true;
          return acc;
        }, {} as Record<string, boolean>);
        
        setExpandedProjects(initialExpandedState);
        
        setError(null);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError(err instanceof Error ? err : new Error('Failed to load tasks'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTasks();
    
    // Set up refresh interval if specified in settings
    if (refreshRate) {
      const refreshRateMs = typeof refreshRate === 'string' ? 
        (refreshRate === 'auto' ? 30000 : parseInt(refreshRate) * 1000) : 
        refreshRate * 1000;
        
      const interval = setInterval(loadTasks, refreshRateMs);
      return () => clearInterval(interval);
    }
  }, [settings]);
  
  // Toggle project expansion
  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };
  
  // Handle task status change
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    if (!tasksData) return;
    
    // Update local state first for immediate feedback
    setTasksData({
      ...tasksData,
      tasks: tasksData.tasks.map((task: any) => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    });
    
    // In a real implementation, we would call an API to update the task
    console.log(`Updating task ${taskId} status to ${newStatus}`);
  };
  
  // Handle task completion toggle
  const handleTaskCompletion = (taskId: string, isCompleted: boolean) => {
    if (!tasksData) return;
    
    const newStatus = isCompleted ? TaskStatus.COMPLETED : TaskStatus.TODO;
    
    // Update local state
    setTasksData({
      ...tasksData,
      tasks: tasksData.tasks.map((task: any) => 
        task.id === taskId ? { 
          ...task, 
          status: newStatus,
          completedDate: isCompleted ? new Date() : undefined 
        } : task
      )
    });
    
    // In a real implementation, we would call an API to update the task
    console.log(`Setting task ${taskId} as ${isCompleted ? 'completed' : 'incomplete'}`);
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
  
  if (!tasksData || tasksData.tasks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p>{t('task.noAssignedTasks')}</p>
        <Link 
          href="/dashboard/tasks/create"
          className="mt-3 inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('task.createTask')}
        </Link>
      </div>
    );
  }
  
  // Filter tasks based on settings
  const filteredTasks = tasksData.tasks
    .filter((task: any) => showCompleted || task.status !== TaskStatus.COMPLETED)
    .slice(0, displayCount);
  
  // Group by project if setting is enabled, otherwise show flat list
  const groupedTasks = groupByProject ? groupTasksByProject(filteredTasks) : {};
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {/* Flat task list when not grouping by project */}
        {!groupByProject && (
          <div className="space-y-2 px-1">
            {filteredTasks.map((task: any) => (
              <div 
                key={task.id} 
                className={`rounded-md border ${
                  task.isOverdue && task.status !== TaskStatus.COMPLETED 
                    ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className={`${screenSize === 'xxs' || screenSize === 'xs' ? 'p-2' : 'p-3'}`}>
                  <div className="flex items-start">
                    {/* Task Checkbox */}
                    <div className="flex-shrink-0 mt-0.5">
                      <input 
                        type="checkbox"
                        id={`task-flat-${task.id}`}
                        checked={task.status === TaskStatus.COMPLETED}
                        onChange={(e) => handleTaskCompletion(task.id, e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                    
                    {/* Task Content */}
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <label 
                            htmlFor={`task-flat-${task.id}`}
                            className={`${screenSize === 'xxs' || screenSize === 'xs' ? 'text-xs' : 'text-sm'} font-medium ${
                              task.status === TaskStatus.COMPLETED 
                                ? 'text-gray-500 dark:text-gray-400 line-through' 
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </label>
                          <div className={`${screenSize === 'xxs' ? 'text-2xs' : 'text-xs'} text-gray-500 dark:text-gray-400`}>
                            {task.projectName}
                          </div>
                        </div>
                        
                        {/* Priority Icon */}
                        <div className={`flex-shrink-0 ${getPriorityClasses(task.priority)}`}>
                          {getPriorityIcon(task.priority)}
                        </div>
                      </div>
                      
                      {/* Task Meta */}
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        {/* Due Date */}
                        <span className={`${screenSize === 'xxs' ? 'text-2xs' : 'text-xs'} ${
                          task.isOverdue && task.status !== TaskStatus.COMPLETED 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {new Intl.DateTimeFormat(locale, { 
                            month: 'short', 
                            day: 'numeric' 
                          }).format(task.dueDate)}
                        </span>
                        
                        {/* Status Badge */}
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full ${screenSize === 'xxs' ? 'text-2xs' : 'text-xs'} font-medium ${getStatusBadgeClasses(task.status)}`}>
                          {t(`task.status.${task.status}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Project grouped tasks */}
        {groupByProject && (
          Object.keys(groupedTasks).length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <p className={`${screenSize === 'xxs' || screenSize === 'xs' ? 'text-xs' : 'text-sm'}`}>{t('task.noTasksInFilter')}</p>
          </div>
        ) : Object.keys(groupedTasks).map(projectId => (
          <div key={projectId} className="mb-4">
            {/* Project Header */}
            <div 
              className="flex items-center justify-between cursor-pointer py-2 px-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
              onClick={() => toggleProjectExpanded(projectId)}
            >
              <h3 className={`${screenSize === 'xxs' || screenSize === 'xs' ? 'text-xs' : 'text-sm'} font-medium text-gray-900 dark:text-white`}>
                {groupedTasks[projectId].projectName}
              </h3>
              
              <div className="flex items-center">
                <span className={`${screenSize === 'xxs' ? 'text-2xs' : 'text-xs'} text-gray-500 dark:text-gray-400 mr-2`}>
                  {groupedTasks[projectId].tasks.length} {t('task.tasks')}
                </span>
                
                <svg 
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 transform ${expandedProjects[projectId] ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Project Tasks */}
            {expandedProjects[projectId] && (
              <div className={`space-y-2 mt-2 ${screenSize === 'xxs' ? 'pl-1' : 'pl-2'}`}>
                {groupedTasks[projectId].tasks.map((task: any) => (
                  <div 
                    key={task.id} 
                    className={`rounded-md border ${
                      task.isOverdue && task.status !== TaskStatus.COMPLETED 
                        ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className={`${screenSize === 'xxs' || screenSize === 'xs' ? 'p-2' : 'p-3'}`}>
                      <div className="flex items-start">
                        {/* Task Checkbox */}
                        <div className="flex-shrink-0 mt-0.5">
                          <input 
                            type="checkbox"
                            id={`task-${task.id}`}
                            checked={task.status === TaskStatus.COMPLETED}
                            onChange={(e) => handleTaskCompletion(task.id, e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                          />
                        </div>
                        
                        {/* Task Content */}
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <label 
                              htmlFor={`task-${task.id}`}
                              className={`${screenSize === 'xxs' || screenSize === 'xs' ? 'text-xs' : 'text-sm'} font-medium ${
                                task.status === TaskStatus.COMPLETED 
                                  ? 'text-gray-500 dark:text-gray-400 line-through' 
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {task.title}
                            </label>
                            
                            {/* Priority Icon */}
                            <div className={`flex-shrink-0 ${getPriorityClasses(task.priority)}`}>
                              {getPriorityIcon(task.priority)}
                            </div>
                          </div>
                          
                          {/* Task Meta */}
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                            {/* Due Date */}
                            <span className={`${screenSize === 'xxs' ? 'text-2xs' : 'text-xs'} ${
                              task.isOverdue && task.status !== TaskStatus.COMPLETED 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {t('task.dueDate')}: {new Intl.DateTimeFormat(locale, { 
                                month: 'short', 
                                day: 'numeric' 
                              }).format(task.dueDate)}
                            </span>
                            
                            {/* Status Badge */}
                            <span className={`inline-flex items-center ${screenSize === 'xxs' ? 'px-1 py-0.5 text-2xs' : screenSize === 'xs' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs'} rounded-full font-medium ${getStatusBadgeClasses(task.status)}`}>
                              {t(`task.status.${task.status}`)}
                            </span>
                            
                            {/* Block Reason (if applicable) */}
                            {task.status === TaskStatus.BLOCKED && task.blockReason && (
                              <span className="text-red-600 dark:text-red-400">
                                {task.blockReason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Widget Footer with view options for mobile */}
      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <Link 
          href="/dashboard/tasks"
          className={`${screenSize === 'xxs' || screenSize === 'xs' ? 'text-xs' : 'text-sm'} text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center`}
        >
          {t('task.viewAllTasks')} 
          <svg className={`${screenSize === 'xxs' || screenSize === 'xs' ? 'w-3 h-3' : 'w-4 h-4'} ml-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        
        {/* View toggle (only on wider screens) */}
        {screenSize !== 'xxs' && screenSize !== 'xs' && (
          <button
            onClick={() => {
              // In a real application, this would update the widget settings
              console.log(`Toggling groupByProject from ${groupByProject} to ${!groupByProject}`);
            }}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {groupByProject ? t('task.viewList') : t('task.viewGroups')}
          </button>
        )}
      </div>
    </div>
  );
};

export default MyTasksWidget;
