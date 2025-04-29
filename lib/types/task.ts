/**
 * Task Management Types
 * 
 * Defines the core type definitions for task management within the Project Management Module.
 * Following BuildTrack Pro design principles and technical standards.
 */

/**
 * Task status represents the current state of a task in its lifecycle
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  REVIEW = 'review',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Task priority levels
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Task category to group similar tasks
 */
export enum TaskCategory {
  PLANNING = 'planning',
  DESIGN = 'design',
  PROCUREMENT = 'procurement',
  CONSTRUCTION = 'construction',
  INSPECTION = 'inspection',
  ADMINISTRATION = 'administration',
  MAINTENANCE = 'maintenance',
  OTHER = 'other'
}

/**
 * Type of dependency relationship between tasks
 */
export enum DependencyType {
  FINISH_TO_START = 'finish-to-start', // Task B can't start until Task A is finished
  START_TO_START = 'start-to-start',   // Task B can't start until Task A starts
  FINISH_TO_FINISH = 'finish-to-finish', // Task B can't finish until Task A is finished
  START_TO_FINISH = 'start-to-finish'   // Task B can't finish until Task A starts
}

/**
 * Task dependency relationship
 */
export interface TaskDependency {
  dependsOnTaskId: string;
  type: DependencyType;
  note?: string;
}

/**
 * Comment on a task
 */
export interface TaskComment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  mentions?: string[]; // User IDs
  isResolved?: boolean;
  parentCommentId?: string; // For threaded comments
  reactions?: {
    type: string;
    count: number;
    users: string[]; // User IDs
  }[];
}

/**
 * Time tracking information for a task
 */
export interface TimeTracking {
  estimatedHours: number;
  trackedTime: {
    userId: string;
    startTime: Date;
    endTime?: Date;
    duration?: number; // In minutes
    description?: string;
  }[];
  totalTrackedMinutes: number;
}

/**
 * A subtask represents a smaller unit of work within a task
 */
export interface Subtask {
  id: string;
  name: string;
  description?: string;
  isCompleted: boolean;
  assigneeId?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  estimatedHours?: number;
}

/**
 * Complete task data model
 */
export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  
  // Assignment
  assigneeId?: string;
  reporterId: string; // User who created the task
  watchers?: string[]; // User IDs
  
  // Organization
  tags?: string[];
  location?: {
    zone?: string;
    floor?: string;
    coordinates?: [number, number];
  };
  
  // Progress and tracking
  subtasks: Subtask[];
  completion: number; // 0-100
  timeTracking?: TimeTracking;
  
  // Relations
  dependencies: TaskDependency[];
  blockedBy?: string[];
  milestoneId?: string; // Associated milestone
  
  // Interaction
  comments: TaskComment[];
  attachments?: {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    url: string;
    uploadedAt: Date;
    uploadedBy: string; // User ID
  }[];
  
  // Custom fields (configurable per project)
  customFields?: Record<string, any>;
  
  // Tracking
  isOnCriticalPath?: boolean;
  isWatched?: boolean;
  lastViewedAt?: Date;
  
  // Mobile specific data for offline use
  offlineId?: string;
  syncStatus?: 'synced' | 'pending' | 'conflict';
}

/**
 * Task summary for use in lists and boards
 */
export interface TaskSummary {
  id: string;
  projectId: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  assigneeId?: string;
  completion: number;
  isOnCriticalPath?: boolean;
  hasBlockers: boolean;
  subtaskCount: number;
  subtasksCompleted: number;
  commentCount: number;
  attachmentCount: number;
}

/**
 * Task filter options for list/board views
 */
export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  assigneeId?: string[];
  dueDate?: {
    from?: Date;
    to?: Date;
    overdue?: boolean;
  };
  tags?: string[];
  search?: string;
  completion?: {
    min?: number;
    max?: number;
  };
  hasBlockers?: boolean;
  isOnCriticalPath?: boolean;
  customFields?: Record<string, any>;
}
