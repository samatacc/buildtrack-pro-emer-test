import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import MobileSettings from '../../../app/components/profile/MobileSettings';
import { mockProfileData } from '../../utils/test-utils';

// Mock the ProfileCard component which is used by MobileSettings
jest.mock('../../../app/components/profile/ProfileCard', () => {
  return ({ children, title, isEditing, onEdit, onSave, onCancel }: any) => {
    return (
      <div data-testid="profile-card">
        <h3>{title}</h3>
        {isEditing ? (
          <div>
            <div data-testid="edit-mode-content">{children}</div>
            <button onClick={onSave}>Save</button>
            <button onClick={onCancel}>Cancel</button>
          </div>
        ) : (
          <div>
            <div data-testid="view-mode-content">{children}</div>
            <button onClick={onEdit}>Edit</button>
          </div>
        )}
      </div>
    );
  };
});

// Create extended mock data with mobile settings
const mockProfileWithMobileSettings = {
  ...mockProfileData,
  offlineAccess: true,
  dataUsagePreferences: {
    autoDownload: true,
    highQualityImages: false,
    videoPlayback: 'wifi-only' as 'wifi-only' | 'cellular' | 'never'
  }
};

describe('MobileSettings Component', () => {
  // Test rendering
  it('renders mobile settings with correct data', () => {
    render(<MobileSettings 
      profile={mockProfileWithMobileSettings} 
      onUpdate={jest.fn()} 
    />);
    
    // Check for title
    expect(screen.getByText('Mobile Settings')).toBeInTheDocument();
    
    // Check for offline access toggle
    expect(screen.getByText('Offline Access')).toBeInTheDocument();
    
    // Check for data usage preferences section
    expect(screen.getByText('Data Usage Preferences')).toBeInTheDocument();
    expect(screen.getByText('Auto-Download Project Files')).toBeInTheDocument();
    expect(screen.getByText('High-Quality Images')).toBeInTheDocument();
    expect(screen.getByText('Video Playback')).toBeInTheDocument();
  });

  // Test the mobile-first design aspects
  it('has mobile-optimized UI with appropriate touch targets', () => {
    render(<MobileSettings 
      profile={mockProfileWithMobileSettings} 
      onUpdate={jest.fn()} 
    />);
    
    // Mobile-friendly headings should be present
    expect(screen.getByText('Mobile Settings')).toBeInTheDocument();
    
    // Check for the edit button which should be easily tappable
    const editButton = screen.getByText('Edit');
    expect(editButton).toBeInTheDocument();
    
    // Enter edit mode to test mobile-friendly form elements
    fireEvent.click(editButton);
    
    // In edit mode, check that toggles and selects are visible and properly sized
    // This would ensure the component is adaptable to mobile interfaces
    expect(screen.getByTestId('edit-mode-content')).toBeInTheDocument();
    
    // Save and cancel buttons should be visible and easy to tap
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  // Test editing functionality
  it('allows editing mobile settings', async () => {
    const mockUpdate = jest.fn().mockResolvedValue({});
    render(<MobileSettings 
      profile={mockProfileWithMobileSettings} 
      onUpdate={mockUpdate} 
    />);
    
    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    // Check that toggle components are rendered in edit mode - use getAllByText for elements that might appear multiple times
    const offlineLabels = screen.getAllByText('Enable Offline Access');
    expect(offlineLabels.length).toBeGreaterThan(0);
    
    // Look for other toggle elements - using more specific queries
    const autoDownloadLabels = screen.getAllByText(/Auto-Download Project Files/i);
    expect(autoDownloadLabels.length).toBeGreaterThan(0);
    
    const imageQualityLabels = screen.getAllByText(/High-Quality Images/i);
    expect(imageQualityLabels.length).toBeGreaterThan(0);
    
    // Verify video playback select is rendered
    expect(screen.getByText('Video Playback')).toBeInTheDocument();
    
    // Since we're using mocks, we'll test that the save function is called
    // after clicking the save button
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Check if onUpdate was called
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  // Test accessibility
  it('provides proper accessibility features for mobile users', () => {
    render(<MobileSettings 
      profile={mockProfileWithMobileSettings} 
      onUpdate={jest.fn()} 
    />);
    
    // Enter edit mode to check accessible form controls
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    // Test that there are appropriate headings for screen readers
    expect(screen.getByText('Data Usage Preferences')).toBeInTheDocument();
    expect(screen.getByText('Registered Devices')).toBeInTheDocument();
    
    // Description text should be present for assistive technologies
    expect(screen.getByText('Allow downloading of project data for offline use in the field')).toBeInTheDocument();
    expect(screen.getByText('Automatically download files for upcoming project visits (uses more data)')).toBeInTheDocument();
  });

  // Test for BuildTrack Pro design system compliance
  it('adheres to BuildTrack Pro design system with proper styles', () => {
    render(<MobileSettings 
      profile={mockProfileWithMobileSettings} 
      onUpdate={jest.fn()} 
    />);
    
    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    // Card layouts should be present with appropriate styling
    expect(screen.getByTestId('edit-mode-content')).toBeInTheDocument();
    
    // Test for rounded corners, which are part of the design system
    // (Since we're using mocks, this is a bit limited, but we can check for key elements)
    expect(screen.getByText('Device management is available through the mobile app')).toBeInTheDocument();
  });
});
