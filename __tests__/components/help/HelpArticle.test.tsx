import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import HelpArticle from '@/app/components/help/HelpArticle';
import { toast } from 'react-hot-toast';
import { HelpArticle as HelpArticleType } from '@/app/components/help/HelpCenter';

// Mock dependencies
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

jest.mock('@heroicons/react/24/outline', () => ({
  ArrowLeftIcon: () => <span data-testid="arrow-left-icon" />,
  HandThumbUpIcon: () => <span data-testid="thumb-up-icon" />,
  HandThumbDownIcon: () => <span data-testid="thumb-down-icon" />,
  PrinterIcon: () => <span data-testid="printer-icon" />,
  EnvelopeIcon: () => <span data-testid="envelope-icon" />,
  ArrowUturnLeftIcon: () => <span data-testid="arrow-return-icon" />
}));

jest.mock('@/app/hooks/useTranslations', () => ({
  useTranslations: () => ({
    t: (key: string) => key, // Return the key for testing
  }),
}));

describe('HelpArticle Component', () => {
  const mockArticle: HelpArticleType = {
    id: 'test-article-1',
    title: 'Test Article',
    content: '<h2>Test Content</h2><p>This is a test article content</p>',
    category: 'getting-started',
    tags: ['test', 'example', 'help'],
    lastUpdated: '2025-04-15T14:30:00Z',
    views: 123,
    helpfulness: {
      helpful: 10,
      notHelpful: 2
    }
  };
  
  const mockOnBack = jest.fn();
  const mockOnHelpfulVote = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.print
    window.print = jest.fn();
    // Mock window.open
    window.open = jest.fn();
  });
  
  it('renders the article content', () => {
    render(
      <HelpArticle 
        article={mockArticle}
        onBack={mockOnBack}
        onHelpfulVote={mockOnHelpfulVote}
      />
    );
    
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('This is a test article content')).toBeInTheDocument();
    
    // Check tags are displayed
    mockArticle.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
    
    // Check date is formatted
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    
    // Check helpful counts
    expect(screen.getByText(/Yes \(10\)/)).toBeInTheDocument();
    expect(screen.getByText(/No \(2\)/)).toBeInTheDocument();
  });
  
  it('calls onBack when back button is clicked', () => {
    render(
      <HelpArticle 
        article={mockArticle}
        onBack={mockOnBack}
        onHelpfulVote={mockOnHelpfulVote}
      />
    );
    
    fireEvent.click(screen.getByText(/Back to all articles/));
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
  
  it('calls onHelpfulVote when helpful button is clicked', () => {
    render(
      <HelpArticle 
        article={mockArticle}
        onBack={mockOnBack}
        onHelpfulVote={mockOnHelpfulVote}
      />
    );
    
    // Click helpful button
    fireEvent.click(screen.getByText(/Yes \(10\)/));
    
    expect(mockOnHelpfulVote).toHaveBeenCalledTimes(1);
    expect(mockOnHelpfulVote).toHaveBeenCalledWith(true);
    
    // Click not helpful button
    fireEvent.click(screen.getByText(/No \(2\)/));
    
    expect(mockOnHelpfulVote).toHaveBeenCalledTimes(2);
    expect(mockOnHelpfulVote).toHaveBeenCalledWith(false);
  });
  
  it('prevents multiple votes on the same article', () => {
    render(
      <HelpArticle 
        article={mockArticle}
        onBack={mockOnBack}
        onHelpfulVote={mockOnHelpfulVote}
      />
    );
    
    // First click should work
    fireEvent.click(screen.getByText(/Yes \(10\)/));
    expect(mockOnHelpfulVote).toHaveBeenCalledTimes(1);
    
    // Second click shouldn't call the handler again
    fireEvent.click(screen.getByText(/Yes \(10\)/));
    expect(mockOnHelpfulVote).toHaveBeenCalledTimes(1);
    
    // Click on not helpful also shouldn't work
    fireEvent.click(screen.getByText(/No \(2\)/));
    expect(mockOnHelpfulVote).toHaveBeenCalledTimes(1);
    
    // Error toast should be shown
    expect(toast.error).toHaveBeenCalledWith('You have already provided feedback for this article');
  });
  
  it('triggers print when print button is clicked', () => {
    render(
      <HelpArticle 
        article={mockArticle}
        onBack={mockOnBack}
        onHelpfulVote={mockOnHelpfulVote}
      />
    );
    
    // Click print button
    fireEvent.click(screen.getByText('Print'));
    
    expect(window.print).toHaveBeenCalledTimes(1);
  });
  
  it('opens email client when email button is clicked', () => {
    render(
      <HelpArticle 
        article={mockArticle}
        onBack={mockOnBack}
        onHelpfulVote={mockOnHelpfulVote}
      />
    );
    
    // Click email button
    fireEvent.click(screen.getByText('Email'));
    
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('mailto:?subject='));
  });
});
