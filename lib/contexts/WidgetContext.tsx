import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Layout } from 'react-grid-layout';
import { WidgetSize, WidgetType } from '@/lib/types/widget';
import { WidgetSettings } from '@/lib/types/widgetSettings';

export interface Widget {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  title: string;
  settings?: WidgetSettings;
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
  lastUpdated?: string;
}

interface WidgetContextProps {
  availableWidgets: Widget[];
  dashboardConfig: DashboardConfig | null;
  currentLayout: Layout[];
  isEditMode: boolean;
  isLoading: boolean;
  error: Error | null;
  loadDashboard: (dashboardId?: string) => Promise<void>;
  saveDashboard: () => Promise<boolean>; // Returns success status
  addWidget: (widgetType: WidgetType) => Promise<boolean>; // Returns success status
  removeWidget: (widgetId: string) => Promise<boolean>; // Returns success status
  updateWidgetLayout: (layouts: Layout[]) => void;
  updateWidgetSettings: (widgetId: string, settings: Record<string, any>) => Promise<boolean>;
  updateWidgetSize: (widgetId: string, size: WidgetSize) => Promise<boolean>;
  toggleEditMode: () => void;
  toggleWidgetVisibility: (widgetId: string) => Promise<boolean>;
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
        id: 'analytics', 
        type: WidgetType.ANALYTICS, 
        size: WidgetSize.MEDIUM, 
        title: 'Analytics & Reporting',
        isVisible: true 
      },
      { 
        id: 'my-tasks', 
        type: WidgetType.MY_TASKS, 
        size: WidgetSize.SMALL, 
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
    ];
    
    setAvailableWidgets(defaultWidgets);
    
    // Load dashboard config
    loadDashboard();
  }, []);

  // Load dashboard configuration
  const loadDashboard = async (dashboardId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get user info for dashboard loading
      const { data: userInfo } = await supabase.auth.getUser();
      
      if (!userInfo?.user) {
        throw new Error('Authentication required');
      }
      
      // Get dashboard from API
      const response = await fetch(`/api/dashboard?id=${dashboardId || 'default'}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load dashboard');
      }
      
      const { dashboard } = await response.json();
      
      if (dashboard) {
        setDashboardConfig(dashboard);
        setCurrentLayout(dashboard.layouts.desktop);
      } else {
        // Create a new dashboard with default widgets if none exists
        const newDashboard = { 
          ...defaultDashboardConfig,
          widgets: availableWidgets.slice(0, 4), // Start with first 4 widgets
          layouts: {
            desktop: availableWidgets.slice(0, 4).map((widget, index) => ({
              i: widget.id,
              x: (index % 2) * 6,
              y: Math.floor(index / 2) * 4,
              w: widget.size === WidgetSize.SMALL ? 3 : widget.size === WidgetSize.MEDIUM ? 6 : 12,
              h: widget.size === WidgetSize.SMALL ? 3 : 4,
              minW: 3,
              minH: 2,
            })),
            tablet: [],
            mobile: [],
          }
        };
        
        setDashboardConfig(newDashboard);
        setCurrentLayout(newDashboard.layouts.desktop);
        
        // Save the default dashboard to API
        await saveDashboardToApi(newDashboard);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err instanceof Error ? err : new Error('Failed to load dashboard'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to save dashboard to API
  const saveDashboardToApi = async (dashboard: DashboardConfig) => {
    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dashboard }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save dashboard');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving dashboard to API:', error);
      return false;
    }
  };

  // Save dashboard configuration with optimistic updates
  const saveDashboard = async () => {
    try {
      if (!dashboardConfig) return false;
      
      // Store previous state for rollback if needed
      const previousDashboard = { ...dashboardConfig };
      
      // Update the layouts based on current layout
      const updatedDashboard = {
        ...dashboardConfig,
        layouts: {
          ...dashboardConfig.layouts,
          desktop: currentLayout,
        },
        lastUpdated: new Date().toISOString(), // Add timestamp for tracking changes
      };
      
      // Optimistically update the UI first
      setDashboardConfig(updatedDashboard);
      
      // Then save to the API endpoint
      const success = await saveDashboardToApi(updatedDashboard);
      
      if (!success) {
        // Rollback if save fails
        setDashboardConfig(previousDashboard);
        setCurrentLayout(previousDashboard.layouts.desktop);
        throw new Error('Failed to save dashboard configuration. Changes have been reverted.');
      }
      
      return true;
    } catch (err) {
      console.error('Error saving dashboard:', err);
      setError(err instanceof Error ? err : new Error('Failed to save dashboard'));
      return false;
    }
  };

  // Add a new widget to the dashboard with optimistic updates
  const addWidget = async (widgetType: WidgetType) => {
    if (!dashboardConfig) return false;
    
    // Find widget definition for the requested type
    const widgetToAdd = availableWidgets.find(w => w.type === widgetType);
    if (!widgetToAdd) return false;
    
    // Store previous state for rollback if needed
    const previousDashboard = { ...dashboardConfig };
    const previousLayout = [...currentLayout];
    
    try {
      // Create a new widget instance with a unique ID
      const newWidget: Widget = {
        ...widgetToAdd,
        id: `${widgetType.toLowerCase()}-${Date.now()}`,
        isVisible: true,
        size: widgetToAdd.size || WidgetSize.MEDIUM,
      };
      
      // Get default settings from registry if available
      try {
        const widgetRegistry = await import('@/lib/registry/WidgetRegistry')
          .then(module => module.default)
          .catch(() => null);
        
        if (widgetRegistry && widgetRegistry[widgetType]) {
          newWidget.settings = widgetRegistry[widgetType].defaultSettings || {};
        }
      } catch (error) {
        console.warn('Could not load widget registry for default settings', error);
        // Continue without default settings
      }
      
      // Find a suitable position for the new widget
      const newWidgetLayout: Layout = {
        i: newWidget.id,
        x: 0,
        y: Infinity, // Place at the bottom
        w: newWidget.size === WidgetSize.SMALL ? 3 : newWidget.size === WidgetSize.MEDIUM ? 6 : 12,
        h: newWidget.size === WidgetSize.SMALL ? 3 : newWidget.size === WidgetSize.MEDIUM ? 4 : 8,
        minW: 3,
        minH: 2,
      };
      
      const updatedWidgets = [...dashboardConfig.widgets, newWidget];
      const updatedLayout = [...currentLayout, newWidgetLayout];
      
      // Optimistically update the UI
      setDashboardConfig({
        ...dashboardConfig,
        widgets: updatedWidgets,
      });
      
      setCurrentLayout(updatedLayout);
      
      // Save changes to API
      const saveSuccess = await saveDashboard();
      
      if (!saveSuccess) {
        // If saving failed, roll back to previous state
        setDashboardConfig(previousDashboard);
        setCurrentLayout(previousLayout);
        throw new Error('Failed to add widget. Changes reverted.');
      }
      
      return true;
    } catch (error) {
      console.error('Error adding widget:', error);
      
      // Ensure UI is reverted on error
      setDashboardConfig(previousDashboard);
      setCurrentLayout(previousLayout);
      setError(error instanceof Error ? error : new Error('Failed to add widget'));
      
      return false;
    }
  };

  // Remove a widget from the dashboard with optimistic updates
  const removeWidget = async (widgetId: string) => {
    if (!dashboardConfig) return false;
    
    // Store previous state for rollback if needed
    const previousDashboard = { ...dashboardConfig };
    const previousLayout = [...currentLayout];
    
    try {
      const updatedWidgets = dashboardConfig.widgets.filter(w => w.id !== widgetId);
      const updatedLayout = currentLayout.filter(l => l.i !== widgetId);
      
      // Optimistically update the UI
      setDashboardConfig({
        ...dashboardConfig,
        widgets: updatedWidgets,
      });
      
      setCurrentLayout(updatedLayout);
      
      // Save changes to API
      const saveSuccess = await saveDashboard();
      
      if (!saveSuccess) {
        // If saving failed, roll back to previous state
        setDashboardConfig(previousDashboard);
        setCurrentLayout(previousLayout);
        throw new Error('Failed to remove widget. Changes reverted.');
      }
      
      return true;
    } catch (error) {
      console.error('Error removing widget:', error);
      
      // Ensure UI is reverted on error
      setDashboardConfig(previousDashboard);
      setCurrentLayout(previousLayout);
      setError(error instanceof Error ? error : new Error('Failed to remove widget'));
      
      return false;
    }
  };

  // Update widget layout
  const updateWidgetLayout = (layouts: Layout[]) => {
    setCurrentLayout(layouts);
  };

  // Update widget settings with optimistic updates
  const updateWidgetSettings = async (widgetId: string, settings: Record<string, any>) => {
    if (!dashboardConfig) return false;
    
    // Store previous state for rollback if needed
    const previousDashboard = { ...dashboardConfig };
    
    try {
      const updatedWidgets = dashboardConfig.widgets.map(widget => {
        if (widget.id === widgetId) {
          return {
            ...widget,
            settings: {
              ...widget.settings,
              ...settings,
            },
          };
        }
        return widget;
      });
      
      // Optimistically update the UI
      setDashboardConfig({
        ...dashboardConfig,
        widgets: updatedWidgets,
      });
      
      // Save changes to API
      const saveSuccess = await saveDashboard();
      
      if (!saveSuccess) {
        // If saving failed, roll back to previous state
        setDashboardConfig(previousDashboard);
        throw new Error('Failed to update widget settings. Changes reverted.');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating widget settings:', error);
      
      // Ensure UI is reverted on error
      setDashboardConfig(previousDashboard);
      setError(error instanceof Error ? error : new Error('Failed to update widget settings'));
      
      return false;
    }
  };

  // Update widget size with optimistic updates
  const updateWidgetSize = async (widgetId: string, size: WidgetSize) => {
    if (!dashboardConfig) return false;
    
    // Store previous state for rollback if needed
    const previousDashboard = { ...dashboardConfig };
    const previousLayout = [...currentLayout];
    
    try {
      // Update widget size
      const updatedWidgets = dashboardConfig.widgets.map(widget => {
        if (widget.id === widgetId) {
          return {
            ...widget,
            size,
          };
        }
        return widget;
      });
      
      // Update layout dimensions based on new size
      const updatedLayout = currentLayout.map(layout => {
        if (layout.i === widgetId) {
          return {
            ...layout,
            w: size === WidgetSize.SMALL ? 3 : size === WidgetSize.MEDIUM ? 6 : 12,
            h: size === WidgetSize.SMALL ? 3 : size === WidgetSize.MEDIUM ? 4 : 8,
          };
        }
        return layout;
      });
      
      // Optimistically update the UI
      setDashboardConfig({
        ...dashboardConfig,
        widgets: updatedWidgets,
      });
      
      setCurrentLayout(updatedLayout);
      
      // Save changes to API
      const saveSuccess = await saveDashboard();
      
      if (!saveSuccess) {
        // If saving failed, roll back to previous state
        setDashboardConfig(previousDashboard);
        setCurrentLayout(previousLayout);
        throw new Error('Failed to update widget size. Changes reverted.');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating widget size:', error);
      
      // Ensure UI is reverted on error
      setDashboardConfig(previousDashboard);
      setCurrentLayout(previousLayout);
      setError(error instanceof Error ? error : new Error('Failed to update widget size'));
      
      return false;
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Toggle widget visibility with optimistic updates
  const toggleWidgetVisibility = async (widgetId: string) => {
    if (!dashboardConfig) return false;
    
    // Store previous state for rollback if needed
    const previousDashboard = { ...dashboardConfig };
    
    try {
      const updatedWidgets = dashboardConfig.widgets.map(widget => {
        if (widget.id === widgetId) {
          return {
            ...widget,
            isVisible: !widget.isVisible,
          };
        }
        return widget;
      });
      
      // Optimistically update the UI
      setDashboardConfig({
        ...dashboardConfig,
        widgets: updatedWidgets,
      });
      
      // Save changes to API
      const saveSuccess = await saveDashboard();
      
      if (!saveSuccess) {
        // If saving failed, roll back to previous state
        setDashboardConfig(previousDashboard);
        throw new Error('Failed to toggle widget visibility. Changes reverted.');
      }
      
      return true;
    } catch (error) {
      console.error('Error toggling widget visibility:', error);
      
      // Ensure UI is reverted on error
      setDashboardConfig(previousDashboard);
      setError(error instanceof Error ? error : new Error('Failed to toggle widget visibility'));
      
      return false;
    }
  };

  // Create a new dashboard
  const createDashboard = async (name: string) => {
    try {
      const newDashboard: DashboardConfig = {
        ...defaultDashboardConfig,
        id: `dashboard-${Date.now()}`,
        name,
        isDefault: false,
      };
      
      const success = await saveDashboardToApi(newDashboard);
      
      if (!success) {
        throw new Error('Failed to create dashboard');
      }
      
      return newDashboard.id;
    } catch (err) {
      console.error('Error creating dashboard:', err);
      setError(err instanceof Error ? err : new Error('Failed to create dashboard'));
      throw err;
    }
  };

  return (
    <WidgetContext.Provider
      value={{
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
        updateWidgetSize,
        toggleEditMode,
        toggleWidgetVisibility,
        createDashboard,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
};

export default WidgetContext;
