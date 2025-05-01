import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HelpCenter from '@/app/components/help/HelpCenter';
import { toast } from 'react-hot-toast';

// Setup Jest DOM extensions
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

jest.mock('@/app/hooks/useTranslations', () => ({
  useTranslations: () => ({
    t: (key: string) => key, // Return the key for testing
  }),
}));

jest.mock('@/app/components/help/HelpArticle', () => ({
  __esModule: true,
  default: ({ article, onBack, onHelpfulVote }: any) => (
    <div data-testid="help-article">
      <h2>{article.title}</h2>
      <button data-testid="back-button" onClick={onBack}>Back</button>
      <button data-testid="helpful-button" onClick={() => onHelpfulVote(true)}>Helpful</button>
    </div>
  ),
}));

jest.mock('@/app/components/help/SupportTicketForm', () => ({
  __esModule: true,
  default: ({ onSubmit, onCancel, isLoading }: any) => (
    <div data-testid="support-ticket-form">
      <button 
        data-testid="submit-ticket" 
        onClick={() => onSubmit('Test Subject', 'Test Description', 'Technical Issue', 'medium')}
      >
        Submit
      </button>
      <button data-testid="cancel-button" onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('HelpCenter Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the help center with knowledge base tab by default', () => {
    render(<HelpCenter />);
    
    expect(screen.getByText(/Knowledge Base/i)).toBeInTheDocument();
    expect(screen.getByText(/Support Tickets/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Chat/i)).toBeInTheDocument();
    
    // Expect to see article list initially
    expect(screen.getByText(/Popular Articles/i)).toBeInTheDocument();
  });
  
  it('allows switching between tabs', async () => {
    render(<HelpCenter />);
    
    // Switch to support tickets tab
    fireEvent.click(screen.getByText(/Support Tickets/i));
    await waitFor(() => {
      expect(screen.getByText(/My Support Tickets/i)).toBeInTheDocument();
    });
    
    // Switch to live chat tab
    fireEvent.click(screen.getByText(/Live Chat/i));
    await waitFor(() => {
      expect(screen.getByText(/Chat with Support/i)).toBeInTheDocument();
    });
    
    // Switch back to knowledge base tab
    fireEvent.click(screen.getByText(/Knowledge Base/i));
    await waitFor(() => {
      expect(screen.getByText(/Popular Articles/i)).toBeInTheDocument();
    });
  });
  
  it('shows article details when an article is clicked', async () => {
    render(<HelpCenter />);
    
    // Click on the first article
    const articles = screen.getAllByRole('heading', { level: 4 });
    fireEvent.click(articles[0].parentElement!);
    
    await waitFor(() => {
      expect(screen.getByTestId('help-article')).toBeInTheDocument();
    });
    
    // Go back to article list
    fireEvent.click(screen.getByTestId('back-button'));
    await waitFor(() => {
      expect(screen.getByText(/Popular Articles/i)).toBeInTheDocument();
    });
  });
  
  it('allows creating a support ticket', async () => {
    render(<HelpCenter />);
    
    // Switch to support tickets tab
    fireEvent.click(screen.getByText(/Support Tickets/i));
    
    // Click on create ticket button
    fireEvent.click(screen.getByText(/Create Ticket/i));
    
    await waitFor(() => {
      expect(screen.getByTestId('support-ticket-form')).toBeInTheDocument();
    });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-ticket'));
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Support ticket submitted successfully');
    });
  });
  
  it('searches for articles when search query changes', async () => {
    render(<HelpCenter />);
    
    const searchInput = screen.getByPlaceholderText(/Search for help/i);
    
    // Enter search query
    fireEvent.change(searchInput, { target: { value: 'authentication' } });
    
    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText(/results for "authentication"/i)).toBeInTheDocument();
    });
    
    // Clear search query
    fireEvent.change(searchInput, { target: { value: '' } });
    
    await waitFor(() => {
      expect(screen.getByText(/Popular Articles/i)).toBeInTheDocument();
    });
  });
});
