/**
 * Widget types for BuildTrack Pro dashboard
 * Defines the available widget types and related interfaces
 */

// Widget type enumeration
export enum WidgetType {
  ACTIVE_PROJECTS = 'ACTIVE_PROJECTS',
  PROJECT_TIMELINE = 'PROJECT_TIMELINE',
  MY_TASKS = 'MY_TASKS',
  TEAM_TASKS = 'TEAM_TASKS',
  PROJECT_HEALTH = 'PROJECT_HEALTH',
  ANALYTICS = 'ANALYTICS',
  CRITICAL_PATH = 'CRITICAL_PATH',
  PROGRESS_REPORTS = 'PROGRESS_REPORTS',
  FINANCIAL_DASHBOARD = 'FINANCIAL_DASHBOARD',
  TEAM_PERFORMANCE = 'TEAM_PERFORMANCE',
  NOTIFICATION_CENTER = 'NOTIFICATION_CENTER'
}

// Widget size enumeration
export enum WidgetSize {
  SMALL = 'small',     // 1-2 columns
  MEDIUM = 'medium',   // 3-4 columns
  LARGE = 'large',     // 6 columns
  EXTRA_LARGE = 'extra_large' // 12 columns (full width)
}

// Widget position in the dashboard grid
export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  static?: boolean;
}

// Base widget settings interface
export interface BaseWidgetSettings {
  refreshInterval?: number; // in seconds
  maxItems?: number;
  colorScheme?: 'default' | 'blue' | 'green' | 'orange' | 'purple';
  showTitle?: boolean;
}

// Widget settings by type
export interface WidgetSettings extends BaseWidgetSettings {
  // Active Projects widget settings
  activeProjects?: {
    showProgress?: boolean;
    sortBy?: 'name' | 'dueDate' | 'progress' | 'status';
    filterStatus?: string[];
  };
  
  // Project Timeline widget settings
  projectTimeline?: {
    zoomLevel?: number;
    showMilestones?: boolean;
    showToday?: boolean;
    filterProjects?: string[];
  };
  
  // Tasks widget settings
  tasks?: {
    showAssignee?: boolean;
    showProject?: boolean;
    sortBy?: 'dueDate' | 'priority' | 'project';
    filterPriority?: string[];
    view?: 'list' | 'kanban';
  };
  
  // Analytics widget settings
  analytics?: {
    chartType?: 'bar' | 'line' | 'pie';
    metric?: 'budget' | 'timeCompletion' | 'tasks';
    timeRange?: '7d' | '30d' | '90d' | 'ytd' | 'all';
  };
}
