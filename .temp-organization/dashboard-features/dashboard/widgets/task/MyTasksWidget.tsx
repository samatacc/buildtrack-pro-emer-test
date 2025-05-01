import React, { useState } from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import { ArrowTopRightOnSquareIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import DragHandle from '../DragHandle';

interface Task {
  id: string;
  title: string;
  project: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface MyTasksWidgetProps {
  isEditMode?: boolean;
}

// Mock tasks data
const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Review contractor proposals',
    project: 'Riverfront Residences',
    dueDate: '2025-05-01',
    priority: 'high',
    completed: false
  },
  {
    id: 't2',
    title: 'Submit permit applications',
    project: 'Silver Creek Office Complex',
    dueDate: '2025-05-03',
    priority: 'high',
    completed: false
  },
  {
    id: 't3',
    title: 'Order materials for kitchen',
    project: 'Riverfront Residences',
    dueDate: '2025-05-10',
    priority: 'medium',
    completed: false
  },
  {
    id: 't4',
    title: 'Schedule inspections',
    project: 'Downtown Renovation',
    dueDate: '2025-05-15',
    priority: 'medium',
    completed: false
  },
  {
    id: 't5',
    title: 'Finalize floor plans',
    project: 'Oakridge Mall Renovation',
    dueDate: '2025-05-20',
    priority: 'low',
    completed: true
  }
];

// Priority color mapping
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const MyTasksWidget: React.FC<MyTasksWidgetProps> = ({ isEditMode = false }) => {
  const { t } = useTranslations('dashboard.widgets');
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  
  // Format due date
  const formatDueDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Check if a due date is overdue
  const isOverdue = (dateString: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  };
  
  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };
  
  // Get filtered tasks (non-completed first, then sorted by due date)
  const filteredTasks = [...tasks]
    .sort((a, b) => {
      // Sort by completion status first
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Then sort by due date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-medium text-[rgb(24,62,105)] dark:text-white flex items-center">
          {t('myTasks.title') || 'My Tasks'}
          
          {isEditMode && (
            <div className="ml-2">
              <DragHandle widgetId="my-tasks" isEditMode={isEditMode} />
            </div>
          )}
        </h3>
        
        <a 
          href="/dashboard/tasks" 
          className="text-sm text-[rgb(236,107,44)] hover:text-[rgb(216,87,24)] flex items-center"
        >
          {t('common.viewAll') || 'View All'}
          <ArrowTopRightOnSquareIcon className="ml-1 h-3 w-3" />
        </a>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredTasks.map(task => (
            <li 
              key={task.id} 
              className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                task.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start">
                <div 
                  className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center cursor-pointer mt-0.5 ${
                    task.completed 
                      ? 'text-green-500' 
                      : 'text-gray-300 dark:text-gray-600 hover:text-green-400'
                  }`}
                  onClick={() => toggleTaskCompletion(task.id)}
                >
                  <CheckCircleIcon className="h-5 w-5" />
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <span className={`text-sm font-medium ${
                      task.completed 
                        ? 'line-through text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.title}
                    </span>
                    
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  <div className="mt-1 flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {task.project}
                    </span>
                    
                    <span className={`text-xs ${
                      isOverdue(task.dueDate) && !task.completed
                        ? 'text-red-600 dark:text-red-400 font-medium'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {isOverdue(task.dueDate) && !task.completed ? 'Overdue: ' : 'Due: '}
                      {formatDueDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
          
          {tasks.length === 0 && (
            <li className="p-4 text-center text-gray-500 dark:text-gray-400">
              {t('myTasks.empty') || 'No tasks found'}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MyTasksWidget;
