import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActiveProjectsWidget from '@/app/components/dashboard/widgets/project/ActiveProjectsWidget';
import { ProjectStatus, ProjectHealth } from '@/lib/types/project';

// Mock the translations hook
jest.mock('@/app/hooks/useTranslations', () => ({
  useTranslations: () => ({
    t: (key: string, params?: any) => {
      // Simple mock implementation
      if (key === 'project.progress' && params?.percent) {
        return `Progress: ${params.percent}%`;
      }
      
      if (key === 'project.health.ON_TRACK') return 'On Track';
      if (key === 'project.health.AT_RISK') return 'At Risk'; 
      if (key === 'project.health.DELAYED') return 'Delayed';
      
      return key;
    },
    locale: 'en'
  })
}));

// Mock the API call
jest.mock('@/lib/api/projects', () => ({
  getActiveProjects: jest.fn().mockResolvedValue([
    {
      id: 'proj-001',
      name: 'Downtown Office Renovation',
      status: ProjectStatus.IN_PROGRESS,
      health: ProjectHealth.ON_TRACK,
      progress: 45,
      daysAhead: 2,
      dueDate: new Date(2025, 7, 15),
      thumbnail: '/images/projects/downtown-office.jpg'
    },
    {
      id: 'proj-002',
      name: 'Highland Park Residence',
      status: ProjectStatus.IN_PROGRESS,
      health: ProjectHealth.AT_RISK,
      progress: 32,
      daysAhead: -5,
      dueDate: new Date(2025, 5, 30),
      thumbnail: '/images/projects/highland-residence.jpg'
    }
  ])
}));

describe('ActiveProjectsWidget', () => {
  test('renders loading state initially', () => {
    // Arrange & Act
    render(<ActiveProjectsWidget id="test-widget" title="Active Projects" />);
    
    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });
  
  test('renders projects after loading', async () => {
    // Arrange & Act
    render(<ActiveProjectsWidget id="test-widget" title="Active Projects" />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Assert
    expect(screen.getByText('Downtown Office Renovation')).toBeInTheDocument();
    expect(screen.getByText('Highland Park Residence')).toBeInTheDocument();
    expect(screen.getByText('On Track')).toBeInTheDocument();
    expect(screen.getByText('At Risk')).toBeInTheDocument();
  });
  
  test('renders different views based on displayMode setting', async () => {
    // Arrange & Act - Compact mode
    const { rerender } = render(
      <ActiveProjectsWidget 
        id="test-widget" 
        title="Active Projects" 
        settings={{ displayMode: 'compact' }} 
      />
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Assert - compact mode shouldn't show thumbnails
    expect(screen.queryByAltText('Downtown Office Renovation')).not.toBeInTheDocument();
    
    // Rerender with detailed mode
    rerender(
      <ActiveProjectsWidget 
        id="test-widget" 
        title="Active Projects" 
        settings={{ displayMode: 'detailed' }} 
      />
    );
    
    // In detailed mode, thumbnails should be visible (in our case, we check for placeholder divs)
    expect(screen.getAllByTestId(/project-thumbnail-/)).toHaveLength(2);
  });
  
  test('renders empty state when no projects', async () => {
    // Arrange - Mock empty projects array
    require('@/lib/api/projects').getActiveProjects.mockResolvedValueOnce([]);
    
    // Act
    render(<ActiveProjectsWidget id="test-widget" title="Active Projects" />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Assert - should show empty state
    expect(screen.getByText('project.noActiveProjects')).toBeInTheDocument();
    expect(screen.getByText('project.createProject')).toBeInTheDocument();
  });
  
  test('renders error state on API failure', async () => {
    // Arrange - Mock API error
    require('@/lib/api/projects').getActiveProjects.mockRejectedValueOnce(
      new Error('Failed to load projects')
    );
    
    // Act
    render(<ActiveProjectsWidget id="test-widget" title="Active Projects" />);
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Assert - should show error state
    expect(screen.getByText('widget.errorLoading')).toBeInTheDocument();
    expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
  });
});
