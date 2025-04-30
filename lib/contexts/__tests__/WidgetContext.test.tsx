import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { WidgetProvider, useWidgets } from '../WidgetContext';
import { WidgetType, WidgetSize } from '@/lib/types/widget';

// Create fetch mock
global.fetch = vi.fn();

// Mock createClientComponentClient from Supabase
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      })
    }
  })
}));

// Test component to extract and render WidgetContext values
function TestComponent() {
  const { 
    dashboardConfig, 
    isLoading, 
    error, 
    addWidget,
    updateWidgetSettings,
    toggleWidgetVisibility,
    removeWidget
  } = useWidgets();
  
  const handleAddWidget = () => addWidget(WidgetType.ACTIVE_PROJECTS);
  const handleToggleVisibility = () => {
    if (dashboardConfig?.widgets[0]) {
      toggleWidgetVisibility(dashboardConfig.widgets[0].id);
    }
  };
  const handleUpdateSettings = () => {
    if (dashboardConfig?.widgets[0]) {
      updateWidgetSettings(dashboardConfig.widgets[0].id, { testSetting: 'updated' });
    }
  };
  const handleRemoveWidget = () => {
    if (dashboardConfig?.widgets[0]) {
      removeWidget(dashboardConfig.widgets[0].id);
    }
  };
  
  return (
    <div>
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error-state">{error ? error.message : 'No Error'}</div>
      <div data-testid="widget-count">
        {dashboardConfig?.widgets.length || 0}
      </div>
      <ul>
        {dashboardConfig?.widgets.map(widget => (
          <li key={widget.id} data-testid="widget-item">
            {widget.title} | Visible: {widget.isVisible ? 'Yes' : 'No'} | 
            Settings: {JSON.stringify(widget.settings)}
          </li>
        ))}
      </ul>
      <button onClick={handleAddWidget} data-testid="add-widget-btn">Add Widget</button>
      <button onClick={handleToggleVisibility} data-testid="toggle-visibility-btn">Toggle Visibility</button>
      <button onClick={handleUpdateSettings} data-testid="update-settings-btn">Update Settings</button>
      <button onClick={handleRemoveWidget} data-testid="remove-widget-btn">Remove Widget</button>
    </div>
  );
}

describe('WidgetContext', () => {
  const mockDashboard = {
    id: 'default',
    name: 'Default Dashboard',
    isDefault: true,
    widgets: [
      {
        id: 'test-widget-1',
        type: WidgetType.ACTIVE_PROJECTS,
        size: WidgetSize.MEDIUM,
        title: 'Active Projects',
        isVisible: true,
        settings: {
          projectCount: 5,
          sortBy: 'dueDate'
        }
      }
    ],
    layouts: {
      desktop: [
        { i: 'test-widget-1', x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 2 }
      ],
      tablet: [],
      mobile: [],
    }
  };
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock successful fetch responses
    (global.fetch as any).mockImplementation((url: string, config: any) => {
      if (url.includes('/api/dashboard') && !config) {
        // GET request
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ dashboard: mockDashboard })
        });
      } else if (url.includes('/api/dashboard') && config?.method === 'POST') {
        // POST request
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      
      return Promise.reject(new Error('Unmatched request'));
    });
  });
  
  it('loads dashboard config on mount', async () => {
    render(
      <WidgetProvider>
        <TestComponent />
      </WidgetProvider>
    );
    
    // Check loading state
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Check dashboard loaded correctly
    expect(screen.getByTestId('widget-count')).toHaveTextContent('1');
    expect(screen.getByTestId('widget-item')).toHaveTextContent('Active Projects');
    
    // Verify API was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/api/dashboard?id=default');
  });
  
  it('adds a new widget correctly', async () => {
    // Mock Date.now to return a consistent ID
    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(12345);
    
    render(
      <WidgetProvider>
        <TestComponent />
      </WidgetProvider>
    );
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Click the add widget button
    await act(async () => {
      screen.getByTestId('add-widget-btn').click();
    });
    
    // Check that a new widget was added
    expect(screen.getByTestId('widget-count')).toHaveTextContent('2');
    
    // Clean up
    dateSpy.mockRestore();
  });
  
  it('toggles widget visibility', async () => {
    render(
      <WidgetProvider>
        <TestComponent />
      </WidgetProvider>
    );
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByTestId('widget-item')).toHaveTextContent('Visible: Yes');
    });
    
    // Toggle visibility
    await act(async () => {
      screen.getByTestId('toggle-visibility-btn').click();
    });
    
    // Check that visibility changed
    expect(screen.getByTestId('widget-item')).toHaveTextContent('Visible: No');
  });
  
  it('updates widget settings', async () => {
    render(
      <WidgetProvider>
        <TestComponent />
      </WidgetProvider>
    );
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('widget-item')).toBeInTheDocument();
    });
    
    // Update settings
    await act(async () => {
      screen.getByTestId('update-settings-btn').click();
    });
    
    // Check settings were updated
    expect(screen.getByTestId('widget-item')).toHaveTextContent('"testSetting":"updated"');
  });
  
  it('removes a widget', async () => {
    render(
      <WidgetProvider>
        <TestComponent />
      </WidgetProvider>
    );
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByTestId('widget-count')).toHaveTextContent('1');
    });
    
    // Remove widget
    await act(async () => {
      screen.getByTestId('remove-widget-btn').click();
    });
    
    // Check that widget was removed
    expect(screen.getByTestId('widget-count')).toHaveTextContent('0');
    expect(screen.queryByTestId('widget-item')).not.toBeInTheDocument();
  });
  
  it('handles API errors gracefully', async () => {
    // Mock a failed API response
    (global.fetch as any).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to load dashboard' })
      })
    );
    
    render(
      <WidgetProvider>
        <TestComponent />
      </WidgetProvider>
    );
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to load dashboard');
    });
  });
  
  it('persists dashboard changes to the API', async () => {
    render(
      <WidgetProvider>
        <TestComponent />
      </WidgetProvider>
    );
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Toggle visibility
    await act(async () => {
      screen.getByTestId('toggle-visibility-btn').click();
    });
    
    // Check that API was called to save changes
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/dashboard', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }));
    });
  });
});
