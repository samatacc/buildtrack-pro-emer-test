/**
 * MockImage Component Test
 * Tests the functionality of the image generation in the MockImage component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockImage } from '../../../app/components/ui/MockImage';

// Mock fetch responses (no need to import jest-fetch-mock in the test file)
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      success: true,
      url: '/generated-images/project/test-image.png',
      reused: false
    })
  })
) as jest.Mock;

describe('MockImage Component Basic Test', () => {
  it('renders correctly with project category', () => {
    render(
      <MockImage 
        category="project" 
        alt="Project Image" 
        width={400} 
        height={200} 
        priority={undefined} 
      />
    );
    
    // The component should render without errors
    expect(screen.getByText('Regenerate')).toBeInTheDocument();
  });
});
