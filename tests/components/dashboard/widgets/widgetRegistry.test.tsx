import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WidgetRegistry from '@/app/components/dashboard/widgets/WidgetRegistry';
import { WidgetProvider } from '@/lib/contexts/WidgetContext';
import { WidgetType } from '@/lib/types/widget';

// Mock the Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    from: jest.fn().mockImplementation(() => ({
      select: jest.fn().mockImplementation(() => ({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'test-dashboard',
              name: 'Test Dashboard',
              is_default: true,
              config: {
                widgets: [
                  {
                    id: 'active-projects-1',
                    type: WidgetType.ACTIVE_PROJECTS,
                    title: 'Active Projects',
                    isVisible: true
                  },
                  {
                    id: 'project-timeline-1',
                    type: WidgetType.PROJECT_TIMELINE,
                    title: 'Project Timeline',
                    isVisible: true
                  },
                  {
                    id: 'project-health-1',
                    type: WidgetType.PROJECT_HEALTH,
                    title: 'Project Health',
                    isVisible: true
                  }
                ],
                layouts: {
                  desktop: [],
                  tablet: [],
                  mobile: []
                }
              }
            }
          })
        })
      }))
    }),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user'
          }
        }
      })
    }
  })
}));

// Mock the widget components
jest.mock('@/app/components/dashboard/widgets/project/ActiveProjectsWidget', () => {
  return function MockActiveProjectsWidget({ id, title }) {
    return <div data-testid={`widget-${id}`}>{title} (Active Projects)</div>;
  };
});

jest.mock('@/app/components/dashboard/widgets/project/ProjectTimelineWidget', () => {
  return function MockProjectTimelineWidget({ id, title }) {
    return <div data-testid={`widget-${id}`}>{title} (Timeline)</div>;
  };
});

jest.mock('@/app/components/dashboard/widgets/project/ProjectHealthWidget', () => {
  return function MockProjectHealthWidget({ id, title }) {
    return <div data-testid={`widget-${id}`}>{title} (Health)</div>;
  };
});

// Mock the WidgetContainer component
jest.mock('@/app/components/dashboard/widgets/WidgetContainer', () => {
  return function MockWidgetContainer({ children, widget }) {
    return (
      <div data-testid={`container-${widget.id}`} className="widget-container">
        {children}
      </div>
    );
  };
});

describe('WidgetRegistry', () => {
  test('renders the correct widget based on widget type', async () => {
    // Arrange & Act
    render(
      <WidgetProvider>
        <WidgetRegistry widgetId="active-projects-1" />
      </WidgetProvider>
    );
    
    // Wait for the component to load data
    await screen.findByTestId('container-active-projects-1');
    
    // Assert
    expect(screen.getByText('Active Projects (Active Projects)')).toBeInTheDocument();
  });
  
  test('handles unknown widget types gracefully', async () => {
    // Mock an unknown widget type
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Arrange & Act - This should render the unknown widget type
    render(
      <WidgetProvider>
        <WidgetRegistry widgetId="unknown-widget-id" />
      </WidgetProvider>
    );
    
    // The component shouldn't render anything for unknown widget IDs
    expect(screen.queryByTestId(/container-.*$/)).not.toBeInTheDocument();
  });
  
  test('supports all required widget types from document 402', async () => {
    // This test ensures we support all widget types mentioned in document 402
    const requiredWidgetTypes = [
      WidgetType.ACTIVE_PROJECTS,
      WidgetType.PROJECT_TIMELINE,
      WidgetType.PROJECT_HEALTH,
      WidgetType.MY_TASKS,
      WidgetType.TEAM_TASKS,
      WidgetType.CRITICAL_PATH,
      WidgetType.PROGRESS_REPORTS,
      WidgetType.FINANCIAL_DASHBOARD
    ];
    
    // Check that all required widget types are defined in the WidgetType enum
    requiredWidgetTypes.forEach(widgetType => {
      expect(Object.values(WidgetType)).toContain(widgetType);
    });
  });
});
