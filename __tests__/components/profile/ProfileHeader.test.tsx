import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import ProfileHeader from '../../../app/components/profile/ProfileHeader';
import { mockProfileData } from '../../utils/test-utils';

describe('ProfileHeader Component', () => {
  // Test rendering
  it('renders the profile header with user information', () => {
    render(<ProfileHeader profile={mockProfileData} />);
    
    // Check for name in heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Test User');
    
    // Check for job title and department
    const jobSection = screen.getByText(/Project Manager.*Construction/i, { collapseWhitespace: false });
    expect(jobSection).toBeInTheDocument();
    
    // Check for user email - critical for mobile access
    expect(screen.getByText('test@buildtrackpro.com')).toBeInTheDocument();
  });

  // Test edit mode with emphasis on mobile-friendly interaction
  it('enters edit mode when edit button is clicked', () => {
    // Only render the edit button when onProfileUpdate is provided
    render(<ProfileHeader profile={mockProfileData} onProfileUpdate={jest.fn()} />);
    
    // Find the Edit Profile button
    const editButton = screen.getByText('Edit Profile');
    expect(editButton).toBeInTheDocument();
    
    // Click the Edit Profile button to enter edit mode
    fireEvent.click(editButton);
    
    // After clicking, we should have form inputs visible for editing
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
    
    // Should also have Cancel and Save buttons
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  // Test updating profile with focus on mobile interaction patterns
  it('calls onProfileUpdate when save is clicked', async () => {
    const mockUpdate = jest.fn();
    render(<ProfileHeader profile={mockProfileData} onProfileUpdate={mockUpdate} />);
    
    // Find the Edit Profile button
    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);
    
    // Find all input fields
    const inputs = screen.getAllByRole('textbox');
    
    // Update the first two inputs (firstName and lastName)
    fireEvent.change(inputs[0], { target: { value: 'NewFirst' } });
    fireEvent.change(inputs[1], { target: { value: 'NewLast' } });
    
    // Click the Save button
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Verify the onProfileUpdate callback was called with the correct data
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'NewFirst',
        lastName: 'NewLast'
      }));
    });
  });

  // Test mobile responsiveness 
  it('has mobile-friendly layout with appropriate text sizes', () => {
    // Include onProfileUpdate to ensure the Edit button renders
    render(<ProfileHeader profile={mockProfileData} onProfileUpdate={jest.fn()} />);
    
    // Check for profile information in a heading with appropriate size for mobile viewing
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(mockProfileData.firstName);
    expect(heading).toHaveTextContent(mockProfileData.lastName);
    
    // Check for job title display with appropriate styling
    const jobSection = screen.getByText(/Project Manager.*Construction/i, { collapseWhitespace: false });
    expect(jobSection).toBeInTheDocument();
    
    // Check for the edit button which should be easy to tap on mobile
    const editButton = screen.getByText('Edit Profile');
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass('rounded-lg'); // Check for rounded corners for touch-friendly UI
  });

  // Test accessibility with focus on mobile-first approach
  it('has appropriate structure for accessibility', () => {
    // Include onProfileUpdate to ensure the Edit button renders
    render(<ProfileHeader profile={mockProfileData} onProfileUpdate={jest.fn()} />);
    
    // Test for proper heading structure - crucial for screen readers
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(`${mockProfileData.firstName} ${mockProfileData.lastName}`);
    
    // Check for semantic button for editing
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    expect(editButton).toBeInTheDocument();
    
    // Click the edit button to test edit form accessibility
    fireEvent.click(editButton);
    
    // Verify form inputs and buttons have proper roles for accessibility
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
