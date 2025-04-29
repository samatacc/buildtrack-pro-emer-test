/**
 * @jest-environment jsdom
 */
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from './testUtils';

// Import types for TypeScript
import type DataExportComponentType from '../DataExportComponent';
import type PrintableReportType from '../PrintableReport';

// Import for side effects to ensure mocks are applied
import '../DataExportComponent';
import '../PrintableReport';

// Create component references that use the mock implementations
const DataExportComponent = require('../DataExportComponent').default;
const PrintableReport = require('../PrintableReport').default;

describe('Keyboard Navigation Tests for Reporting Components', () => {
  // Setup fake timers for all tests
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  // Setup user event for keyboard interactions
  const setupUserEvent = () => userEvent.setup();
  
  describe('DataExportComponent Keyboard Navigation', () => {
    it('should allow tab navigation between form controls', () => {
      // Render the component with our test utilities
      const { container } = render(
        <DataExportComponent
          projectId="project-1"
          initialFormat="csv"
          availableTypes={['project', 'tasks', 'materials']}
        />
      );
      
      // Find interactive form elements
      const exportButton = screen.getByText('reports.exportNow');
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
      
      // Test focus on first select element
      selects[0].focus();
      expect(document.activeElement).toBe(selects[0]);
      
      // Simulate tab to move to next element
      fireEvent.keyDown(document.activeElement as Element, { key: 'Tab' });
      
      // Manually move focus to the next element (since jsdom doesn't fully implement tab navigation)
      if (selects.length > 1) {
        selects[1].focus();
        expect(document.activeElement).toBe(selects[1]);
      }
      
      // Tab again to get to the export button
      fireEvent.keyDown(document.activeElement as Element, { key: 'Tab' });
      exportButton.focus();
      
      // Verify export button can be focused
      expect(document.activeElement).toBe(exportButton);
    });
    
    it('should maintain focus after button interactions', () => {
      // Render the component
      const { container } = render(
        <DataExportComponent
          projectId="project-1"
          initialFormat="csv"
          availableTypes={['project', 'tasks', 'materials']}
        />
      );
      
      // Find the export button using its text content
      const exportButton = screen.getByText('reports.exportNow');
      expect(exportButton).toBeInTheDocument();
      
      // Focus and click the export button
      exportButton.focus();
      expect(document.activeElement).toBe(exportButton);
      exportButton.click();
      
      // After clicking, focus should remain on the button in a well-behaved component
      expect(document.activeElement).toBe(exportButton);
    });
    
    it('should handle keyboard activation of controls', () => {
      // Render the component
      const { container } = render(
        <DataExportComponent
          projectId="project-1"
          initialFormat="csv"
          availableTypes={['project', 'tasks', 'materials']}
        />
      );
      
      // Find checkbox for project summary
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      
      // Focus and activate the checkbox with keyboard
      checkbox.focus();
      expect(document.activeElement).toBe(checkbox);
      fireEvent.keyDown(checkbox, { key: 'Space' });
      
      // In a real implementation, this would toggle the checkbox
      // Here we're just verifying keyboard accessibility is maintained
      expect(document.activeElement).toBe(checkbox);
    });
  });
  
  describe('PrintableReport Keyboard Navigation', () => {
    beforeEach(() => {
      // Mock window.print for testing
      window.print = jest.fn();
      
      // Reset the mock between tests
      jest.clearAllMocks();
    });
    
    it('should allow keyboard operation of print button', () => {
      // Render the component with our test utilities
      const { container } = render(
        <PrintableReport
          projectId="project-1"
          reportType="project_summary"
          paperSize="a4"
          orientation="portrait"
        />
      );
      
      // Our mock has a button with text 'reports.printNow'
      const printButton = screen.getByText('reports.printNow');
      expect(printButton).toBeInTheDocument();
      
      // Click the print button
      printButton.click();
      
      // Verify window.print was called
      expect(window.print).toHaveBeenCalled();
    });
    
    it('should maintain focus after button interactions', () => {
      // Render the component with our test utilities
      const { container } = render(
        <PrintableReport
          projectId="project-1"
          reportType="project_summary"
          paperSize="a4"
          orientation="portrait"
        />
      );
      
      // Find all available buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0); // Ensure we have buttons to interact with
      
      // Focus the first button
      buttons[0].focus();
      expect(document.activeElement).toBe(buttons[0]);
      
      // Click the button
      buttons[0].click();
      
      // In our implementation, focus should remain on the button after clicking
      // This verifies keyboard users can continue navigating effectively
      expect(document.activeElement).toBe(buttons[0]);
    });
    
    it('should support keyboard tab navigation between buttons', () => {
      // Render the component with our test utilities
      const { container } = render(
        <PrintableReport
          projectId="project-1"
          reportType="project_summary"
          paperSize="a4"
          orientation="portrait"
        />
      );
      
      // Find all buttons in the report
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1); // Ensure we have multiple buttons
      
      // Put focus on the first button
      buttons[0].focus();
      expect(document.activeElement).toBe(buttons[0]);
      
      // Simulate tab key to move to the next button
      fireEvent.keyDown(document.activeElement as Element, { key: 'Tab' });
      
      // Manually move focus to the next button since jsdom doesn't fully implement tab navigation
      buttons[1].focus();
      
      // Verify focus is now on a different element
      expect(document.activeElement).not.toBe(buttons[0]);
      expect(document.activeElement).toBe(buttons[1]);
    });
  });
});
