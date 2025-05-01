import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SupportTicketForm from '@/app/components/help/SupportTicketForm';

// Mock dependencies
jest.mock('@heroicons/react/24/outline', () => ({
  XMarkIcon: () => <span data-testid="x-mark-icon" />,
  PaperClipIcon: () => <span data-testid="paper-clip-icon" />
}));

jest.mock('@/app/hooks/useTranslations', () => ({
  useTranslations: () => ({
    t: (key: string) => key, // Return the key for testing
  }),
}));

describe('SupportTicketForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the support ticket form', () => {
    render(
      <SupportTicketForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />
    );
    
    // Check form elements are present
    expect(screen.getByLabelText(/Subject/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByText(/Priority/)).toBeInTheDocument();
    
    // Check priority options
    expect(screen.getByText('low')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Submit Ticket')).toBeInTheDocument();
  });
  
  it('calls onCancel when cancel button is clicked', () => {
    render(
      <SupportTicketForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
  
  it('shows validation errors when form is submitted with empty fields', async () => {
    render(
      <SupportTicketForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />
    );
    
    // Submit form without filling in required fields
    fireEvent.click(screen.getByText('Submit Ticket'));
    
    // Check validation errors
    await waitFor(() => {
      expect(screen.getByText('Subject is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
    
    // onSubmit should not be called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it('shows validation error when description is too short', async () => {
    render(
      <SupportTicketForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />
    );
    
    // Fill in subject but with short description
    fireEvent.change(screen.getByLabelText(/Subject/), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText(/Description/), { target: { value: 'Too short' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Submit Ticket'));
    
    // Check validation error for description
    await waitFor(() => {
      expect(screen.getByText('Description must be at least 20 characters')).toBeInTheDocument();
    });
    
    // onSubmit should not be called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it('submits the form when all fields are valid', async () => {
    render(
      <SupportTicketForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />
    );
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/Subject/), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText(/Description/), { 
      target: { value: 'This is a detailed description of the issue I am experiencing.' } 
    });
    
    // Select category
    fireEvent.change(screen.getByLabelText(/Category/), { target: { value: 'Technical Issue' } });
    
    // Select priority
    fireEvent.click(screen.getByText('high'));
    
    // Submit form
    fireEvent.click(screen.getByText('Submit Ticket'));
    
    // Check onSubmit is called with correct values
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith(
      'Test Subject',
      'This is a detailed description of the issue I am experiencing.',
      'Technical Issue',
      'high'
    );
  });
  
  it('disables form elements when isLoading is true', () => {
    render(
      <SupportTicketForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );
    
    // Check form elements are disabled
    expect(screen.getByLabelText(/Subject/)).toBeDisabled();
    expect(screen.getByLabelText(/Category/)).toBeDisabled();
    expect(screen.getByLabelText(/Description/)).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
    
    // Submit button should show loading state
    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });
  
  it('allows adding and removing file attachments', async () => {
    render(
      <SupportTicketForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
      />
    );
    
    // Mock file upload
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('Upload files');
    
    Object.defineProperty(input, 'files', {
      value: [file]
    });
    
    fireEvent.change(input);
    
    // Wait for attachment to appear
    await waitFor(() => {
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });
    
    // Remove attachment
    fireEvent.click(screen.getByTestId('x-mark-icon'));
    
    // Check attachment is removed
    await waitFor(() => {
      expect(screen.queryByText('test.png')).not.toBeInTheDocument();
    });
  });
});
