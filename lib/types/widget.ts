/**
 * Widget type definitions for BuildTrack Pro dashboard
 */

export enum WidgetSize {
  SMALL = 'small',   // 1x1 grid
  MEDIUM = 'medium', // 2x1 or 1x2 grid
  LARGE = 'large',   // 2x2 grid
}

export enum WidgetType {
  // Project Overview Widgets
  ACTIVE_PROJECTS = 'ACTIVE_PROJECTS',
  PROJECT_TIMELINE = 'PROJECT_TIMELINE',
  PROJECT_HEALTH = 'PROJECT_HEALTH',
  
  // Task Management Widgets
  MY_TASKS = 'MY_TASKS',
  TEAM_TASKS = 'TEAM_TASKS',
  CRITICAL_PATH = 'CRITICAL_PATH',
  
  // Analytics & Reporting Widgets
  PROGRESS_REPORTS = 'PROGRESS_REPORTS',
  FINANCIAL_DASHBOARD = 'FINANCIAL_DASHBOARD',
  TEAM_PERFORMANCE = 'TEAM_PERFORMANCE',
  
  // Notification Widgets
  NOTIFICATION_CENTER = 'NOTIFICATION_CENTER',
  
  // Other widget types can be added as needed
  CUSTOM = 'CUSTOM',
}

export interface WidgetProps {
  id: string;
  title: string;
  settings?: Record<string, any>;
  isEditMode?: boolean;
  onSettingsChange?: (settings: Record<string, any>) => void;
}

export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  description: string;
  defaultSize: WidgetSize;
  component: React.ComponentType<WidgetProps>;
  availableSizes: WidgetSize[];
  defaultSettings?: Record<string, any>;
  requiredPermissions?: string[];
}
