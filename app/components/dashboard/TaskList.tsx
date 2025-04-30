'use client';

import { useState, useEffect } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';

/**
 * TaskList Component
 * 
 * Displays a list of tasks with filtering, sorting, and internationalization
 * support. Follows BuildTrack Pro's design system with Primary Blue (rgb(24,62,105))
 * and Primary Orange (rgb(236,107,44)).
 * 
 * Features:
 * - Mobile-first responsive design
 * - Task filtering by status, priority, project
 * - Sorting options
 * - Status indicators with appropriate colors
 * - Full internationalization support
 */
interface Task {
  id: number | string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate: string;
  project: string;
  assignedTo?: string;
}

interface TaskListProps {
  tasks: Task[];
  showFilters?: boolean;
  showProject?: boolean;
  maxItems?: number;
  variant?: 'compact' | 'standard' | 'detailed';
  className?: string;
}

export default function TaskList({
  tasks,
  showFilters = true,
  showProject = true,
  maxItems = 5,
  variant = 'standard',
  className = '',
}: TaskListProps) {
  const { t } = useNamespacedTranslations('tasks');
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [isAscending, setIsAscending] = useState(true);
  
  // Format date to locale string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Determine priority badge color
  const getPriorityColor = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Determine status color
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'not started':
        return 'bg-gray-100 text-gray-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Check if task is overdue
  const isOverdue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);
    return taskDueDate < today;
  };
  
  // Apply filters and sorting
  const applyFilters = () => {
    let result = [...tasks];
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(task => task.status.toLowerCase() === filter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return isAscending ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'priority') {
        const priorityMap: Record<string, number> = { 'high': 3, 'medium': 2, 'low': 1 };
        const prioA = priorityMap[a.priority.toLowerCase()] || 0;
        const prioB = priorityMap[b.priority.toLowerCase()] || 0;
        return isAscending ? prioA - prioB : prioB - prioA;
      } else {
        // Sort by title
        return isAscending 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      }
    });
    
    setFilteredTasks(result);
  };
  
  // Handle filter changes
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value);
  };
  
  // Handle sort changes
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
  };
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    setIsAscending(!isAscending);
  };
  
  // Apply filters when filter or sort options change
  useEffect(() => {
    applyFilters();
  }, [filter, sortBy, isAscending, tasks]);
  
  // Limit items based on maxItems prop
  const displayedTasks = filteredTasks.slice(0, maxItems);

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-[rgb(24,62,105)] bg-opacity-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-[rgb(24,62,105)]">{t('title')}</h3>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="flex items-center">
              <label htmlFor="filter" className="text-sm text-gray-600 mr-2">
                {t('filter')}:
              </label>
              <select
                id="filter"
                className="text-sm border border-gray-300 rounded px-2 py-1"
                value={filter}
                onChange={handleFilterChange}
              >
                <option value="all">{t('status.all')}</option>
                <option value="not started">{t('status.notstarted')}</option>
                <option value="in progress">{t('status.inprogress')}</option>
                <option value="completed">{t('status.completed')}</option>
                <option value="blocked">{t('status.blocked')}</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label htmlFor="sort" className="text-sm text-gray-600 mr-2">
                {t('sort')}:
              </label>
              <select
                id="sort"
                className="text-sm border border-gray-300 rounded px-2 py-1 mr-2"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="dueDate">{t('dueDate')}</option>
                <option value="priority">{t('priority')}</option>
                <option value="title">{t('taskName')}</option>
              </select>
              <button
                onClick={toggleSortDirection}
                className="text-gray-600 hover:text-gray-800 p-1"
                title={isAscending ? t('sortAscending') : t('sortDescending')}
              >
                {isAscending ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tasks List */}
      <div className="divide-y divide-gray-200">
        {displayedTasks.length > 0 ? (
          displayedTasks.map(task => (
            <div key={task.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    className="mt-1 mr-3 h-4 w-4 text-[rgb(236,107,44)] focus:ring-[rgb(236,107,44)] border-gray-300 rounded"
                    id={`task-${task.id}`}
                  />
                  <div>
                    <label 
                      htmlFor={`task-${task.id}`}
                      className="block text-sm font-medium text-gray-900"
                    >
                      {task.title}
                    </label>
                    {variant !== 'compact' && task.description && (
                      <p className="mt-1 text-xs text-gray-500">{task.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                    {t(`tasks.priority.${task.priority.toLowerCase()}`)}
                  </span>
                  {variant === 'detailed' && (
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                      {t(`tasks.status.${task.status.toLowerCase().replace(' ', '')}`)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-2 text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  {showProject && (
                    <span>
                      {t('project')}: <span className="font-medium">{task.project}</span>
                    </span>
                  )}
                  {task.assignedTo && variant !== 'compact' && (
                    <span>
                      {t('assignedTo')}: <span className="font-medium">{task.assignedTo}</span>
                    </span>
                  )}
                </div>
                <span className={`mt-1 sm:mt-0 ${isOverdue(task.dueDate) ? 'text-red-600 font-semibold' : ''}`}>
                  {t('due')}: {formatDate(task.dueDate)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            {t('noTasks')}
          </div>
        )}
      </div>
      
      {/* View All Link - only show if there are more tasks than the maxItems limit */}
      {filteredTasks.length > maxItems && (
        <div className="px-4 py-3 border-t border-gray-200 text-center">
          <a 
            href="/tasks" 
            className="text-sm text-[rgb(236,107,44)] hover:text-[rgb(216,87,24)] transition-colors"
          >
            {t('viewAll')} ({filteredTasks.length - maxItems} {t('more')})
          </a>
        </div>
      )}
    </div>
  );
}
