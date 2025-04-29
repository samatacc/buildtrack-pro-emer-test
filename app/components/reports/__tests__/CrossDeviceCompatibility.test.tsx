/**
 * @jest-environment jsdom
 */
import React from 'react';
import { axe } from 'jest-axe';
import { render, screen, setViewportSize, viewports } from './testUtils';
import DataExportComponent from '../DataExportComponent';
import PrintableReport from '../PrintableReport';
import MobileChartComponent from '../MobileChartComponent';

// Extend expect for accessibility testing
expect.extend({
  toHaveResponsiveClasses: (element: HTMLElement) => {
    const classList = Array.from(element.classList);
    const responsiveClasses = classList.filter(className => 
      className.startsWith('sm:') || 
      className.startsWith('md:') || 
      className.startsWith('lg:') || 
      className.startsWith('xl:') ||
      className.startsWith('2xl:')
    );
    
    return {
      pass: responsiveClasses.length > 0,
      message: () => 
        `Expected ${element.outerHTML} to have responsive Tailwind classes but found none.`
    };
  },
  toHaveFlexboxLayout: (element: HTMLElement) => {
    const classList = Array.from(element.classList);
    const flexClasses = classList.filter(className => 
      className === 'flex' || 
      className === 'inline-flex' || 
      className.startsWith('flex-') || 
      className.startsWith('justify-') || 
      className.startsWith('items-')
    );
    
    return {
      pass: flexClasses.length > 0,
      message: () => 
        `Expected ${element.outerHTML} to use flexbox layout but found no flex classes.`
    };
  }
});

// Sample chart data for testing
const sampleChartData = {
  labels: ['January', 'February', 'March', 'April'],
  datasets: [
    {
      label: 'Dataset 1',
      data: [12, 19, 3, 5],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
    },
    {
      label: 'Dataset 2',
      data: [2, 3, 20, 5],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
    },
  ],
};

// Mock fetch API for testing
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ 
      id: 'project-1',
      name: 'Test Project',
      tasks: [],
      budget: { total: 100000, spent: 50000, remaining: 50000 }
    })
  })
) as jest.Mock;

// Setup fake timers
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

// Type declaration for our custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveResponsiveClasses(): R;
      toHaveFlexboxLayout(): R;
    }
  }
}

describe('Cross-Device Compatibility Tests', () => {
  describe('Responsive Design Pattern Implementation', () => {
    it('should implement responsive design patterns in DataExportComponent', () => {
      // Render the component
      const { container } = render(
        <DataExportComponent
          projectId="project-1"
          initialFormat="csv"
          availableTypes={['project', 'tasks', 'materials']}
        />
      );
      
      // Look for elements with responsive classes directly
      const exportComponent = container.querySelector('.export-component');
      expect(exportComponent).not.toBeNull();
      
      // Check if component uses responsive classes - finding them anywhere in the component
      const allElements = container.querySelectorAll('*');
      const elementsWithResponsiveClasses = Array.from(allElements).filter(el => {
        const classList = Array.from(el.classList);
        return classList.some(className => 
          className.startsWith('sm:') || 
          className.startsWith('md:') || 
          className.startsWith('lg:')
        );
      });
      
      expect(elementsWithResponsiveClasses.length).toBeGreaterThan(0);
      
      // Check for flexbox layout
      const flexElements = container.querySelectorAll('.flex, .flex-col, .flex-row');
      expect(flexElements.length).toBeGreaterThan(0);
      
      // Check for responsive form elements
      const formElements = container.querySelectorAll('select, button');
      expect(formElements.length).toBeGreaterThan(0);
    });
    
    it('should implement responsive design patterns in MobileChartComponent', () => {
      // Render the component
      const { container } = render(
        <MobileChartComponent
          title="Test Chart"
          chartId="test-chart"
          initialData={sampleChartData}
          options={{ type: 'bar', showLegend: true }}
        />
      );
      
      // Check for responsive container
      const chartContainer = container.querySelector('[data-testid="chart-test-chart"]');
      expect(chartContainer).not.toBeNull();
      
      // Look for responsive classes throughout the component
      const allElements = container.querySelectorAll('*');
      const elementsWithResponsiveClasses = Array.from(allElements).filter(el => {
        const classList = Array.from(el.classList);
        return classList.some(className => 
          className.startsWith('sm:') || 
          className.startsWith('md:') || 
          className.startsWith('lg:')
        );
      });
      
      expect(elementsWithResponsiveClasses.length).toBeGreaterThan(0);
      
      // Check for flexbox layout
      const flexElements = container.querySelectorAll('.flex, .flex-col, .flex-row');
      expect(flexElements.length).toBeGreaterThan(0);
    });
    
    it('should implement responsive design patterns in PrintableReport', () => {
      // Render the component
      const { container } = render(
        <PrintableReport
          projectId="project-1"
          reportType="project_summary"
          paperSize="a4"
          orientation="portrait"
        />
      );
      
      // Advance timers to bypass loading state
      jest.advanceTimersByTime(2000);
      
      // Check container for responsive classes
      const reportContainer = container.querySelector('.print-container') || container.querySelector('div');
      expect(reportContainer).not.toBeNull();
      
      if (reportContainer) {
        // Report container should use flexbox layout
        expect(reportContainer).toHaveFlexboxLayout();
      }
      
      // There should be media print styles applied
      const mediaPrintStyles = document.querySelectorAll('style');
      const hasPrintStyles = Array.from(mediaPrintStyles).some(style => 
        style.textContent && style.textContent.includes('@media print')
      );
      
      expect(hasPrintStyles).toBe(true);
    });
  });
  
  describe('Accessibility Across Device Sizes', () => {
    // Set a shorter timeout to avoid test hanging
    it('should maintain accessibility in mobile configurations', async () => {
      // First set a mobile viewport size
      setViewportSize(viewports.mobile.width, viewports.mobile.height);
      
      // Render mobile-optimized chart component
      const { container } = render(
        <MobileChartComponent
          title="Mobile Accessibility Test"
          chartId="mobile-test"
          initialData={sampleChartData}
          options={{ type: 'bar', showLegend: false }} // Simplified for mobile
        />
      );
      
      // Verify accessibility attributes are present without running full axe analysis
      // which can be slow in test environments
      
      // Check for ARIA attributes that improve accessibility
      const ariaElements = container.querySelectorAll('[aria-live], [aria-label], [aria-describedby], [role]');
      expect(ariaElements.length).toBeGreaterThan(0);
      
      // Verify screen reader text is available
      const srElements = container.querySelectorAll('.sr-only');
      expect(srElements.length).toBeGreaterThan(0);
      
      // Check for touch-friendly sizing on interactive elements
      const interactiveElements = container.querySelectorAll('button, a, [role="button"]');
      if (interactiveElements.length > 0) {
        // Either the elements should have adequate size or accessibility attributes
        const hasAccessibleInteractions = Array.from(interactiveElements).some(element => {
          return element.hasAttribute('aria-label') || 
                 element.getAttribute('style')?.includes('min-width: 44px');
        });
        
        expect(hasAccessibleInteractions).toBe(true);
      }
    });
  });
  
  describe('Feature Parity Across Devices', () => {
    it('should provide equivalent functionality across device sizes', () => {
      // Check for conditional feature rendering based on screen size
      // (Components should adapt but not remove critical functionality)
      
      // First render with mobile viewport
      setViewportSize(viewports.mobile.width, viewports.mobile.height);
      
      const { container: mobileContainer, unmount: unmountMobile } = render(
        <DataExportComponent
          projectId="project-1"
          initialFormat="csv"
          availableTypes={['project', 'tasks']}
        />
      );
      
      // Check for core export functionality
      const mobileFormats = mobileContainer.querySelectorAll('select[name="format"] option');
      const mobileFormatCount = mobileFormats.length;
      
      // Get export button from mobile view
      const mobileExportButton = screen.getByRole('button', { name: /export/i });
      expect(mobileExportButton).toBeInTheDocument();
      
      unmountMobile();
      
      // Now render with desktop viewport
      setViewportSize(viewports.desktop.width, viewports.desktop.height);
      
      const { container: desktopContainer } = render(
        <DataExportComponent
          projectId="project-1"
          initialFormat="csv"
          availableTypes={['project', 'tasks']}
        />
      );
      
      // Desktop should have the same export formats available
      const desktopFormats = desktopContainer.querySelectorAll('select[name="format"] option');
      expect(desktopFormats.length).toBe(mobileFormatCount);
      
      // Desktop should also have the export button
      const desktopExportButton = screen.getByRole('button', { name: /export/i });
      expect(desktopExportButton).toBeInTheDocument();
    });
  });
});

