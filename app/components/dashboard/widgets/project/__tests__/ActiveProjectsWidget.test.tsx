import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ActiveProjectsWidget from '../ActiveProjectsWidget';
import { ProjectHealth } from '@/lib/types/project';

// Mock the useTranslations hook
vi.mock('@/app/hooks/useTranslations', () => ({
  useTranslations: () => ({
    t: (key: string) => key // Return the key as the translation
  })
}));

// Mock the useSupabase hook with project data
vi.mock('@/lib/hooks/useSupabase', () => {
  const mockProjects = [
    {
      id: '1',
      name: 'Test Project 1',
      health: 'GOOD',
      progress: 75,
      dueDate: new Date(2025, 5, 15).toISOString(),
      isActive: true
    },
    {
      id: '2',
      name: 'Test Project 2',
      health: 'AT_RISK',
      progress: 45,
      dueDate: new Date(2025, 4, 30).toISOString(),
      isActive: true
    },
    {
      id: '3',
      name: 'Test Project 3',
      health: 'CRITICAL',
      progress: 20,
      dueDate: new Date(2025, 4, 20).toISOString(),
      isActive: true
    }
  ];

  return {
    useSupabase: () => ({
      supabase: {
        from: () => ({
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => Promise.resolve({
                  data: mockProjects,
                  error: null
                })
              })
            })
          })
        })
      }
    })
  };
});

describe('ActiveProjectsWidget', () => {
  const mockProjects = [
    {
      id: '1',
      name: 'Test Project 1',
      health: 'GOOD',
      progress: 75,
      dueDate: new Date(2025, 5, 15).toISOString(),
      isActive: true
    },
    {
      id: '2',
      name: 'Test Project 2',
      health: 'AT_RISK',
      progress: 45,
      dueDate: new Date(2025, 4, 30).toISOString(),
      isActive: true
    },
    {
      id: '3',
      name: 'Test Project 3',
      health: 'CRITICAL',
      progress: 20,
      dueDate: new Date(2025, 4, 20).toISOString(),
      isActive: true
    }
  ];

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
  });

  it('renders the widget title correctly', async () => {
    render(<ActiveProjectsWidget id="test-id" title="Active Projects" />);
    
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    // Override the mock to delay the response
    vi.mock('@/lib/hooks/useSupabase', () => ({
      useSupabase: () => ({
        supabase: {
          from: () => ({
            select: () => ({
              eq: () => ({
                order: () => ({
                  limit: () => new Promise(resolve => setTimeout(() => resolve({ data: mockProjects, error: null }), 100))
                })
              })
            })
          })
        }
      })
    }), { virtual: true });
    
    render(<ActiveProjectsWidget id="test-id" title="Active Projects" />);
    
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('displays error state when API call fails', async () => {
    // Override the mock to return an error
    vi.mock('@/lib/hooks/useSupabase', () => ({
      useSupabase: () => ({
        supabase: {
          from: () => ({
            select: () => ({
              eq: () => ({
                order: () => ({
                  limit: () => Promise.resolve({ data: null, error: new Error('Failed to fetch projects') })
                })
              })
            })
          })
        }
      })
    }), { virtual: true });
    
    render(<ActiveProjectsWidget id="test-id" title="Active Projects" />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('filters projects by health status', async () => {
    render(<ActiveProjectsWidget id="test-id" title="Active Projects" />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
      expect(screen.getByText('Test Project 3')).toBeInTheDocument();
    });
    
    // Find and click the filter dropdown
    const filterButton = screen.getByRole('button', { name: /dashboard.widgets.activeProjects.filterByHealth/i });
    fireEvent.click(filterButton);
    
    // Select the "At Risk" filter
    const atRiskOption = screen.getByRole('option', { name: /dashboard.widgets.activeProjects.health.AT_RISK/i });
    fireEvent.click(atRiskOption);
    
    // Verify only the at-risk project is shown
    await waitFor(() => {
      expect(screen.queryByText('Test Project 1')).not.toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
      expect(screen.queryByText('Test Project 3')).not.toBeInTheDocument();
    });
  });

  it('sorts projects correctly', async () => {
    render(<ActiveProjectsWidget id="test-id" title="Active Projects" settings={{ sortBy: 'dueDate', sortDirection: 'asc' }} />);
    
    await waitFor(() => {
      const projectElements = screen.getAllByTestId('project-item');
      expect(projectElements.length).toBe(3);
      
      // Check that projects are displayed in correct order (by due date)
      expect(projectElements[0]).toHaveTextContent('Test Project 3'); // Due date: 2025-04-20
      expect(projectElements[1]).toHaveTextContent('Test Project 2'); // Due date: 2025-04-30
      expect(projectElements[2]).toHaveTextContent('Test Project 1'); // Due date: 2025-05-15
    });
  });

  it('limits the number of displayed projects', async () => {
    render(<ActiveProjectsWidget id="test-id" title="Active Projects" settings={{ projectCount: 2 }} />);
    
    await waitFor(() => {
      const projectElements = screen.getAllByTestId('project-item');
      expect(projectElements.length).toBe(2);
    });
  });

  it('displays progress bars correctly', async () => {
    render(<ActiveProjectsWidget id="test-id" title="Active Projects" />);
    
    await waitFor(() => {
      const progressBars = screen.getAllByTestId('progress-bar');
      expect(progressBars.length).toBe(3);
      
      // Check that the first project shows 75% progress
      expect(progressBars[0]).toHaveStyle('width: 75%');
    });
  });

  it('displays correct health indicators', async () => {
    render(<ActiveProjectsWidget id="test-id" title="Active Projects" />);
    
    await waitFor(() => {
      const healthIndicators = screen.getAllByTestId('health-indicator');
      expect(healthIndicators.length).toBe(3);
      
      // Check that health indicators have the correct colors
      expect(healthIndicators[0]).toHaveClass('bg-green-500'); // GOOD
      expect(healthIndicators[1]).toHaveClass('bg-yellow-500'); // AT_RISK
      expect(healthIndicators[2]).toHaveClass('bg-red-500'); // CRITICAL
    });
  });
});
