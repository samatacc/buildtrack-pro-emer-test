import React from 'react';
import { useDrag } from 'react-dnd';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Task } from './KanbanBoard';
import { 
  CalendarIcon, 
  PaperClipIcon, 
  ChatBubbleLeftIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface KanbanTaskProps {
  task: Task;
}

const KanbanTask: React.FC<KanbanTaskProps> = ({ task }) => {
  const { t } = useTranslations('project.kanban');
  
  // Set up drag source for drag and drop
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));
  
  // Format due date to display format
  const formatDueDate = (dateString?: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  // Check if a task is overdue
  const isOverdue = (dateString?: string): boolean => {
    if (!dateString) return false;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dueDate = new Date(dateString);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate < today;
    } catch (error) {
      console.error('Error checking if date is overdue:', error);
      return false;
    }
  };
  
  // Get priority color and label
  const getPriorityInfo = (priority: string): { color: string, label: string } => {
    switch (priority) {
      case 'urgent':
        return { 
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', 
          label: t('priority.urgent') || 'Urgent' 
        };
      case 'high':
        return { 
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', 
          label: t('priority.high') || 'High' 
        };
      case 'medium':
        return { 
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', 
          label: t('priority.medium') || 'Medium' 
        };
      case 'low':
        return { 
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', 
          label: t('priority.low') || 'Low' 
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', 
          label: priority 
        };
    }
  };
  
  const priorityInfo = getPriorityInfo(task.priority);
  const taskOverdue = isOverdue(task.dueDate);
  
  return (
    <div
      ref={drag}
      className={`
        bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-600
        hover:shadow-md transition-all cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {/* Project name - show only if displaying tasks from multiple projects */}
      {task.projectName && (
        <div className="text-xs text-[rgb(24,62,105)] dark:text-blue-300 font-medium mb-1 truncate">
          {task.projectName}
        </div>
      )}
      
      {/* Task title */}
      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
        {task.title}
      </h3>
      
      {/* Priority tag */}
      <div className="flex items-center mb-3 space-x-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityInfo.color}`}>
          {priorityInfo.label}
        </span>
        
        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex space-x-1 overflow-hidden">
            {task.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index} 
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Task metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          {/* Due date */}
          {task.dueDate && (
            <div className={`flex items-center ${taskOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>
              {taskOverdue ? (
                <ExclamationCircleIcon className="h-3.5 w-3.5 mr-1" />
              ) : (
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
              )}
              <span>{formatDueDate(task.dueDate)}</span>
            </div>
          )}
          
          {/* Attachments */}
          {task.attachments && task.attachments > 0 && (
            <div className="flex items-center">
              <PaperClipIcon className="h-3.5 w-3.5 mr-1" />
              <span>{task.attachments}</span>
            </div>
          )}
          
          {/* Comments */}
          {task.comments && task.comments > 0 && (
            <div className="flex items-center">
              <ChatBubbleLeftIcon className="h-3.5 w-3.5 mr-1" />
              <span>{task.comments}</span>
            </div>
          )}
        </div>
        
        {/* Assignee */}
        {task.assigneeName && (
          <div className="flex items-center">
            {task.assigneeAvatar ? (
              <div className="h-5 w-5 rounded-full overflow-hidden bg-gray-200 mr-1">
                <Image
                  src={task.assigneeAvatar}
                  alt={task.assigneeName}
                  width={20}
                  height={20}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full bg-[rgb(24,62,105)] flex items-center justify-center text-white mr-1">
                {task.assigneeName.charAt(0)}
              </div>
            )}
            <span className="max-w-[80px] truncate">{task.assigneeName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanTask;
