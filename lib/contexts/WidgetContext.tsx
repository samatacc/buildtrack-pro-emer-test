import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Layout } from 'react-grid-layout';
import { WidgetSize, WidgetType } from '@/lib/types/widget';

export interface Widget {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  title: string;
  settings?: Record<string, any>;
  layout?: Layout;
  isVisible: boolean;
}

export interface DashboardConfig {
  id: string;
  name: string;
  isDefault: boolean;
  widgets: Widget[];
  layouts: {
    desktop: Layout[];
    tablet: Layout[];
    mobile: Layout[];
  };
}

interface WidgetContextProps {
  availableWidgets: Widget[];
  dashboardConfig: DashboardConfig | null;
  currentLayout: Layout[];
  isEditMode: boolean;
  isLoading: boolean;
  error: Error | null;
  loadDashboard: (dashboardId?: string) => Promise<void>;
  saveDashboard: () => Promise<void>;
  addWidget: (widgetType: WidgetType) => void;
  removeWidget: (widgetId: string) => void;
  updateWidgetLayout: (layouts: Layout[]) => void;
  updateWidgetSettings: (widgetId: string, settings: Record<string, any>) => void;
  toggleEditMode: () => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  createDashboard: (name: string) => Promise<string>;
}

const defaultDashboardConfig: DashboardConfig = {
  id: 'default',
  name: 'Default Dashboard',
  isDefault: true,
  widgets: [],
  layouts: {
    desktop: [],
    tablet: [],
    mobile: [],
  },
};

const WidgetContext = createContext<WidgetContextProps | undefined>(undefined);

export const useWidgets = (): WidgetContextProps => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
};

interface WidgetProviderProps {
  children: ReactNode;
}

export const WidgetProvider: React.FC<WidgetProviderProps> = ({ children }) => {
  const [availableWidgets, setAvailableWidgets] = useState<Widget[]>([]);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [currentLayout, setCurrentLayout] = useState<Layout[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const supabase = createClientComponentClient();

  // Load available widget types
  useEffect(() => {
    // In a real implementation, this might come from a backend service
    const defaultWidgets: Widget[] = [
      { 
        id: 'active-projects', 
        type: WidgetType.ACTIVE_PROJECTS, 
        size: WidgetSize.MEDIUM, 
        title: 'Active Projects',
        isVisible: true 
      },
      { 
        id: 'project-timeline', 
        type: WidgetType.PROJECT_TIMELINE, 
        size: WidgetSize.LARGE, 
        title: 'Project Timeline',
        isVisible: true 
      },
      { 
        id: 'project-health', 
        type: WidgetType.PROJECT_HEALTH, 
        size: WidgetSize.MEDIUM, 
        title: 'Project Health',
        isVisible: true 
      },
      { 
        id: 'my-tasks', 
        type: WidgetType.MY_TASKS, 
        size: WidgetSize.MEDIUM, 
        title: 'My Tasks',
        isVisible: true 
      },
      { 
        id: 'team-tasks', 
        type: WidgetType.TEAM_TASKS, 
        size: WidgetSize.MEDIUM, 
        title: 'Team Tasks',
        isVisible: true 
      },
      { 
        id: 'critical-path', 
        type: WidgetType.CRITICAL_PATH, 
        size: WidgetSize.SMALL, 
        title: 'Critical Path Tasks',
        isVisible: true 
      },
      { 
        id: 'progress-reports', 
        type: WidgetType.PROGRESS_REPORTS, 
        size: WidgetSize.MEDIUM, 
        title: 'Progress Reports',
        isVisible: true 
      },
      { 
        id: 'financial-dashboard', 
        type: WidgetType.FINANCIAL_DASHBOARD, 
        size: WidgetSize.MEDIUM, 
        title: 'Financial Dashboard',
        isVisible: true 
      },
      { 
        id: 'team-performance', 
        type: WidgetType.TEAM_PERFORMANCE, 
        size: WidgetSize.SMALL, 
        title: 'Team Performance',
        isVisible: true 
      },
      { 
        id: 'notification-center', 
        type: WidgetType.NOTIFICATION_CENTER, 
        size: WidgetSize.SMALL, 
        title: 'Notifications',
        isVisible: true 
      },
    ];
    
    setAvailableWidgets(defaultWidgets);
  }, []);

  // Load dashboard configuration
  const loadDashboard = async (dashboardId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get user ID for personalized dashboards
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // In a production app, we'd fetch from Supabase
      // For now, we'll use localStorage as a placeholder for development
      const savedDashboard = localStorage.getItem(`dashboard_${dashboardId || 'default'}_${user.id}`);
      
      if (savedDashboard) {
        const parsedDashboard = JSON.parse(savedDashboard) as DashboardConfig;
        setDashboardConfig(parsedDashboard);
        setCurrentLayout(parsedDashboard.layouts.desktop);
      } else {
        // Create a new dashboard with default widgets if none exists
        const newDashboard = { 
          ...defaultDashboardConfig,
          widgets: availableWidgets.slice(0, 4), // Start with a few widgets
          layouts: {
            desktop: availableWidgets.slice(0, 4).map((widget, index) => ({
              i: widget.id,
              x: (index % 2) * 6,
              y: Math.floor(index / 2) * 4,
              w: widget.size === WidgetSize.SMALL ? 3 : widget.size === WidgetSize.MEDIUM ? 6 : 12,
              h: 4,
              minW: 3,
              minH: 2,
            })),
            tablet: [],
            mobile: [],
          }
        };
        
        setDashboardConfig(newDashboard);
        setCurrentLayout(newDashboard.layouts.desktop);
        
        // Save the default dashboard
        localStorage.setItem(`dashboard_${dashboardId || 'default'}_${user.id}`, JSON.stringify(newDashboard));
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err instanceof Error ? err : new Error('Failed to load dashboard'));
    } finally {
      setIsLoading(false);
    }
  };

  // Save dashboard configuration
  const saveDashboard = async () => {
    try {
      if (!dashboardConfig) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update the layouts based on current layout
      const updatedDashboard = {
        ...dashboardConfig,
        layouts: {
          ...dashboardConfig.layouts,
          desktop: currentLayout,
        },
      };
      
      // For now, save to localStorage - in production, save to Supabase
      localStorage.setItem(`dashboard_${dashboardConfig.id}_${user.id}`, JSON.stringify(updatedDashboard));
      
      setDashboardConfig(updatedDashboard);
    } catch (err) {
      console.error('Error saving dashboard:', err);
      setError(err instanceof Error ? err : new Error('Failed to save dashboard'));
    }
  };

  // Add a new widget to the dashboard
  const addWidget = (widgetType: WidgetType) => {
    if (!dashboardConfig) return;
    
    const widgetToAdd = availableWidgets.find(w => w.type === widgetType);
    
    if (!widgetToAdd) return;
    
    // Create a new widget instance with a unique ID
    const newWidget: Widget = {
      ...widgetToAdd,
      id: `${widgetType.toLowerCase()}-${Date.now()}`,
      isVisible: true,
    };
    
    // Find a suitable position for the new widget
    const newWidgetLayout: Layout = {
      i: newWidget.id,
      x: 0,
      y: Infinity, // Place at the bottom
      w: newWidget.size === WidgetSize.SMALL ? 3 : newWidget.size === WidgetSize.MEDIUM ? 6 : 12,
      h: 4,
      minW: 3,
      minH: 2,
    };
    
    const updatedWidgets = [...dashboardConfig.widgets, newWidget];
    const updatedLayout = [...currentLayout, newWidgetLayout];
    
    setDashboardConfig({
      ...dashboardConfig,
      widgets: updatedWidgets,
    });
    
    setCurrentLayout(updatedLayout);
  };

  // Remove a widget from the dashboard
  const removeWidget = (widgetId: string) => {
    if (!dashboardConfig) return;
    
    const updatedWidgets = dashboardConfig.widgets.filter(w => w.id !== widgetId);
    const updatedLayout = currentLayout.filter(l => l.i !== widgetId);
    
    setDashboardConfig({
      ...dashboardConfig,
      widgets: updatedWidgets,
    });
    
    setCurrentLayout(updatedLayout);
  };

  // Update widget layout when repositioned or resized
  const updateWidgetLayout = (layouts: Layout[]) => {
    setCurrentLayout(layouts);
  };

  // Update widget settings
  const updateWidgetSettings = (widgetId: string, settings: Record<string, any>) => {
    if (!dashboardConfig) return;
    
    const updatedWidgets = dashboardConfig.widgets.map(widget => {
      if (widget.id === widgetId) {
        return {
          ...widget,
          settings: { ...(widget.settings || {}), ...settings },
        };
      }
      return widget;
    });
    
    setDashboardConfig({
      ...dashboardConfig,
      widgets: updatedWidgets,
    });
  };

  // Toggle dashboard edit mode
  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };

  // Toggle widget visibility
  const toggleWidgetVisibility = (widgetId: string) => {
    if (!dashboardConfig) return;
    
    const updatedWidgets = dashboardConfig.widgets.map(widget => {
      if (widget.id === widgetId) {
        return {
          ...widget,
          isVisible: !widget.isVisible,
        };
      }
      return widget;
    });
    
    setDashboardConfig({
      ...dashboardConfig,
      widgets: updatedWidgets,
    });
  };

  // Create a new dashboard
  const createDashboard = async (name: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const newDashboardId = `dashboard-${Date.now()}`;
      
      const newDashboard: DashboardConfig = {
        id: newDashboardId,
        name,
        isDefault: false,
        widgets: [],
        layouts: {
          desktop: [],
          tablet: [],
          mobile: [],
        },
      };
      
      // Save to localStorage - in production, save to Supabase
      localStorage.setItem(`dashboard_${newDashboardId}_${user.id}`, JSON.stringify(newDashboard));
      
      return newDashboardId;
    } catch (err) {
      console.error('Error creating dashboard:', err);
      setError(err instanceof Error ? err : new Error('Failed to create dashboard'));
      return null;
    }
  };

  // Initialize dashboard on mount
  useEffect(() => {
    loadDashboard();
  }, [availableWidgets]);

  const value: WidgetContextProps = {
    availableWidgets,
    dashboardConfig,
    currentLayout,
    isEditMode,
    isLoading,
    error,
    loadDashboard,
    saveDashboard,
    addWidget,
    removeWidget,
    updateWidgetLayout,
    updateWidgetSettings,
    toggleEditMode,
    toggleWidgetVisibility,
    createDashboard,
  };

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
};
