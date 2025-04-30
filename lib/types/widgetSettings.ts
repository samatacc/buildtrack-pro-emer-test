import { ProjectHealth } from './project';

// Common settings that apply to all widgets
export interface CommonWidgetSettings {
  refreshRate?: number; // in seconds
  displayMode?: 'compact' | 'detailed' | 'auto';
  customTitle?: string;
  screenSize?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'; // Responsive design support
}

// Define specific settings interfaces for each widget type
export interface ActiveProjectsWidgetSettings extends CommonWidgetSettings {
  projectCount?: number;
  sortBy?: 'name' | 'dueDate' | 'health';
  sortDirection?: 'asc' | 'desc';
  filterByHealth?: ProjectHealth | 'all';
  showCompletedProjects?: boolean;
}

export interface ProjectTimelineWidgetSettings extends CommonWidgetSettings {
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  projectIds?: string[];
  showMilestones?: boolean;
}

export interface ProjectHealthWidgetSettings extends CommonWidgetSettings {
  showHealthBreakdown?: boolean;
  projectCount?: number;
  filterByHealth?: ProjectHealth | 'all';
}

export interface TaskWidgetSettings extends CommonWidgetSettings {
  maxTasks?: number;
  sortBy?: 'dueDate' | 'priority' | 'name';
  sortDirection?: 'asc' | 'desc';
  showCompleted?: boolean;
  groupBy?: 'project' | 'assignee' | 'priority' | 'none';
}

export interface AnalyticsWidgetSettings extends CommonWidgetSettings {
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  chartType?: 'line' | 'bar' | 'pie';
  dataPoints?: number;
  compareWithPrevious?: boolean;
}

export interface NotificationWidgetSettings extends CommonWidgetSettings {
  maxNotifications?: number;
  categories?: string[];
  markAsReadOnOpen?: boolean;
}

// Type union for all widget settings
export type WidgetSettings = 
  | ActiveProjectsWidgetSettings
  | ProjectTimelineWidgetSettings
  | ProjectHealthWidgetSettings
  | TaskWidgetSettings
  | AnalyticsWidgetSettings
  | NotificationWidgetSettings
  | Record<string, any>; // Fallback for custom widgets
