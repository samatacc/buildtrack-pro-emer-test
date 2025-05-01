import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Widget, DashboardLayout } from '@/lib/contexts/WidgetContext';
import { Layout } from 'react-grid-layout';
import { WidgetType } from '@/lib/types/widget';

/**
 * Service to handle dashboard and widget operations
 */
export class DashboardService {
  private supabase = createClientComponentClient<Database>();

  /**
   * Get available widgets for the current user
   */
  async getAvailableWidgets(): Promise<Widget[]> {
    try {
      const { data: widgetsData, error } = await this.supabase
        .from('dashboard_widgets')
        .select('*');

      if (error) {
        throw new Error(`Failed to load widgets: ${error.message}`);
      }

      if (!widgetsData) {
        return [];
      }

      // Transform database records to Widget objects
      return widgetsData.map(widget => ({
        id: widget.id,
        type: widget.widget_key as WidgetType,
        title: widget.widget_name,
        description: widget.description || undefined,
        minWidth: widget.min_width,
        minHeight: widget.min_height,
        defaultWidth: widget.default_width,
        defaultHeight: widget.default_height,
        maxWidth: widget.max_width || undefined,
        maxHeight: widget.max_height || undefined,
        settings: widget.settings || {},
        isVisible: true,
      }));
    } catch (error) {
      console.error('Error fetching available widgets:', error);
      throw error;
    }
  }

  /**
   * Get user's widget layouts
   */
  async getUserWidgetLayouts(dashboardId: string = 'default'): Promise<{ widgets: Widget[], layouts: Layout[] }> {
    try {
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get user's widget layouts
      const { data: layoutsData, error } = await this.supabase
        .from('user_widget_layouts')
        .select(`
          id,
          pos_x,
          pos_y,
          width,
          height,
          settings,
          dashboard_widgets (
            id,
            widget_key,
            widget_name,
            description,
            min_width,
            min_height,
            default_width,
            default_height,
            max_width,
            max_height,
            settings
          )
        `)
        .eq('user_id', user.id)
        .eq('dashboard_id', dashboardId);

      if (error) {
        throw new Error(`Failed to load user layouts: ${error.message}`);
      }

      if (!layoutsData || layoutsData.length === 0) {
        // No layouts found, we'll need to set up defaults
        return { widgets: [], layouts: [] };
      }

      // Transform the data into widgets and layouts
      const widgets: Widget[] = [];
      const layouts: Layout[] = [];

      layoutsData.forEach(item => {
        const widget = item.dashboard_widgets;
        if (!widget) return;

        // Create widget object
        const widgetObj: Widget = {
          id: widget.id,
          type: widget.widget_key as WidgetType,
          title: widget.widget_name,
          description: widget.description || undefined,
          minWidth: widget.min_width,
          minHeight: widget.min_height,
          defaultWidth: widget.default_width,
          defaultHeight: widget.default_height,
          maxWidth: widget.max_width || undefined,
          maxHeight: widget.max_height || undefined,
          settings: { ...widget.settings, ...item.settings },
          isVisible: true,
        };

        widgets.push(widgetObj);

        // Create layout item
        layouts.push({
          i: widget.id,
          x: item.pos_x,
          y: item.pos_y,
          w: item.width,
          h: item.height,
          minW: widget.min_width,
          minH: widget.min_height,
          maxW: widget.max_width || Infinity,
          maxH: widget.max_height || Infinity,
        });
      });

      return { widgets, layouts };
    } catch (error) {
      console.error('Error fetching user widget layouts:', error);
      throw error;
    }
  }

  /**
   * Save user's widget layout
   */
  async saveWidgetLayout(layouts: Layout[], dashboardId: string = 'default'): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // We need to batch our operations to update all layouts at once
      const updates = layouts.map(layout => ({
        user_id: user.id,
        dashboard_id: dashboardId,
        widget_id: layout.i,
        pos_x: layout.x,
        pos_y: layout.y,
        width: layout.w,
        height: layout.h,
      }));

      // Use upsert to handle both updates and inserts
      const { error } = await this.supabase
        .from('user_widget_layouts')
        .upsert(updates, {
          onConflict: 'user_id, dashboard_id, widget_id',
          ignoreDuplicates: false,
        });

      if (error) {
        throw new Error(`Failed to save layout: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error saving widget layout:', error);
      throw error;
    }
  }

  /**
   * Add a widget to the user's dashboard
   */
  async addWidget(widgetKey: string, dashboardId: string = 'default'): Promise<{ widget: Widget, layout: Layout }> {
    try {
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the widget definition
      const { data: widgetData, error: widgetError } = await this.supabase
        .from('dashboard_widgets')
        .select('*')
        .eq('widget_key', widgetKey)
        .single();

      if (widgetError) {
        throw new Error(`Failed to find widget: ${widgetError.message}`);
      }

      // Check if this widget is already on the dashboard
      const { data: existingLayouts, error: layoutCheckError } = await this.supabase
        .from('user_widget_layouts')
        .select('id')
        .eq('user_id', user.id)
        .eq('dashboard_id', dashboardId)
        .eq('widget_id', widgetData.id);

      if (layoutCheckError) {
        throw new Error(`Failed to check existing layouts: ${layoutCheckError.message}`);
      }

      if (existingLayouts && existingLayouts.length > 0) {
        throw new Error('This widget is already on your dashboard');
      }

      // Get current layout to find a good position for the new widget
      const { data: currentLayouts, error: currentLayoutsError } = await this.supabase
        .from('user_widget_layouts')
        .select('pos_y, pos_x, width, height')
        .eq('user_id', user.id)
        .eq('dashboard_id', dashboardId)
        .order('pos_y', { ascending: false });

      if (currentLayoutsError) {
        throw new Error(`Failed to get current layout: ${currentLayoutsError.message}`);
      }

      // Calculate position for the new widget
      // Default to position 0,0 if no widgets exist
      let posX = 0;
      let posY = 0;

      if (currentLayouts && currentLayouts.length > 0) {
        // Find the lowest row with available space
        const maxY = Math.max(...currentLayouts.map(l => l.pos_y + l.height));
        posY = maxY;
      }

      // Add the widget to the user's layout
      const { data: newLayoutData, error: addError } = await this.supabase
        .from('user_widget_layouts')
        .insert({
          user_id: user.id,
          dashboard_id: dashboardId,
          widget_id: widgetData.id,
          pos_x: posX,
          pos_y: posY,
          width: widgetData.default_width,
          height: widgetData.default_height,
        })
        .select()
        .single();

      if (addError) {
        throw new Error(`Failed to add widget: ${addError.message}`);
      }

      // Return the widget and layout
      const widget: Widget = {
        id: widgetData.id,
        type: widgetData.widget_key as WidgetType,
        title: widgetData.widget_name,
        description: widgetData.description || undefined,
        minWidth: widgetData.min_width,
        minHeight: widgetData.min_height,
        defaultWidth: widgetData.default_width,
        defaultHeight: widgetData.default_height,
        maxWidth: widgetData.max_width || undefined,
        maxHeight: widgetData.max_height || undefined,
        settings: widgetData.settings || {},
        isVisible: true,
      };

      const layout: Layout = {
        i: widgetData.id,
        x: newLayoutData.pos_x,
        y: newLayoutData.pos_y,
        w: newLayoutData.width,
        h: newLayoutData.height,
        minW: widgetData.min_width,
        minH: widgetData.min_height,
        maxW: widgetData.max_width || Infinity,
        maxH: widgetData.max_height || Infinity,
      };

      return { widget, layout };
    } catch (error) {
      console.error('Error adding widget:', error);
      throw error;
    }
  }

  /**
   * Remove a widget from the user's dashboard
   */
  async removeWidget(widgetId: string, dashboardId: string = 'default'): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Remove the widget from the user's layout
      const { error } = await this.supabase
        .from('user_widget_layouts')
        .delete()
        .eq('user_id', user.id)
        .eq('dashboard_id', dashboardId)
        .eq('widget_id', widgetId);

      if (error) {
        throw new Error(`Failed to remove widget: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error removing widget:', error);
      throw error;
    }
  }

  /**
   * Update widget settings
   */
  async updateWidgetSettings(
    widgetId: string, 
    settings: Record<string, any>, 
    dashboardId: string = 'default'
  ): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update the widget settings
      const { error } = await this.supabase
        .from('user_widget_layouts')
        .update({ settings })
        .eq('user_id', user.id)
        .eq('dashboard_id', dashboardId)
        .eq('widget_id', widgetId);

      if (error) {
        throw new Error(`Failed to update widget settings: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating widget settings:', error);
      throw error;
    }
  }

  /**
   * Get default layout based on user role
   */
  async getDefaultLayout(role: string, dashboardId: string = 'default'): Promise<Layout[]> {
    try {
      // Get layout preset for the role
      const { data, error } = await this.supabase
        .from('dashboard_layout_presets')
        .select('layout')
        .eq('role', role)
        .eq('dashboard_id', dashboardId)
        .eq('is_default', true)
        .single();

      if (error) {
        throw new Error(`Failed to get default layout: ${error.message}`);
      }

      if (!data || !data.layout) {
        return [];
      }

      return data.layout as Layout[];
    } catch (error) {
      console.error('Error getting default layout:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
