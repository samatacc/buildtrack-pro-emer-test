import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MockImage } from '../../../app/components/ui/MockImage';
// No need to import generateMockImage as we're mocking fetch directly

// No need to mock generateMockImage as we're testing the component directly

describe('MockImage Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Mock successful API response
    fetchMock.mockResponseOnce(JSON.stringify({ 
      success: true, 
      url: '/generated-images/project/test-image.png',
      reused: false
    }));
  });

  it('renders with default props', async () => {
    render(<MockImage category="project" alt="Test image" width={400} height={200} priority={undefined} />);
    
    // Should show loading state initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // After loading, the image should be rendered
    await waitFor(() => {
      const img = screen.getByAltText('project Test image');
      expect(img).toBeInTheDocument();
    });
  });

  it('displays "Saved" badge when image is reused', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ 
      success: true, 
      url: '/generated-images/project/reused-image.png',
      reused: true
    }));

    render(<MockImage category="project" alt="Reused image" width={400} height={200} priority={undefined} />);
    
    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
  });

  it('handles regeneration button click', async () => {
    render(<MockImage category="project" alt="Test image" width={400} height={200} priority={undefined} />);
    
    await waitFor(() => {
      const img = screen.getByAltText('project Test image');
      expect(img).toBeInTheDocument();
    });

    // Mock another successful response for regeneration
    fetchMock.mockResponseOnce(JSON.stringify({ 
      success: true, 
      url: '/generated-images/project/regenerated-image.png',
      reused: false
    }));

    // Find and click the regenerate button
    const regenerateButton = screen.getByText('Regenerate');
    fireEvent.click(regenerateButton);
    
    // After regeneration completes, the new image should be shown
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('forceNew=true'));
    });
  });

  it('handles API errors gracefully', async () => {
    // Clear previous mock response and add an error response
    fetchMock.mockReset();
    fetchMock.mockResponseOnce(JSON.stringify({ 
      success: false, 
      error: 'API Error'
    }));

    render(<MockImage category="project" alt="Error image" width={400} height={200} priority={undefined} />);
    
    // Should still render but use the fallback image
    await waitFor(() => {
      const img = screen.getByAltText('project Error image');
      expect(img).toBeInTheDocument();
      // We don't directly test for the fallback image source since Image component is mocked
    });
  });

  it('uses the correct image variant in API request', async () => {
    render(<MockImage category="project" variant="blueprint" alt="Blueprint image" width={400} height={200} priority={undefined} />);
    
    await waitFor(() => {
      const img = screen.getByAltText('project blueprint Blueprint image');
      expect(img).toBeInTheDocument();
    });

    // Check that the API was called with the correct variant
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('variant=blueprint'));
  });
});
