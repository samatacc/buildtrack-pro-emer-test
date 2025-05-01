import React, { useState } from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Task, TaskStatus, TaskPriority } from './KanbanBoard';
import { 
  XMarkIcon, 
  CalendarIcon,
  PaperClipIcon,
  ChatBubbleLeftIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask?: (updatedTask: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

// Status options for the dropdown
const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'backlog', label: 'Backlog', color: 'bg-gray-200' },
  { value: 'todo', label: 'To Do', color: 'bg-yellow-100' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100' },
  { value: 'review', label: 'Review', color: 'bg-purple-100' },
  { value: 'done', label: 'Done', color: 'bg-green-100' }
];

// Priority options for the dropdown
const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' }
];

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask
}) => {
  const { t } = useTranslations('project.kanban');
  const [isEditing, setIsEditing] = useState(false);
  const [updatedTask, setUpdatedTask] = useState<Task | null>(null);
  
  // Initialize the updated task when the modal opens
  React.useEffect(() => {
    if (task) {
      setUpdatedTask(task);
    }
  }, [task]);
  
  if (!isOpen || !task || !updatedTask) return null;
  
  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onUpdateTask && updatedTask) {
      onUpdateTask(updatedTask);
      setIsEditing(false);
      toast.success('Task updated successfully');
    }
  };
  
  // Handle task deletion
  const handleDelete = () => {
    if (onDeleteTask) {
      onDeleteTask(task.id);
      onClose();
      toast.success('Task deleted successfully');
    }
  };
  
  // Handle field changes
  const handleChange = (field: keyof Task, value: any) => {
    if (updatedTask) {
      setUpdatedTask({
        ...updatedTask,
        [field]: value
      });
    }
  };
  
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden z-10">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mr-3">
              {isEditing ? 'Edit Task' : 'Task Details'}
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                aria-label={t('actions.edit')}
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            aria-label={t('actions.close')}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={updatedTask.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={updatedTask.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] dark:bg-gray-700 dark:text-white h-24"
                />
              </div>
              
              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={updatedTask.status}
                    onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] dark:bg-gray-700 dark:text-white"
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={updatedTask.priority}
                    onChange={(e) => handleChange('priority', e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] dark:bg-gray-700 dark:text-white"
                  >
                    {PRIORITY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Due Date */}
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={updatedTask.dueDate ? new Date(updatedTask.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={updatedTask.tags?.join(', ') || ''}
                  onChange={(e) => handleChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. urgent, documentation, frontend"
                />
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors"
                >
                  Delete Task
                </button>
                
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[rgb(236,107,44)] text-white rounded-md hover:bg-[rgb(216,87,24)] transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {task.title}
                </h3>
                
                {/* Project info */}
                {task.projectName && (
                  <div className="text-sm text-[rgb(24,62,105)] dark:text-blue-300 mt-1">
                    Project: {task.projectName}
                  </div>
                )}
              </div>
              
              {/* Status and Priority */}
              <div className="flex flex-wrap gap-3">
                {/* Status badge */}
                {task.status && (
                  <div className="flex items-center">
                    <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      Status: {STATUS_OPTIONS.find(opt => opt.value === task.status)?.label || task.status}
                    </span>
                  </div>
                )}
                
                {/* Priority badge */}
                {task.priority && (
                  <div className="flex items-center">
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      PRIORITY_OPTIONS.find(opt => opt.value === task.priority)?.color || 'bg-gray-100 text-gray-800'
                    } dark:bg-opacity-20`}>
                      Priority: {PRIORITY_OPTIONS.find(opt => opt.value === task.priority)?.label || task.priority}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-gray-800 dark:text-gray-200">
                  {task.description || 'No description provided.'}
                </div>
              </div>
              
              {/* Task metadata */}
              <div className="grid grid-cols-2 gap-4">
                {/* Assignee */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assignee
                  </h4>
                  <div className="flex items-center">
                    {task.assigneeName ? (
                      <>
                        {task.assigneeAvatar ? (
                          <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 mr-2">
                            <Image
                              src={task.assigneeAvatar}
                              alt={task.assigneeName}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-[rgb(24,62,105)] flex items-center justify-center text-white mr-2">
                            {task.assigneeName.charAt(0)}
                          </div>
                        )}
                        <span>{task.assigneeName}</span>
                      </>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Unassigned</span>
                    )}
                  </div>
                </div>
                
                {/* Due date */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </h4>
                  <div className="flex items-center">
                    {task.dueDate ? (
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">No due date</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </h4>
                {task.tags && task.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">No tags</span>
                )}
              </div>
              
              {/* Attachments and Comments placeholders */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attachments
                  </h4>
                  {task.attachments && task.attachments > 0 ? (
                    <div className="flex items-center">
                      <PaperClipIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                      <span>{task.attachments} files</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">No attachments</span>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comments
                  </h4>
                  {task.comments && task.comments > 0 ? (
                    <div className="flex items-center">
                      <ChatBubbleLeftIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                      <span>{task.comments} comments</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">No comments</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
