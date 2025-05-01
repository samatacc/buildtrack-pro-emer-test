import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslations } from '@/app/hooks/useTranslations';
import KanbanColumn from './KanbanColumn';
import KanbanTask from './KanbanTask';
import { PlusIcon, CogIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// Task status options
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

// Task priority options 
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Task interface
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  dueDate?: string;
  projectId: string;
  projectName?: string;
  tags?: string[];
  attachments?: number;
  comments?: number;
  createdAt: string;
  updatedAt: string;
}

// Column definition
export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

// Prop definitions
interface KanbanBoardProps {
  projectId?: string; // If undefined, show tasks from all projects
  userId?: string; // If defined, filter by assigned user
  className?: string;
}

// Mock data for testing
const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Review foundation plans',
    description: 'Check structural integrity of foundation plans from engineering team',
    status: 'todo',
    priority: 'high',
    assigneeId: 'user1',
    assigneeName: 'John Doe',
    assigneeAvatar: '/avatars/john.jpg',
    dueDate: '2025-05-15',
    projectId: 'p1',
    projectName: 'Riverfront Residences',
    tags: ['review', 'structural'],
    attachments: 3,
    comments: 5,
    createdAt: '2025-04-20T10:00:00Z',
    updatedAt: '2025-04-25T14:30:00Z'
  },
  {
    id: 't2',
    title: 'Schedule electrical inspection',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: 'user2',
    assigneeName: 'Jane Smith',
    dueDate: '2025-05-10',
    projectId: 'p1',
    projectName: 'Riverfront Residences',
    tags: ['inspection'],
    comments: 2,
    createdAt: '2025-04-22T09:15:00Z',
    updatedAt: '2025-04-22T09:15:00Z'
  },
  {
    id: 't3',
    title: 'Order kitchen appliances',
    description: 'Place order for all kitchen appliances based on approved selections',
    status: 'done',
    priority: 'medium',
    assigneeId: 'user1',
    assigneeName: 'John Doe',
    assigneeAvatar: '/avatars/john.jpg',
    dueDate: '2025-04-28',
    projectId: 'p1',
    projectName: 'Riverfront Residences',
    tags: ['procurement'],
    attachments: 1,
    comments: 3,
    createdAt: '2025-04-15T16:20:00Z',
    updatedAt: '2025-04-28T11:45:00Z'
  },
  {
    id: 't4',
    title: 'Finalize paint colors',
    status: 'review',
    priority: 'low',
    assigneeId: 'user3',
    assigneeName: 'Alice Brown',
    assigneeAvatar: '/avatars/alice.jpg',
    dueDate: '2025-05-05',
    projectId: 'p1',
    projectName: 'Riverfront Residences',
    attachments: 5,
    createdAt: '2025-04-18T13:10:00Z',
    updatedAt: '2025-04-29T10:20:00Z'
  },
  {
    id: 't5',
    title: 'Draft project timeline',
    status: 'backlog',
    priority: 'high',
    projectId: 'p2',
    projectName: 'Silver Creek Office Complex',
    createdAt: '2025-04-30T08:00:00Z',
    updatedAt: '2025-04-30T08:00:00Z'
  },
  {
    id: 't6',
    title: 'Get permits for excavation',
    status: 'todo',
    priority: 'urgent',
    assigneeId: 'user2',
    assigneeName: 'Jane Smith',
    dueDate: '2025-05-12',
    projectId: 'p2',
    projectName: 'Silver Creek Office Complex',
    tags: ['permits', 'legal'],
    comments: 1,
    createdAt: '2025-04-27T11:30:00Z',
    updatedAt: '2025-04-27T11:30:00Z'
  },
  {
    id: 't7',
    title: 'Approve contractor invoices',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'user1',
    assigneeName: 'John Doe',
    assigneeAvatar: '/avatars/john.jpg',
    dueDate: '2025-05-02',
    projectId: 'p1',
    projectName: 'Riverfront Residences',
    tags: ['financial'],
    attachments: 2,
    comments: 4,
    createdAt: '2025-04-25T09:45:00Z',
    updatedAt: '2025-04-28T14:15:00Z'
  }
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  userId,
  className = ''
}) => {
  const { t } = useTranslations('project.kanban');
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load and filter tasks
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real implementation, this would fetch from the API
        // For now, using our mock data
        let filteredTasks = [...mockTasks];
        
        // Filter by project if specified
        if (projectId) {
          filteredTasks = filteredTasks.filter(task => task.projectId === projectId);
        }
        
        // Filter by assignee if specified
        if (userId) {
          filteredTasks = filteredTasks.filter(task => task.assigneeId === userId);
        }
        
        // Group tasks by status
        const columnDefinitions: KanbanColumn[] = [
          { id: 'backlog', title: t('columns.backlog') || 'Backlog', tasks: [] },
          { id: 'todo', title: t('columns.todo') || 'To Do', tasks: [] },
          { id: 'in_progress', title: t('columns.inProgress') || 'In Progress', tasks: [] },
          { id: 'review', title: t('columns.review') || 'Review', tasks: [] },
          { id: 'done', title: t('columns.done') || 'Done', tasks: [] }
        ];
        
        // Populate columns with filtered tasks
        filteredTasks.forEach(task => {
          const column = columnDefinitions.find(col => col.id === task.status);
          if (column) {
            column.tasks.push(task);
          }
        });
        
        setColumns(columnDefinitions);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Failed to load tasks. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTasks();
  }, [projectId, userId, t]);

  // Move a task from one column to another
  const moveTask = (taskId: string, sourceColumnId: TaskStatus, targetColumnId: TaskStatus) => {
    if (sourceColumnId === targetColumnId) return;
    
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      
      // Find the source and target columns
      const sourceColumn = newColumns.find(col => col.id === sourceColumnId);
      const targetColumn = newColumns.find(col => col.id === targetColumnId);
      
      if (!sourceColumn || !targetColumn) return prevColumns;
      
      // Find the task in the source column
      const taskIndex = sourceColumn.tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) return prevColumns;
      
      // Remove the task from the source column
      const [task] = sourceColumn.tasks.splice(taskIndex, 1);
      
      // Update the task status and add to the target column
      const updatedTask = { ...task, status: targetColumnId, updatedAt: new Date().toISOString() };
      targetColumn.tasks.push(updatedTask);
      
      // In a real implementation, you would also update the task in the database
      
      return newColumns;
    });
    
    // Show success toast
    toast.success(`Task moved to ${t(`columns.${targetColumnId}`)}`);
  };
  
  // Add a new task
  const addTask = () => {
    // In a real implementation, this would open a form to create a new task
    // For now, just show a toast
    toast.success('Task creation dialog would open here');
  };
  
  // Open board settings
  const openBoardSettings = () => {
    // In a real implementation, this would open board settings
    // For now, just show a toast
    toast.success('Board settings would open here');
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(236,107,44)]"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-red-500 text-center">
          <p className="text-lg font-medium">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-[rgb(236,107,44)] text-white rounded-md hover:bg-[rgb(216,87,24)] transition-colors"
            onClick={() => window.location.reload()}
          >
            {t('retry') || 'Retry'}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[rgb(24,62,105)]">
            {projectId 
              ? t('boardTitle.project') || 'Project Tasks' 
              : t('boardTitle.all') || 'All Tasks'}
          </h2>
          
          <div className="flex space-x-2">
            <button 
              onClick={addTask}
              className="flex items-center px-3 py-2 bg-[rgb(236,107,44)] text-white rounded-md hover:bg-[rgb(216,87,24)] transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              {t('actions.addTask') || 'Add Task'}
            </button>
            
            <button 
              onClick={openBoardSettings}
              className="flex items-center p-2 text-gray-600 hover:text-[rgb(24,62,105)] hover:bg-gray-100 rounded-md transition-colors"
              aria-label={t('actions.boardSettings') || 'Board Settings'}
            >
              <CogIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          <div className="flex h-full space-x-4 pb-4">
            {columns.map(column => (
              <KanbanColumn 
                key={column.id} 
                id={column.id} 
                title={column.title} 
                tasks={column.tasks}
                onMoveTask={moveTask}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
