import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import { TaskStatus, TaskPriority } from '@/lib/types/task';
import { WidgetProps } from '@/lib/types/widget';

// Mock service for team tasks data
const fetchTeamTasks = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    users: [
      {
        id: 'user-001',
        name: 'Alex Johnson',
        role: 'Project Manager',
        avatar: '/images/avatars/alex.jpg',
        taskCount: {
          [TaskStatus.TODO]: 4,
          [TaskStatus.IN_PROGRESS]: 2,
          [TaskStatus.BLOCKED]: 1,
          [TaskStatus.COMPLETED]: 7
        },
        tasks: [
          {
            id: 'task-101',
            title: 'Review design documents',
            projectId: 'proj-001',
            projectName: 'Downtown Office Renovation',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.HIGH,
            dueDate: new Date(2025, 4, 15)
          },
          {
            id: 'task-102',
            title: 'Client progress meeting',
            projectId: 'proj-001',
            projectName: 'Downtown Office Renovation',
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            dueDate: new Date(2025, 4, 18)
          }
        ]
      },
      {
        id: 'user-002',
        name: 'Sarah Chen',
        role: 'Architect',
        avatar: '/images/avatars/sarah.jpg',
        taskCount: {
          [TaskStatus.TODO]: 2,
          [TaskStatus.IN_PROGRESS]: 3,
          [TaskStatus.BLOCKED]: 0,
          [TaskStatus.COMPLETED]: 5
        },
        tasks: [
          {
            id: 'task-201',
            title: 'Update floor plans',
            projectId: 'proj-001',
            projectName: 'Downtown Office Renovation',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.HIGH,
            dueDate: new Date(2025, 4, 14)
          },
          {
            id: 'task-202',
            title: 'Finalize material specifications',
            projectId: 'proj-002',
            projectName: 'Highland Park Residence',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.MEDIUM,
            dueDate: new Date(2025, 4, 17)
          }
        ]
      },
      {
        id: 'user-003',
        name: 'Carlos Rodriguez',
        role: 'Construction Manager',
        avatar: '/images/avatars/carlos.jpg',
        taskCount: {
          [TaskStatus.TODO]: 5,
          [TaskStatus.IN_PROGRESS]: 1,
          [TaskStatus.BLOCKED]: 2,
          [TaskStatus.COMPLETED]: 3
        },
        tasks: [
          {
            id: 'task-301',
            title: 'Site inspection for foundation',
            projectId: 'proj-002',
            projectName: 'Highland Park Residence',
            status: TaskStatus.BLOCKED,
            priority: TaskPriority.CRITICAL,
            dueDate: new Date(2025, 4, 10),
            blockReason: 'Waiting for site clearance'
          },
          {
            id: 'task-302',
            title: 'Equipment rental scheduling',
            projectId: 'proj-003',
            projectName: 'Riverside Mall Expansion',
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            dueDate: new Date(2025, 4, 19)
          }
        ]
      },
      {
        id: 'user-004',
        name: 'Diana Mitchell',
        role: 'Interior Designer',
        avatar: '/images/avatars/diana.jpg',
        taskCount: {
          [TaskStatus.TODO]: 3,
          [TaskStatus.IN_PROGRESS]: 2,
          [TaskStatus.BLOCKED]: 0,
          [TaskStatus.COMPLETED]: 6
        },
        tasks: [
          {
            id: 'task-401',
            title: 'Material sample procurement',
            projectId: 'proj-001',
            projectName: 'Downtown Office Renovation',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.MEDIUM,
            dueDate: new Date(2025, 4, 16)
          },
          {
            id: 'task-402',
            title: 'Lighting plan finalization',
            projectId: 'proj-002',
            projectName: 'Highland Park Residence',
            status: TaskStatus.TODO,
            priority: TaskPriority.HIGH,
            dueDate: new Date(2025, 4, 20)
          }
        ]
      }
    ]
  };
};

// Helper function to calculate capacity indicator
const calculateCapacity = (taskCounts: Record<TaskStatus, number>) => {
  const total = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
  const active = taskCounts[TaskStatus.IN_PROGRESS] + taskCounts[TaskStatus.BLOCKED];
  const completed = taskCounts[TaskStatus.COMPLETED];
  
  // Calculate capacity percentage (assuming 5 active tasks is 100% capacity)
  const capacityPercentage = Math.min((active / 5) * 100, 100);
  
  let capacityLevel = 'normal';
  if (capacityPercentage >= 90) {
    capacityLevel = 'overloaded';
  } else if (capacityPercentage >= 70) {
    capacityLevel = 'high';
  } else if (capacityPercentage <= 30) {
    capacityLevel = 'low';
  }
  
  return {
    percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
    capacityPercentage,
    capacityLevel
  };
};

// Helper function to get color classes for capacity indicator
const getCapacityColorClass = (capacityLevel: string) => {
  switch (capacityLevel) {
    case 'low':
      return 'bg-green-500';
    case 'normal':
      return 'bg-blue-500';
    case 'high':
      return 'bg-orange-500';
    case 'overloaded':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

// Widget settings interface
interface TeamTasksWidgetSettings {
  displayCount?: number;
  screenSize?: string;
  refreshRate?: string | number;
  showAllTeamMembers?: boolean;
}

const TeamTasksWidget: React.FC<WidgetProps> = ({ id, title, settings }) => {
  const { t } = useTranslations('dashboard');
  const dragItem = useRef<any>(null);
  const dragOverItem = useRef<any>(null);
  
  // Extract settings with defaults
  const {
    displayCount = 5,
    screenSize = 'md',
    showAllTeamMembers = true
  } = settings as TeamTasksWidgetSettings || {};
  
  const [teamData, setTeamData] = useState<any | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Load team data
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTeamTasks();
        setTeamData(data);
        
        // Initialize all users as collapsed by default
        const initialExpandedState = data.users.reduce((acc: Record<string, boolean>, user: any) => {
          acc[user.id] = false;
          return acc;
        }, {});
        
        setExpandedUsers(initialExpandedState);
        
        setError(null);
      } catch (err) {
        console.error('Error loading team tasks:', err);
        setError(err instanceof Error ? err : new Error('Failed to load team tasks'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTeamData();
    
    // Set up refresh interval if specified in settings
    const refreshRate = settings?.refreshRate ? 
      (typeof settings.refreshRate === 'string' ? parseInt(settings.refreshRate) : settings.refreshRate) : null;
    if (refreshRate && refreshRate !== 'auto') {
      const interval = setInterval(loadTeamData, refreshRate * 1000);
      return () => clearInterval(interval);
    }
  }, [settings]);
  
  // Toggle user task expansion
  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };
  
  // Drag start handler
  const handleDragStart = (e: React.DragEvent, taskId: string, userId: string) => {
    dragItem.current = { taskId, userId };
    setIsDragging(true);
    
    // Set ghost drag image (optional)
    const ghostElement = document.createElement('div');
    ghostElement.classList.add('bg-blue-100', 'p-2', 'rounded', 'shadow', 'text-sm');
    ghostElement.textContent = teamData.users
      .find((user: any) => user.id === userId)
      .tasks.find((task: any) => task.id === taskId).title;
    
    document.body.appendChild(ghostElement);
    ghostElement.style.position = 'absolute';
    ghostElement.style.top = '-1000px';
    
    e.dataTransfer.setDragImage(ghostElement, 0, 0);
    
    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);
  };
  
  // Drag over handler
  const handleDragOver = (e: React.DragEvent, userId: string) => {
    e.preventDefault();
    dragOverItem.current = userId;
  };
  
  // Drop handler
  const handleDrop = (e: React.DragEvent, targetUserId: string) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (
      !dragItem.current || 
      !dragOverItem.current || 
      dragItem.current.userId === targetUserId
    ) {
      return;
    }
    
    const { taskId, userId: sourceUserId } = dragItem.current;
    
    // Find the task in the source user's tasks
    const sourceUser = teamData.users.find((user: any) => user.id === sourceUserId);
    const taskToMove = sourceUser.tasks.find((task: any) => task.id === taskId);
    
    if (!taskToMove) return;
    
    // Create a copy of the team data
    const updatedTeamData = {
      ...teamData,
      users: teamData.users.map((user: any) => {
        if (user.id === sourceUserId) {
          // Remove task from source user
          return {
            ...user,
            tasks: user.tasks.filter((task: any) => task.id !== taskId),
            taskCount: {
              ...user.taskCount,
              [taskToMove.status]: Math.max(0, user.taskCount[taskToMove.status] - 1)
            }
          };
        }
        
        if (user.id === targetUserId) {
          // Add task to target user
          return {
            ...user,
            tasks: [...user.tasks, taskToMove],
            taskCount: {
              ...user.taskCount,
              [taskToMove.status]: (user.taskCount[taskToMove.status] || 0) + 1
            }
          };
        }
        
        return user;
      })
    };
    
    setTeamData(updatedTeamData);
    
    // In a real implementation, this would call an API to reassign the task
    console.log(`Reassigning task ${taskId} from ${sourceUserId} to ${targetUserId}`);
    
    // Automatically expand the target user's task list
    setExpandedUsers(prev => ({
      ...prev,
      [targetUserId]: true
    }));
  };
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className={`animate-spin rounded-full ${screenSize === 'xxs' || screenSize === 'xs' ? 'h-4 w-4' : 'h-6 w-6'} border-t-2 border-b-2 border-blue-600`}></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-500">
        <p className={`${screenSize === 'xxs' || screenSize === 'xs' ? 'text-xs' : 'text-sm'}`}>{t('widget.errorLoading')}</p>
        <p className={`${screenSize === 'xxs' ? 'text-xs' : 'text-sm'} mt-1`}>{error.message}</p>
      </div>
    );
  }
  
  if (!teamData || teamData.users.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p className={`${screenSize === 'xxs' || screenSize === 'xs' ? 'text-xs' : 'text-sm'}`}>{t('task.noTeamMembers')}</p>
      </div>
    );
  }
  
  // Filter users to display based on settings
  const displayedUsers = teamData.users.slice(0, showAllTeamMembers ? teamData.users.length : displayCount);
  
  return (
    <div className="h-full flex flex-col">
      <div className={`${screenSize === 'xxs' ? 'text-2xs' : 'text-xs'} text-gray-500 dark:text-gray-400 mb-2`}>
        {screenSize === 'xxs' || screenSize === 'xs' ? t('task.dragMobile') || 'Tap to expand' : t('task.dragTasksMessage')}
      </div>
      
      <div className={`flex-1 overflow-y-auto ${screenSize === 'xxs' ? 'space-y-2' : 'space-y-3'}`}>
        {displayedUsers.map((user: any) => {
          const { capacityPercentage, capacityLevel, percentComplete } = calculateCapacity(user.taskCount);
          
          return (
            <div 
              key={user.id} 
              className={`border rounded-lg ${
                isDragging && dragOverItem.current === user.id
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              } ${screenSize === 'xxs' ? 'text-xs' : ''}`}
            >
              {/* User Avatar */}
              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.role}
                </p>
              </div>

              {/* Task Count Pills */}
              <div className="flex items-center space-x-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {user.taskCount[TaskStatus.TO_DO]}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {user.taskCount[TaskStatus.IN_PROGRESS]}
                </span>
                {user.taskCount[TaskStatus.BLOCKED] > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    {user.taskCount[TaskStatus.BLOCKED]}
                  </span>
                )}
              </div>

              {/* Capacity Indicator */}
              <div className="flex items-center">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getCapacityColorClass(capacityLevel)}`}
                    style={{ width: `${capacityPercentage}%` }}
                  ></div>
                </div>
                <svg 
                  className={`w-4 h-4 ml-1 text-gray-500 dark:text-gray-400 transform ${expandedUsers[user.id] ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* User Tasks */}
            {expandedUsers[user.id] && (
              <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700">
                {user.tasks.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                    {t('task.noAssignedTasks')}
                  </p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {user.tasks.map((task: any) => (
                      <div 
                        key={task.id}
                        className="p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id, user.id)}
                      >
                        <div className={`flex items-center justify-between ${screenSize === 'xxs' || screenSize === 'xs' ? 'p-2' : 'p-3'} cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg`} onClick={() => toggleUserExpanded(user.id)}>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {task.title}
                            </h4>
                            <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <span>{task.projectName}</span>
                              <span className="mx-1">•</span>
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div>
                              {task.status === TaskStatus.BLOCKED && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                  {t('task.status.BLOCKED')}
                                </span>
                              )}
                              {task.status === TaskStatus.IN_PROGRESS && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                  {t('task.status.IN_PROGRESS')}
                                </span>
                              )}
                              {task.status === TaskStatus.TO_DO && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  {t('task.status.TO_DO')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-gray-400 mr-1"></div>
            <span>{t('task.status.TO_DO')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
            <span>{t('task.status.IN_PROGRESS')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
            <span>{t('task.status.BLOCKED')}</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
          <span>{t('task.capacityIndicator')}</span>
        </div>
      </div>
    </div>
  );
};

export default TeamTasksWidget;
