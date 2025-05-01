import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import DragHandle from '../DragHandle';

// Mock the DndProvider
vi.mock('react-dnd', () => ({
  useDrag: () => [{ isDragging: false }, vi.fn()]
}));

// Create a mock wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Mock the useTranslations hook
vi.mock('@/app/hooks/useTranslations', () => ({
  useTranslations: () => ({
    t: (key: string) => key // Return the key as the translation
  })
}));

// Create a mock for useDrag hook
vi.mock('react-dnd', () => ({
  useDrag: () => [
    { isDragging: false },
    vi.fn(),
  ]
}));

describe('DragHandle', () => {
  it('renders properly in edit mode', () => {
    render(
      <TestWrapper>
        <DragHandle widgetId="test-widget" isEditMode={true} />
      </TestWrapper>
    );
    
    // Check that the handle is rendered
    const dragHandle = screen.getByTitle('widgets.actions.drag');
    expect(dragHandle).toBeInTheDocument();
    expect(dragHandle).toHaveClass('cursor-grab');
  });
  
  it('does not render when not in edit mode', () => {
    render(
      <TestWrapper>
        <DragHandle widgetId="test-widget" isEditMode={false} />
      </TestWrapper>
    );
    
    // Check that the handle is not rendered
    expect(screen.queryByTitle('widgets.actions.drag')).not.toBeInTheDocument();
  });
  
  it('registers with react-dnd with the correct props', () => {
    // Create a mock implementation for useDrag
    const useDragMock = vi.fn(() => [{ isDragging: false }, vi.fn()]);
    
    // Replace the mock implementation temporarily
    const reactDndModule = require('react-dnd');
    const originalUseDrag = reactDndModule.useDrag;
    reactDndModule.useDrag = useDragMock;
    
    render(
      <TestWrapper>
        <DragHandle widgetId="test-widget" isEditMode={true} />
      </TestWrapper>
    );
    
    // Verify the drag configuration
    expect(useDragMock).toHaveBeenCalled();
    
    // Reset the mock
    reactDndModule.useDrag = originalUseDrag;
  });
  
  it('disables dragging when not in edit mode', () => {
    // Create a mock implementation for useDrag
    const useDragMock = vi.fn(() => [{ isDragging: false }, vi.fn()]);
    
    // Replace the mock implementation temporarily
    const reactDndModule = require('react-dnd');
    const originalUseDrag = reactDndModule.useDrag;
    reactDndModule.useDrag = useDragMock;
    
    render(
      <TestWrapper>
        <DragHandle widgetId="test-widget" isEditMode={false} />
      </TestWrapper>
    );
    
    // Verify the drag configuration is not called because component not rendered
    expect(useDragMock).not.toHaveBeenCalled();
    
    // Reset the mock
    reactDndModule.useDrag = originalUseDrag;
  });
});
