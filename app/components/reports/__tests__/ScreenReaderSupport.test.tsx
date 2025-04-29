/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, act } from './test-utils';
import DataExportComponent from '../DataExportComponent';
import PrintableReport from '../PrintableReport';
import MobileChartComponent from '../MobileChartComponent';

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

describe('Screen Reader Support for Reporting Components', () => {
  describe('DataExportComponent Screen Reader Support', () => {
    beforeEach(() => {
      render(
        <DataExportComponent 
          projectId="demo-project"
          initialFormat="csv"
          availableTypes={['project', 'tasks', 'materials']}
        />
      );
    });

    test('should have accessible form controls with proper labels', () => {
      // Find and check labels for form elements
      const formatSelect = screen.getByLabelText(/export format/i);
      expect(formatSelect).toBeInTheDocument();

      const typeSelect = screen.getByLabelText(/export type/i);
      expect(typeSelect).toBeInTheDocument();

      // Ensure button has accessible text
      const exportButton = screen.getByRole('button');
      expect(exportButton).toBeInTheDocument();
      expect(exportButton.textContent).toContain('Export Data');
    });

    test('should have keyboard focus indicators', () => {
      // Check that the form fields are focusable
      const formatSelect = screen.getByLabelText(/export format/i);
      formatSelect.focus();
      expect(document.activeElement).toBe(formatSelect);
      
      const typeSelect = screen.getByLabelText(/export type/i);
      typeSelect.focus();
      expect(document.activeElement).toBe(typeSelect);
    });
  });

  describe('PrintableReport Screen Reader Support', () => {
    beforeEach(() => {
      render(
        <PrintableReport 
          projectId="demo-project"
          reportType="project_summary"
          paperSize="a4"
          orientation="portrait"
        />
      );
    });

    test('should have structured headings with proper hierarchy', async () => {
      // The heading structure should follow a proper hierarchy (h1 > h2 > h3 etc.)
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading.textContent).toContain('Project Summary Report');

      const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });
    
    test('should have content clearly labeled for screen readers', () => {
      // Check that visual elements like charts have proper ARIA labels
      const timelineChart = screen.getByRole('img', { name: /project timeline/i });
      expect(timelineChart).toBeInTheDocument();
      expect(timelineChart).toHaveAttribute('aria-label', 'Project Timeline');
      
      // Project information should be readable
      const projectInfo = screen.getByText(/Project: demo-project/i);
      expect(projectInfo).toBeInTheDocument();
    });
    
    test('should have accessible controls for printing and exporting', () => {
      // Check that print and export buttons have accessible labels
      const printButton = screen.getByLabelText(/print report/i);
      expect(printButton).toBeInTheDocument();
      
      const exportButton = screen.getByLabelText(/export as pdf/i);
      expect(exportButton).toBeInTheDocument();
      
      // Ensure buttons are properly focusable
      printButton.focus();
      expect(document.activeElement).toBe(printButton);
      
      exportButton.focus();
      expect(document.activeElement).toBe(exportButton);
    });
  });
  
  describe('MobileChartComponent Screen Reader Support', () => {
    beforeEach(() => {
      render(
        <MobileChartComponent
          title="Quarterly Sales"
          chartId="quarterly-sales"
          initialData={sampleChartData}
          options={{ type: 'bar', showLegend: true }}
        />
      );
    });
    
    test('should have proper ARIA roles for chart visualization', () => {
      // Chart container should have a role of figure
      const chart = screen.getByTestId('chart-quarterly-sales');
      expect(chart).toHaveAttribute('role', 'figure');
      expect(chart).toHaveAttribute('aria-labelledby');
      
      // Verify that the ID in aria-labelledby points to an actual element
      const labelId = chart.getAttribute('aria-labelledby');
      const labelElement = document.getElementById(labelId || '');
      expect(labelElement).not.toBeNull();
      expect(labelElement).toHaveTextContent('Quarterly Sales');
    });
    
    test('should provide text descriptions of data trends', () => {
      // Chart should have a text description for screen readers
      const trendDescription = screen.getByRole('region', { name: /trend description/i });
      expect(trendDescription).toBeInTheDocument();
      
      // Description should mention key trends like highest/lowest values
      const descriptionText = trendDescription.textContent?.toLowerCase() || '';
      expect(descriptionText).toContain('highest');
      expect(descriptionText).toContain('lowest');
    });
  });
});
