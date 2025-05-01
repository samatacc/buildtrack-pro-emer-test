import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Layout } from 'react-grid-layout';
import { WidgetType } from '@/lib/types/widget';
import { toast } from 'react-hot-toast';

// Widget size options
export enum WidgetSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra_large'
}

// Widget interface
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  minWidth: number;
  minHeight: number;
  defaultWidth: number;
  defaultHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  settings?: Record<string, any>;
  isVisible: boolean;
}

// Layout configuration for different screen sizes
export interface DashboardLayout {
  id: string;
  name: string;
  userId: string;
  organizationId: string;
  isDefault: boolean;
  layoutType: 'desktop' | 'tablet' | 'mobile';
  layout: Layout[];
  createdAt: Date;
  updatedAt: Date;
}

// Widget context props
interface WidgetContextProps {
  availableWidgets: Widget[];
  userWidgets: Widget[];
  currentLayout: Layout[];
  layouts: DashboardLayout[];
  selectedLayout: DashboardLayout | null;
  isEditMode: boolean;
  isLoading: boolean;
  error: Error | null;
  loadDashboard: () => Promise<void>;
  saveDashboard: () => Promise<boolean>;
  addWidget: (widgetType: WidgetType) => Promise<boolean>;
  removeWidget: (widgetId: string) => void;
  updateWidgetLayout: (layouts: Layout[]) => void;
  updateWidgetSettings: (widgetId: string, settings: Record<string, any>) => void;
  toggleEditMode: () => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  createLayout: (name: string, layoutType?: 'desktop' | 'tablet' | 'mobile') => Promise<string>;
  selectLayout: (layoutId: string) => void;
}

// Create the widget context
const WidgetContext = createContext<WidgetContextProps | undefined>(undefined);

// Hook to use the widget context
export const useWidgets = (): WidgetContextProps => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
};

// Props for the widget provider
interface WidgetProviderProps {
  children: ReactNode;
}

// Widget provider component
export const WidgetProvider: React.FC<WidgetProviderProps> = ({ children }) => {
  // State variables
  const [availableWidgets, setAvailableWidgets] = useState<Widget[]>([]);
  const [userWidgets, setUserWidgets] = useState<Widget[]>([]);
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<DashboardLayout | null>(null);
  const [currentLayout, setCurrentLayout] = useState<Layout[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Create Supabase client
  const supabase = createClientComponentClient();

  // Load available widgets and user layouts
  useEffect(() => {
    loadDashboard();
  }, []);

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user info
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user profile to get organization ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id, role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error(`Failed to load profile: ${profileError.message}`);
      }

      // Get available widgets
      const { data: widgetsData, error: widgetsError } = await supabase
        .from('dashboard_widgets')
        .select('*');

      if (widgetsError) {
        throw new Error(`Failed to load widgets: ${widgetsError.message}`);
      }

      // Transform widgets data
      const widgets: Widget[] = widgetsData.map(widget => ({
        id: widget.id,
        type: widget.type as WidgetType,
        title: widget.title,
        description: widget.description,
        minWidth: widget.min_width,
        minHeight: widget.min_height,
        defaultWidth: widget.default_width,
        defaultHeight: widget.default_height,
        maxWidth: widget.max_width,
        maxHeight: widget.max_height,
        settings: widget.configs,
        isVisible: true
      }));
      
      setAvailableWidgets(widgets);

      // Get user layouts
      const { data: layoutsData, error: layoutsError } = await supabase
        .from('dashboard_layouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', profileData.organization_id);

      if (layoutsError) {
        throw new Error(`Failed to load layouts: ${layoutsError.message}`);
      }

      // If no layouts exist, get default layout based on role
      if (layoutsData.length === 0) {
        const { data: defaultLayoutData, error: defaultLayoutError } = await supabase
          .from('dashboard_role_defaults')
          .select('*')
          .eq('organization_id', profileData.organization_id)
          .eq('role', profileData.role)
          .eq('layout_type', 'desktop');

        if (defaultLayoutError) {
          throw new Error(`Failed to load default layout: ${defaultLayoutError.message}`);
        }

        // Create user layout from default
        if (defaultLayoutData && defaultLayoutData.length > 0) {
          const defaultLayout = defaultLayoutData[0];
          
          const { data: newLayoutData, error: newLayoutError } = await supabase
            .from('dashboard_layouts')
            .insert({
              user_id: user.id,
              organization_id: profileData.organization_id,
              name: 'Default',
              is_default: true,
              layout_type: 'desktop',
              layout: defaultLayout.layout
            })
            .select()
            .single();

          if (newLayoutError) {
            throw new Error(`Failed to create layout: ${newLayoutError.message}`);
          }

          // Transform layout data
          const newLayouts: DashboardLayout[] = [{
            id: newLayoutData.id,
            name: newLayoutData.name,
            userId: newLayoutData.user_id,
            organizationId: newLayoutData.organization_id,
            isDefault: newLayoutData.is_default,
            layoutType: newLayoutData.layout_type,
            layout: newLayoutData.layout,
            createdAt: new Date(newLayoutData.created_at),
            updatedAt: new Date(newLayoutData.updated_at)
          }];

          setLayouts(newLayouts);
          setSelectedLayout(newLayouts[0]);
          setCurrentLayout(newLayouts[0].layout);

          // Set user widgets based on the layout
          const userLayoutWidgets = newLayouts[0].layout.map(item => {
            const widget = widgets.find(w => w.id === item.i);
            return widget ? { ...widget, isVisible: true } : null;
          }).filter(Boolean) as Widget[];

          setUserWidgets(userLayoutWidgets);
        } else {
          // No default layout exists, create a basic one
          const basicLayout = layouts.length > 0 ? layouts[0].layout : widgets.slice(0, 3).map((widget, index) => ({
            i: widget.id,
            x: index * widget.defaultWidth % 12,
            y: Math.floor((index * widget.defaultWidth) / 12) * widget.defaultHeight,
            w: widget.defaultWidth,
            h: widget.defaultHeight,
            minW: widget.minWidth,
            minH: widget.minHeight
          }));

          const { data: newLayoutData, error: newLayoutError } = await supabase
            .from('dashboard_layouts')
            .insert({
              user_id: user.id,
              organization_id: profileData.organization_id,
              name: 'Default',
              is_default: true,
              layout_type: 'desktop',
              layout: basicLayout
            })
            .select()
            .single();

          if (newLayoutError) {
            throw new Error(`Failed to create layout: ${newLayoutError.message}`);
          }

          const newLayouts: DashboardLayout[] = [{
            id: newLayoutData.id,
            name: newLayoutData.name,
            userId: newLayoutData.user_id,
            organizationId: newLayoutData.organization_id,
            isDefault: newLayoutData.is_default,
            layoutType: newLayoutData.layout_type,
            layout: newLayoutData.layout,
            createdAt: new Date(newLayoutData.created_at),
            updatedAt: new Date(newLayoutData.updated_at)
          }];

          setLayouts(newLayouts);
          setSelectedLayout(newLayouts[0]);
          setCurrentLayout(newLayouts[0].layout);

          // Set user widgets based on the layout
          const userLayoutWidgets = newLayouts[0].layout.map(item => {
            const widget = widgets.find(w => w.id === item.i);
            return widget ? { ...widget, isVisible: true } : null;
          }).filter(Boolean) as Widget[];

          setUserWidgets(userLayoutWidgets);
        }
      } else {
        // Transform layout data
        const transformedLayouts: DashboardLayout[] = layoutsData.map(layout => ({
          id: layout.id,
          name: layout.name,
          userId: layout.user_id,
          organizationId: layout.organization_id,
          isDefault: layout.is_default,
          layoutType: layout.layout_type,
          layout: layout.layout,
          createdAt: new Date(layout.created_at),
          updatedAt: new Date(layout.updated_at)
        }));

        setLayouts(transformedLayouts);

        // Get default layout or first available
        const defaultLayout = transformedLayouts.find(l => l.isDefault) || transformedLayouts[0];
        setSelectedLayout(defaultLayout);
        setCurrentLayout(defaultLayout.layout);

        // Set user widgets based on the layout
        const userLayoutWidgets = defaultLayout.layout.map(item => {
          const widget = widgets.find(w => w.id === item.i);
          return widget ? { ...widget, isVisible: true } : null;
        }).filter(Boolean) as Widget[];

        setUserWidgets(userLayoutWidgets);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error('Failed to load dashboard configuration');
    } finally {
      setIsLoading(false);
    }
  };

  // Save dashboard configuration
  const saveDashboard = async () => {
    if (!selectedLayout) return false;

    try {
      // Update layout in the database
      const { error } = await supabase
        .from('dashboard_layouts')
        .update({
          layout: currentLayout,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedLayout.id);

      if (error) {
        throw new Error(`Failed to save layout: ${error.message}`);
      }

      // Update the selected layout in state
      setSelectedLayout({
        ...selectedLayout,
        layout: currentLayout,
        updatedAt: new Date()
      });

      // Update the layouts array
      setLayouts(prevLayouts =>
        prevLayouts.map(layout =>
          layout.id === selectedLayout.id
            ? { ...layout, layout: currentLayout, updatedAt: new Date() }
            : layout
        )
      );

      toast.success('Dashboard layout saved');
      return true;
    } catch (err) {
      console.error('Error saving dashboard:', err);
      toast.error('Failed to save dashboard layout');
      return false;
    }
  };

  // Add a widget to the dashboard
  const addWidget = async (widgetType: WidgetType) => {
    if (!selectedLayout) return false;

    try {
      // Find widget definition for the requested type
      const widgetToAdd = availableWidgets.find(w => w.type === widgetType);
      
      if (!widgetToAdd) {
        throw new Error(`Widget type ${widgetType} not found`);
      }

      // Check if this widget is already on the dashboard
      const existingWidget = userWidgets.find(w => w.type === widgetType);
      
      if (existingWidget) {
        // If it exists but is hidden, make it visible
        if (!existingWidget.isVisible) {
          toggleWidgetVisibility(existingWidget.id);
          return true;
        }
        
        toast.error('This widget is already on your dashboard');
        return false;
      }

      // Determine position for the new widget
      const newLayout: Layout = {
        i: widgetToAdd.id,
        x: 0,
        y: 0, // We'll calculate this based on existing widgets
        w: widgetToAdd.defaultWidth,
        h: widgetToAdd.defaultHeight,
        minW: widgetToAdd.minWidth,
        minH: widgetToAdd.minHeight,
        maxW: widgetToAdd.maxWidth,
        maxH: widgetToAdd.maxHeight
      };

      // Calculate y position to place it at the bottom
      if (currentLayout.length > 0) {
        const maxY = Math.max(...currentLayout.map(item => item.y + item.h));
        newLayout.y = maxY;
      }

      // Add the widget to the user's widgets
      setUserWidgets(prev => [...prev, { ...widgetToAdd, isVisible: true }]);

      // Add the widget to the layout
      const updatedLayout = [...currentLayout, newLayout];
      setCurrentLayout(updatedLayout);

      // Save to database
      const { error } = await supabase
        .from('dashboard_layouts')
        .update({
          layout: updatedLayout,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedLayout.id);

      if (error) {
        throw new Error(`Failed to save layout: ${error.message}`);
      }

      // Update the selected layout in state
      setSelectedLayout({
        ...selectedLayout,
        layout: updatedLayout,
        updatedAt: new Date()
      });

      // Update the layouts array
      setLayouts(prevLayouts =>
        prevLayouts.map(layout =>
          layout.id === selectedLayout.id
            ? { ...layout, layout: updatedLayout, updatedAt: new Date() }
            : layout
        )
      );

      toast.success(`Added ${widgetToAdd.title} widget`);
      return true;
    } catch (err) {
      console.error('Error adding widget:', err);
      toast.error('Failed to add widget');
      return false;
    }
  };

  // Remove a widget from the dashboard
  const removeWidget = (widgetId: string) => {
    if (!selectedLayout) return;

    // Remove from layout
    const updatedLayout = currentLayout.filter(item => item.i !== widgetId);
    setCurrentLayout(updatedLayout);

    // Mark as not visible in user widgets
    setUserWidgets(prev =>
      prev.map(widget =>
        widget.id === widgetId
          ? { ...widget, isVisible: false }
          : widget
      )
    );

    // Save on next layout save
    toast.success('Widget removed from dashboard');
  };

  // Update widget layout
  const updateWidgetLayout = (layouts: Layout[]) => {
    setCurrentLayout(layouts);
  };

  // Update widget settings
  const updateWidgetSettings = (widgetId: string, settings: Record<string, any>) => {
    setUserWidgets(prev =>
      prev.map(widget =>
        widget.id === widgetId
          ? { ...widget, settings: { ...widget.settings, ...settings } }
          : widget
      )
    );
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };

  // Toggle widget visibility
  const toggleWidgetVisibility = (widgetId: string) => {
    // Toggle visibility in state
    setUserWidgets(prev =>
      prev.map(widget =>
        widget.id === widgetId
          ? { ...widget, isVisible: !widget.isVisible }
          : widget
      )
    );

    // If becoming invisible, remove from layout
    const widget = userWidgets.find(w => w.id === widgetId);
    
    if (widget?.isVisible) {
      setCurrentLayout(prev => prev.filter(item => item.i !== widgetId));
    } else {
      // If becoming visible, add to layout
      const widgetToShow = userWidgets.find(w => w.id === widgetId);
      
      if (widgetToShow) {
        const widgetLayout = {
          i: widgetId,
          x: 0,
          y: currentLayout.length > 0 
            ? Math.max(...currentLayout.map(item => item.y + item.h))
            : 0,
          w: widgetToShow.defaultWidth,
          h: widgetToShow.defaultHeight,
          minW: widgetToShow.minWidth,
          minH: widgetToShow.minHeight
        };
        
        setCurrentLayout(prev => [...prev, widgetLayout]);
      }
    }
  };

  // Create a new layout
  const createLayout = async (name: string, layoutType: 'desktop' | 'tablet' | 'mobile' = 'desktop') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get organization ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error(`Failed to load profile: ${profileError.message}`);
      }

      // Create new layout
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .insert({
          user_id: user.id,
          organization_id: profileData.organization_id,
          name,
          is_default: layouts.length === 0, // Set as default if it's the first one
          layout_type: layoutType,
          layout: []
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create layout: ${error.message}`);
      }

      // Transform and add to state
      const newLayout: DashboardLayout = {
        id: data.id,
        name: data.name,
        userId: data.user_id,
        organizationId: data.organization_id,
        isDefault: data.is_default,
        layoutType: data.layout_type,
        layout: data.layout,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      setLayouts(prev => [...prev, newLayout]);

      // Select the new layout if it's the first one
      if (layouts.length === 0) {
        setSelectedLayout(newLayout);
        setCurrentLayout(newLayout.layout);
      }

      toast.success(`Created "${name}" dashboard layout`);
      return data.id;
    } catch (err) {
      console.error('Error creating layout:', err);
      toast.error('Failed to create dashboard layout');
      throw err;
    }
  };

  // Select a layout
  const selectLayout = (layoutId: string) => {
    const layout = layouts.find(l => l.id === layoutId);
    
    if (layout) {
      setSelectedLayout(layout);
      setCurrentLayout(layout.layout);
      
      // Update user widgets based on the layout
      const layoutWidgets = layout.layout.map(item => {
        const widget = availableWidgets.find(w => w.id === item.i);
        return widget ? { ...widget, isVisible: true } : null;
      }).filter(Boolean) as Widget[];
      
      setUserWidgets(layoutWidgets);
    }
  };

  // Context value
  const value: WidgetContextProps = {
    availableWidgets,
    userWidgets,
    currentLayout,
    layouts,
    selectedLayout,
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
    createLayout,
    selectLayout
  };

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
};

export default WidgetContext;
