import { WidgetType, WidgetSize, WidgetDefinition } from '@/lib/types/widget';

// Import all widget components
import ActiveProjectsWidget from '@/app/components/dashboard/widgets/project/ActiveProjectsWidget';
import ProjectTimelineWidget from '@/app/components/dashboard/widgets/project/ProjectTimelineWidget';
import ProjectHealthWidget from '@/app/components/dashboard/widgets/project/ProjectHealthWidget';
import AnalyticsWidget from '@/app/components/dashboard/widgets/analytics/AnalyticsWidget';

// Import placeholder component for widget types that aren't fully implemented
import PlaceholderWidget from '../../app/components/dashboard/widgets/PlaceholderWidget';

/**
 * Registry of all available widgets in the system
 * This central registry maps widget types to their components and default settings
 */
export const widgetRegistry: Record<WidgetType, WidgetDefinition> = {
  // Project Overview Widgets
  [WidgetType.ACTIVE_PROJECTS]: {
    type: WidgetType.ACTIVE_PROJECTS,
    name: 'Active Projects',
    description: 'View and manage your active projects',
    defaultSize: WidgetSize.MEDIUM,
    component: ActiveProjectsWidget,
    availableSizes: [WidgetSize.MEDIUM, WidgetSize.LARGE],
    defaultSettings: {
      projectCount: 5,
      sortBy: 'dueDate',
      sortDirection: 'asc',
      filterByHealth: 'all',
      showCompletedProjects: false,
      refreshRate: 60 // refresh every 60 seconds
    }
  },
  
  [WidgetType.PROJECT_TIMELINE]: {
    type: WidgetType.PROJECT_TIMELINE,
    name: 'Project Timeline',
    description: 'View project timelines and milestones',
    defaultSize: WidgetSize.LARGE,
    component: ProjectTimelineWidget,
    availableSizes: [WidgetSize.MEDIUM, WidgetSize.LARGE],
    defaultSettings: {
      timeRange: 'month',
      showMilestones: true,
      refreshRate: 300 // refresh every 5 minutes
    }
  },
  
  [WidgetType.PROJECT_HEALTH]: {
    type: WidgetType.PROJECT_HEALTH,
    name: 'Project Health',
    description: 'Monitor the health of your projects',
    defaultSize: WidgetSize.MEDIUM,
    component: ProjectHealthWidget,
    availableSizes: [WidgetSize.SMALL, WidgetSize.MEDIUM, WidgetSize.LARGE],
    defaultSettings: {
      showHealthBreakdown: true,
      projectCount: 5,
      filterByHealth: 'all',
      refreshRate: 120 // refresh every 2 minutes
    }
  },
  
  // Analytics & Reporting Widgets
  [WidgetType.ANALYTICS]: {
    type: WidgetType.ANALYTICS,
    name: 'Analytics & Reporting',
    description: 'View key performance metrics and analytics',
    defaultSize: WidgetSize.MEDIUM,
    component: AnalyticsWidget,
    availableSizes: [WidgetSize.MEDIUM, WidgetSize.LARGE],
    defaultSettings: {
      timeRange: 'month',
      chartType: 'line',
      dataPoints: 30,
      compareWithPrevious: true,
      refreshRate: 300 // refresh every 5 minutes
    }
  },
  
  // Other widget types (using placeholders until implemented)
  [WidgetType.MY_TASKS]: {
    type: WidgetType.MY_TASKS,
    name: 'My Tasks',
    description: 'View and manage your tasks',
    defaultSize: WidgetSize.MEDIUM,
    component: PlaceholderWidget,
    availableSizes: [WidgetSize.SMALL, WidgetSize.MEDIUM],
    defaultSettings: {
      widgetName: 'My Tasks',
      placeholder: true
    }
  },
  
  [WidgetType.TEAM_TASKS]: {
    type: WidgetType.TEAM_TASKS,
    name: 'Team Tasks',
    description: 'View and manage tasks for your team',
    defaultSize: WidgetSize.MEDIUM,
    component: PlaceholderWidget,
    availableSizes: [WidgetSize.MEDIUM, WidgetSize.LARGE],
    defaultSettings: {
      widgetName: 'Team Tasks',
      placeholder: true
    }
  },
  
  [WidgetType.CRITICAL_PATH]: {
    type: WidgetType.CRITICAL_PATH,
    name: 'Critical Path',
    description: 'View critical path for your projects',
    defaultSize: WidgetSize.MEDIUM,
    component: PlaceholderWidget,
    availableSizes: [WidgetSize.MEDIUM, WidgetSize.LARGE],
    defaultSettings: {
      widgetName: 'Critical Path',
      placeholder: true
    }
  },
  
  [WidgetType.PROGRESS_REPORTS]: {
    type: WidgetType.PROGRESS_REPORTS,
    name: 'Progress Reports',
    description: 'Generate and view progress reports',
    defaultSize: WidgetSize.MEDIUM,
    component: PlaceholderWidget,
    availableSizes: [WidgetSize.MEDIUM, WidgetSize.LARGE],
    defaultSettings: {
      widgetName: 'Progress Reports',
      placeholder: true
    }
  },
  
  [WidgetType.FINANCIAL_DASHBOARD]: {
    type: WidgetType.FINANCIAL_DASHBOARD,
    name: 'Financial Dashboard',
    description: 'Track financial metrics and budgets',
    defaultSize: WidgetSize.MEDIUM,
    component: PlaceholderWidget,
    availableSizes: [WidgetSize.MEDIUM, WidgetSize.LARGE],
    defaultSettings: {
      widgetName: 'Financial Dashboard',
      placeholder: true
    }
  },
  
  [WidgetType.TEAM_PERFORMANCE]: {
    type: WidgetType.TEAM_PERFORMANCE,
    name: 'Team Performance',
    description: 'Monitor team performance metrics',
    defaultSize: WidgetSize.MEDIUM,
    component: PlaceholderWidget,
    availableSizes: [WidgetSize.MEDIUM, WidgetSize.LARGE],
    defaultSettings: {
      widgetName: 'Team Performance',
      placeholder: true
    }
  },
  
  [WidgetType.NOTIFICATION_CENTER]: {
    type: WidgetType.NOTIFICATION_CENTER,
    name: 'Notification Center',
    description: 'View all project notifications',
    defaultSize: WidgetSize.SMALL,
    component: PlaceholderWidget,
    availableSizes: [WidgetSize.SMALL, WidgetSize.MEDIUM],
    defaultSettings: {
      widgetName: 'Notification Center',
      placeholder: true
    }
  },
  
  [WidgetType.CUSTOM]: {
    type: WidgetType.CUSTOM,
    name: 'Custom Widget',
    description: 'A custom widget',
    defaultSize: WidgetSize.MEDIUM,
    component: PlaceholderWidget,
    availableSizes: [WidgetSize.SMALL, WidgetSize.MEDIUM, WidgetSize.LARGE],
    defaultSettings: {
      widgetName: 'Custom Widget',
      placeholder: true
    }
  }
};

/**
 * Get a widget definition by type
 * @param type The widget type to get
 * @returns The widget definition or undefined if not found
 */
export const getWidgetDefinition = (type: WidgetType): WidgetDefinition | undefined => {
  return widgetRegistry[type];
};

/**
 * Get all available widget definitions
 * @returns An array of all available widget definitions
 */
export const getAllWidgetDefinitions = (): WidgetDefinition[] => {
  return Object.values(widgetRegistry);
};

/**
 * Get widget component by type
 * @param type The widget type to get the component for
 * @returns The React component for the widget or undefined if not found
 */
export const getWidgetComponent = (type: WidgetType) => {
  const definition = widgetRegistry[type];
  return definition ? definition.component : PlaceholderWidget;
};

export default widgetRegistry;
