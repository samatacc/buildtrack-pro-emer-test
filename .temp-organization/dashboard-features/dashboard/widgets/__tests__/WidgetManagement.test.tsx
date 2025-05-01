import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderWithProviders } from '../../__tests__/testUtils';
import WidgetSelector from '../WidgetSelector';
import { WidgetType, WidgetSize } from '@/lib/types/widget';
import { WidgetProvider } from '@/lib/contexts/WidgetContext';

// Mock hooks and providers
vi.mock('@/app/hooks/useTranslations', () => ({
  useTranslations: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'dashboard.widgets.selector.title': 'Add a Widget',
        'dashboard.widgets.selector.description': 'Choose a widget to add to your dashboard',
        'dashboard.widgets.selector.add': 'Add Widget',
        'dashboard.widgets.selector.cancel': 'Cancel',
        'dashboard.widgets.activeProjects.title': 'Active Projects',
        'dashboard.widgets.activeProjects.description': 'View and manage your active projects',
        'dashboard.widgets.projectTimeline.title': 'Project Timeline',
        'dashboard.widgets.projectTimeline.description': 'View project timelines and milestones'
      };
      return translations[key] || key;
    }
  })
}));

// Mock fetch
beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ success: true })
  });
});

afterEach(() => {
  vi.resetAllMocks();
});

// Focus on testing just the WidgetSelector component
describe('WidgetSelector Component', () => {
  test('should render the widget selector modal', async () => {
    const onCloseMock = vi.fn();
    
    renderWithProviders(
      <WidgetSelector isOpen={true} onClose={onCloseMock} />
    );
    
    // Verify the modal title is rendered
    expect(screen.getByText('Add a Widget')).toBeInTheDocument();
    
    // Verify that we have widget options
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
    expect(screen.getByText('Project Timeline')).toBeInTheDocument();
    
    // Verify that action buttons are rendered
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
  
  test('should call onClose when Cancel is clicked', async () => {
    const onCloseMock = vi.fn();
    
    renderWithProviders(
      <WidgetSelector isOpen={true} onClose={onCloseMock} />
    );
    
    // Click the Cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Verify that onClose was called
    expect(onCloseMock).toHaveBeenCalled();
  });
});
