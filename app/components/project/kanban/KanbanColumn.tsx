import React from 'react';
import { useDrop } from 'react-dnd';
import { useTranslations } from '@/app/hooks/useTranslations';
import KanbanTask from './KanbanTask';
import { Task, TaskStatus } from './KanbanBoard';
import { PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onMoveTask: (taskId: string, sourceStatus: TaskStatus, targetStatus: TaskStatus) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  onMoveTask
}) => {
  const { t } = useTranslations('project.kanban');
  
  // Set up drop target for drag and drop
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { id: string; status: TaskStatus }) => {
      onMoveTask(item.id, item.status, id);
    },
    canDrop: (item: { id: string; status: TaskStatus }) => item.status !== id,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });
  
  // Add a new task to this column
  const handleAddTask = () => {
    // In a real implementation, this would open a form pre-populated with the column status
    toast.success(`Add task to ${title}`);
  };
  
  // Get the appropriate background color based on drop state
  const getBackgroundColor = () => {
    if (isOver && canDrop) {
      return 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20';
    }
    if (canDrop) {
      return 'bg-gray-50 dark:bg-gray-800';
    }
    return 'bg-gray-50 dark:bg-gray-800';
  };
  
  // Get column header color based on column id
  const getHeaderColor = () => {
    switch (id) {
      case 'backlog':
        return 'bg-gray-200 dark:bg-gray-700';
      case 'todo':
        return 'bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-30';
      case 'in_progress':
        return 'bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30';
      case 'review':
        return 'bg-purple-100 dark:bg-purple-900 dark:bg-opacity-30';
      case 'done':
        return 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30';
      default:
        return 'bg-gray-200 dark:bg-gray-700';
    }
  };
  
  return (
    <div 
      ref={drop}
      className={`flex flex-col w-72 shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors ${getBackgroundColor()}`}
    >
      {/* Column header */}
      <div className={`px-3 py-2 ${getHeaderColor()} flex justify-between items-center`}>
        <div className="font-medium text-[rgb(24,62,105)] dark:text-white">
          {title}
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {tasks.length}
          </span>
        </div>
        
        <button
          onClick={handleAddTask}
          className="p-1 rounded-full hover:bg-white/30 dark:hover:bg-black/20 text-gray-600 dark:text-gray-300"
          aria-label={t('actions.addToColumn') || 'Add to column'}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      
      {/* Tasks container */}
      <div className="flex-1 p-2 overflow-y-auto max-h-[calc(100vh-220px)]">
        {tasks.length === 0 ? (
          <div className="h-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
            {t('emptyColumn') || 'No tasks'}
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <KanbanTask 
                key={task.id} 
                task={task}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
