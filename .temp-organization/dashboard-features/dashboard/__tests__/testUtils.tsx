import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { WidgetProvider, Widget, DashboardConfig } from '@/lib/contexts/WidgetContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Layout } from 'react-grid-layout';
import { WidgetSize, WidgetType } from '@/lib/types/widget';

// Mock all translation related functions
const mockTranslations: Record<string, string> = {
  'dashboard.widgets.selector.title': 'Add a Widget',
  'dashboard.widgets.selector.description': 'Choose a widget to add to your dashboard',
  'dashboard.widgets.selector.add': 'Add Widget',
  'dashboard.widgets.selector.cancel': 'Cancel',
  'dashboard.widgets.activeProjects.title': 'Active Projects',
  'dashboard.widgets.activeProjects.description': 'View and manage your active projects',
  'dashboard.widgets.projectTimeline.title': 'Project Timeline',
  'dashboard.widgets.projectTimeline.description': 'View project timelines and milestones',
  'dashboard.widgets.projectHealth.title': 'Project Health',
  'dashboard.widgets.projectHealth.description': 'Monitor the health of your projects',
  'dashboard.widgets.myTasks.title': 'My Tasks',
  'dashboard.widgets.myTasks.description': 'View and manage your tasks',
  'dashboard.widgets.teamTasks.title': 'Team Tasks',
  'dashboard.widgets.teamTasks.description': 'View and manage tasks for your team',
  'dashboard.widgets.sizeSelector.title': 'Select Size',
  'dashboard.widget.sizes.small': 'Small',
  'dashboard.widget.sizes.medium': 'Medium',
  'dashboard.widget.sizes.large': 'Large',
  'dashboard.widgets.actions.resize': 'Resize Widget',
  'dashboard.widgets.actions.remove': 'Remove Widget',
  'dashboard.widgets.actions.settings': 'Widget Settings',
  'dashboard.widgets.actions.hide': 'Hide Widget',
  'dashboard.widgets.actions.show': 'Show Widget',
  'dashboard.widget.confirmRemove': 'Are you sure you want to remove this widget?',
  'dashboard.editLayout': 'Edit Layout',
  'dashboard.saveLayout': 'Save Layout',
  'dashboard.refresh': 'Refresh Dashboard',
  'dashboard.addWidget': 'Add Widget'
};

// Create mock translation hook
vi.mock('@/app/hooks/useTranslations', () => ({
  useTranslations: () => ({
    t: (key: string) => mockTranslations[key] || key
  })
}));

// Mock the next-intl provider that might be used in some components
vi.mock('next-intl', () => ({
  useTranslations: () => ((key: string) => mockTranslations[key] || key),
  // Add any other next-intl exports that might be used
  createTranslator: () => ((key: string) => mockTranslations[key] || key)
}));

// Simple mock provider for translation context if needed
const MockTranslationProvider = ({ children }: { children: ReactNode }) => {
  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
};

// Mock Supabase client
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'test-user-id' } } }),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: {}, error: null }),
        }),
      }),
      insert: () => Promise.resolve({ data: {}, error: null }),
      upsert: () => Promise.resolve({ data: {}, error: null }),
      update: () => Promise.resolve({ data: {}, error: null }),
    }),
  }),
}));

// Create mock project data with proper typing
export const createMockProjects = (count = 3) => {
  return Array(count).fill(null).map((_, i) => ({
    id: `${i + 1}`,
    name: `Test Project ${i + 1}`,
    health: i === 0 ? 'GOOD' : i === 1 ? 'AT_RISK' : 'CRITICAL',
    progress: 75 - (i * 25),
    dueDate: new Date(2025, 4, 15 + (i * 5)).toISOString(),
    isActive: true,
    daysAhead: i === 0 ? 5 : i === 1 ? -2 : -10,
    thumbnail: i % 2 === 0 ? '/test-image.jpg' : null
  }));
};

// Create a wrapper with all required providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  widgetSettings?: Record<string, any>;
  isEditMode?: boolean;
}

// Mock dashboard config for testing
const mockDashboardConfig: DashboardConfig = {
  id: 'test-dashboard',
  name: 'Test Dashboard',
  isDefault: true,
  widgets: [
    { 
      id: 'widget-1', 
      type: WidgetType.ACTIVE_PROJECTS, 
      size: WidgetSize.MEDIUM, 
      title: 'Active Projects',
      isVisible: true 
    },
    { 
      id: 'widget-2', 
      type: WidgetType.PROJECT_TIMELINE, 
      size: WidgetSize.LARGE, 
      title: 'Project Timeline',
      isVisible: true 
    }
  ],
  layouts: {
    desktop: [
      { i: 'widget-1', x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 2 },
      { i: 'widget-2', x: 6, y: 0, w: 12, h: 8, minW: 3, minH: 2 }
    ],
    tablet: [],
    mobile: []
  }
};

// Mock widget context for testing
const createMockWidgetContext = (isEditMode = false) => ({
  availableWidgets: [],
  dashboardConfig: mockDashboardConfig,
  currentLayout: mockDashboardConfig.layouts.desktop,
  isEditMode,
  isLoading: false,
  error: null,
  loadDashboard: vi.fn().mockResolvedValue(undefined),
  saveDashboard: vi.fn().mockResolvedValue(undefined),
  addWidget: vi.fn(),
  removeWidget: vi.fn(),
  updateWidgetLayout: vi.fn(),
  updateWidgetSettings: vi.fn(),
  updateWidgetSize: vi.fn(),
  toggleEditMode: vi.fn(),
  toggleWidgetVisibility: vi.fn(),
  createDashboard: vi.fn().mockResolvedValue('new-dashboard-id'),
});

// Mock fetch function
global.fetch = vi.fn().mockImplementation((url) => {
  if (url.includes('/api/dashboard')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        dashboard: mockDashboardConfig
      }),
    });
  }
  
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
});

// Mock implementation of the WidgetContext
const WidgetContext = React.createContext<any>(null);

// Override the actual WidgetContext import
vi.mock('@/lib/contexts/WidgetContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/contexts/WidgetContext')>();
  return {
    ...actual,
    WidgetContext,
    useWidgetContext: () => React.useContext(WidgetContext),
    WidgetProvider: ({ children }: { children: ReactNode }) => {
      const mockContextValue = createMockWidgetContext(false);
      return <WidgetContext.Provider value={mockContextValue}>{children}</WidgetContext.Provider>;
    }
  };
});

export function renderWithProviders(
  ui: React.ReactElement,
  { 
    widgetSettings = {},
    isEditMode = false,
    ...renderOptions 
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    // Create a mock widget context using our helper
    const mockContextValue = createMockWidgetContext(isEditMode);
    
    return (
      <MockTranslationProvider>
        <DndProvider backend={HTML5Backend}>
          <WidgetContext.Provider value={mockContextValue}>
            {children}
          </WidgetContext.Provider>
        </DndProvider>
      </MockTranslationProvider>
    );
  }
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
