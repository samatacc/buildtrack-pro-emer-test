/**
 * Responsive Testing Utilities
 * 
 * Helper functions for testing responsive behavior of BuildTrack Pro's
 * reporting components across different viewport sizes and device types.
 */

import { render, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';

// Common device viewport sizes for testing
export const deviceViewports = {
  // Mobile devices
  mobileSmall: { width: 320, height: 568 }, // iPhone SE
  mobileMedium: { width: 375, height: 667 }, // iPhone 8
  mobileLarge: { width: 414, height: 896 }, // iPhone 11 Pro Max
  
  // Tablets
  tabletPortrait: { width: 768, height: 1024 }, // iPad Mini/Air in portrait
  tabletLandscape: { width: 1024, height: 768 }, // iPad Mini/Air in landscape
  
  // Desktops
  laptopSmall: { width: 1280, height: 720 }, // Small laptop
  laptopLarge: { width: 1440, height: 900 }, // Large laptop
  desktop: { width: 1920, height: 1080 }, // Desktop monitor
};

// Device types for testing
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Sets the viewport size for testing responsive behavior
 * 
 * @param width Viewport width in pixels
 * @param height Viewport height in pixels 
 */
export function setViewportSize(width: number, height: number): void {
  // Set mock viewport size for testing
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
  
  // Trigger a window resize event
  window.dispatchEvent(new Event('resize'));
}

/**
 * Renders a component at specified viewport size
 * 
 * @param component The React component to render
 * @param viewport The viewport size to use
 * @returns The render result
 */
export function renderAtViewport(
  component: ReactElement,
  viewport: { width: number; height: number }
): RenderResult {
  // Set viewport size
  setViewportSize(viewport.width, viewport.height);
  
  // Render the component
  return render(component);
}

/**
 * Tests if a component renders appropriately across different device viewports
 * 
 * @param component The React component to test
 * @param testCallback Function to execute after rendering at each viewport
 */
export function testAcrossViewports(
  component: ReactElement,
  testCallback: (result: RenderResult, viewport: { width: number; height: number }) => void
): void {
  // Test at each defined viewport size
  Object.entries(deviceViewports).forEach(([deviceName, viewport]) => {
    describe(`Viewport: ${deviceName} (${viewport.width}x${viewport.height})`, () => {
      let renderResult: RenderResult;
      
      beforeEach(() => {
        // Render component at this viewport
        renderResult = renderAtViewport(component, viewport);
      });
      
      test(`renders correctly at ${deviceName} viewport`, () => {
        // Execute test callback with render result and viewport info
        testCallback(renderResult, viewport);
      });
      
      afterEach(() => {
        // Clean up
        renderResult.unmount();
      });
    });
  });
}

/**
 * Checks if an element is visible in the current viewport
 * 
 * @param element DOM element to check
 * @returns boolean indicating visibility
 */
export function isElementVisible(element: Element): boolean {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  
  // Check if element is in viewport
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

/**
 * Checks if the current viewport matches a specific device type
 * 
 * @param deviceType The device type to check against
 * @returns boolean indicating if viewport matches device type
 */
export function isDeviceType(deviceType: DeviceType): boolean {
  const width = window.innerWidth;
  
  switch (deviceType) {
    case 'mobile':
      return width < 768;
    case 'tablet':
      return width >= 768 && width < 1280;
    case 'desktop':
      return width >= 1280;
    default:
      return false;
  }
}

/**
 * Gets current device type based on viewport width
 * 
 * @returns The current device type
 */
export function getCurrentDeviceType(): DeviceType {
  if (isDeviceType('mobile')) return 'mobile';
  if (isDeviceType('tablet')) return 'tablet';
  return 'desktop';
}
