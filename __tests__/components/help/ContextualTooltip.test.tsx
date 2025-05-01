import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ContextualTooltip from '@/app/components/help/ContextualTooltip';

jest.mock('@heroicons/react/24/outline', () => ({
  QuestionMarkCircleIcon: () => <div data-testid="question-mark-icon" />
}));

jest.mock('@/app/hooks/useTranslations', () => ({
  useTranslations: () => ({
    t: (key: string) => key, // Return the key for testing
  }),
}));

describe('ContextualTooltip Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the tooltip icon', () => {
    render(
      <ContextualTooltip 
        title="Test Tooltip" 
        content="This is a test tooltip content" 
      />
    );
    
    expect(screen.getByTestId('question-mark-icon')).toBeInTheDocument();
    expect(screen.queryByText('Test Tooltip')).not.toBeInTheDocument();
    expect(screen.queryByText('This is a test tooltip content')).not.toBeInTheDocument();
  });
  
  it('shows tooltip content when hovered', () => {
    render(
      <ContextualTooltip 
        title="Test Tooltip" 
        content="This is a test tooltip content" 
      />
    );
    
    // Hover over the icon
    fireEvent.mouseEnter(screen.getByRole('button'));
    
    expect(screen.getByText('Test Tooltip')).toBeInTheDocument();
    expect(screen.getByText('This is a test tooltip content')).toBeInTheDocument();
  });
  
  it('hides tooltip content when mouse leaves', () => {
    render(
      <ContextualTooltip 
        title="Test Tooltip" 
        content="This is a test tooltip content" 
      />
    );
    
    // Hover over the icon
    fireEvent.mouseEnter(screen.getByRole('button'));
    
    // Move mouse away
    fireEvent.mouseLeave(screen.getByRole('button'));
    
    expect(screen.queryByText('Test Tooltip')).not.toBeInTheDocument();
    expect(screen.queryByText('This is a test tooltip content')).not.toBeInTheDocument();
  });
  
  it('toggles tooltip content when clicked', () => {
    render(
      <ContextualTooltip 
        title="Test Tooltip" 
        content="This is a test tooltip content" 
      />
    );
    
    // Click the icon to show tooltip
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.getByText('Test Tooltip')).toBeInTheDocument();
    expect(screen.getByText('This is a test tooltip content')).toBeInTheDocument();
    
    // Click again to hide tooltip
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.queryByText('Test Tooltip')).not.toBeInTheDocument();
    expect(screen.queryByText('This is a test tooltip content')).not.toBeInTheDocument();
  });
  
  it('renders with different positions', () => {
    const { rerender } = render(
      <ContextualTooltip 
        title="Test Tooltip" 
        content="This is a test tooltip content"
        position="right"
      />
    );
    
    // Show tooltip
    fireEvent.mouseEnter(screen.getByRole('button'));
    
    // Check tooltip is positioned to the right
    const tooltip = screen.getByText('Test Tooltip').closest('div');
    expect(tooltip?.className).toContain('left-full');
    
    // Rerender with bottom position
    rerender(
      <ContextualTooltip 
        title="Test Tooltip" 
        content="This is a test tooltip content"
        position="bottom"
      />
    );
    
    // Show tooltip
    fireEvent.mouseEnter(screen.getByRole('button'));
    
    // Check tooltip is positioned to the bottom
    const bottomTooltip = screen.getByText('Test Tooltip').closest('div');
    expect(bottomTooltip?.className).toContain('top-full');
  });
});
