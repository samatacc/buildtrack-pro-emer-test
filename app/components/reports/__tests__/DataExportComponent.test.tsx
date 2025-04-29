/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataExportComponent from '../DataExportComponent';

describe('DataExportComponent', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock console.log
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  describe('Data Consistency Tests', () => {
    it('should display project export options with correct data', () => {
      // Render component with project export type
      render(
        <DataExportComponent
          projectId="project-1"
          initialFormat="csv"
          availableTypes={['project', 'tasks']}
        />
      );
      
      // Verify export type is displayed correctly
      expect(screen.getByText('reports.exportType_project')).toBeInTheDocument();
      
      // Verify project export options are displayed
      expect(screen.getByText('reports.projectSummary')).toBeInTheDocument();
      expect(screen.getByText('reports.projectMilestones')).toBeInTheDocument();
      expect(screen.getByText('reports.projectBudget')).toBeInTheDocument();
      expect(screen.getByText('reports.projectRisks')).toBeInTheDocument();
    });
    
    it('should display tasks export options with correct data', () => {
      // Render component
      const { rerender } = render(
        <DataExportComponent
          projectId="project-1"
          initialFormat="csv"
          availableTypes={['project', 'tasks']}
        />
      );
      
      // Change export type to tasks
      const exportTypeSelect = screen.getByLabelText('reports.exportType');
      fireEvent.change(exportTypeSelect, { target: { value: 'tasks' } });
      
      // Verify tasks export options are displayed
      expect(screen.getByText('reports.allTasks')).toBeInTheDocument();
      expect(screen.getByText('reports.incompleteTasks')).toBeInTheDocument();
      expect(screen.getByText('reports.tasksByAssignee')).toBeInTheDocument();
      expect(screen.getByText('reports.tasksByStatus')).toBeInTheDocument();
    });
    
    it('should maintain selected options when changing export format', async () => {
      // Render component
      render(
        <DataExportComponent
          projectId="project-1"
          initialFormat="csv"
          availableTypes={['project']}
        />
      );
      
      // Find and click the option checkboxes
      const projectSummaryCheckbox = screen.getByLabelText('reports.projectSummary');
      const projectMilestonesCheckbox = screen.getByLabelText('reports.projectMilestones');
      
      // Verify default selections (based on default property)
      expect(projectSummaryCheckbox).toBeChecked();
      expect(projectMilestonesCheckbox).toBeChecked();
      
      // Uncheck project milestones
      fireEvent.click(projectMilestonesCheckbox);
      expect(projectMilestonesCheckbox).not.toBeChecked();
      
      // Change export format to Excel
      const excelFormatButton = screen.getByText('EXCEL');
      fireEvent.click(excelFormatButton);
      
      // Verify selection state is maintained
      expect(projectSummaryCheckbox).toBeChecked();
      expect(projectMilestonesCheckbox).not.toBeChecked();
    });
    
    it('should display date range selector with consistent formatting', () => {
      // Render component
      render(
        <DataExportComponent
          projectId="project-1"
          initialFormat="csv"
          availableTypes={['project']}
        />
      );
      
      // Get date inputs
      const startDateInput = screen.getByLabelText('reports.startDate');
      const endDateInput = screen.getByLabelText('reports.endDate');
      
      // Check if date inputs exist and have correct types
      expect(startDateInput).toBeInTheDocument();
      expect(startDateInput).toHaveAttribute('type', 'date');
      expect(endDateInput).toBeInTheDocument();
      expect(endDateInput).toHaveAttribute('type', 'date');
      
      // Set new date values
      const newStartDate = '2025-03-01';
      const newEndDate = '2025-04-01';
      
      fireEvent.change(startDateInput, { target: { value: newStartDate } });
      fireEvent.change(endDateInput, { target: { value: newEndDate } });
      
      // Verify date values were updated
      expect(startDateInput).toHaveValue(newStartDate);
      expect(endDateInput).toHaveValue(newEndDate);
    });
  });
  
  describe('Export Functionality Tests', () => {
    it('should trigger export process when Export button is clicked', async () => {
      // Create mock callback functions
      const mockOnExportStart = jest.fn();
      const mockOnExportComplete = jest.fn();
      
      // Render component
      render(
        <DataExportComponent
          projectId="project-1"
          initialFormat="csv"
          availableTypes={['project']}
          onExportStart={mockOnExportStart}
          onExportComplete={mockOnExportComplete}
        />
      );
      
      // Find and click the export button
      const exportButton = screen.getByText('reports.export');
      fireEvent.click(exportButton);
      
      // Verify export start callback was called
      expect(mockOnExportStart).toHaveBeenCalledTimes(1);
      
      // Wait for export process to complete
      await waitFor(() => {
        expect(mockOnExportComplete).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });
      
      // Verify export complete callback was called with a URL
      expect(mockOnExportComplete).toHaveBeenCalledWith(expect.stringContaining('/api/exports/'));
      
      // Verify download button appears
      const downloadButton = await screen.findByText('reports.downloadExport');
      expect(downloadButton).toBeInTheDocument();
    });
    
    it('should show progress bar during export', async () => {
      // Render component
      render(
        <DataExportComponent
          projectId="project-1"
          initialFormat="csv"
          availableTypes={['project']}
        />
      );
      
      // Find and click the export button
      const exportButton = screen.getByText('reports.export');
      fireEvent.click(exportButton);
      
      // Verify progress bar is shown
      const progressText = await screen.findByText('reports.exportingData');
      expect(progressText).toBeInTheDocument();
      
      // Wait for export to complete
      await waitFor(() => {
        expect(screen.getByText('reports.downloadExport')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
    
    it('should format export request with correct data structure', async () => {
      // Spy on console.log which is called with export data
      const consoleLogSpy = jest.spyOn(console, 'log');
      
      // Render component
      render(
        <DataExportComponent
          projectId="project-123"
          initialFormat="excel"
          availableTypes={['tasks']}
        />
      );
      
      // Find and click the export button
      const exportButton = screen.getByText('reports.export');
      fireEvent.click(exportButton);
      
      // Wait for export process
      await waitFor(() => {
        // Check console.log was called with export request
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Export request:',
          expect.objectContaining({
            projectId: 'project-123',
            format: 'excel',
            type: 'tasks'
          })
        );
      });
    });
  });
  
  describe('Error Handling', () => {
    it('should show error message when no options are selected', async () => {
      // Render component
      render(
        <DataExportComponent
          projectId="project-1"
          initialFormat="csv"
          availableTypes={['project']}
        />
      );
      
      // Uncheck all options
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        if (checkbox.getAttribute('id')?.startsWith('project-')) {
          fireEvent.click(checkbox);
        }
      });
      
      // Find and click the export button
      const exportButton = screen.getByText('reports.export');
      fireEvent.click(exportButton);
      
      // Verify error message is shown
      await waitFor(() => {
        expect(screen.getByText('reports.noOptionsSelected')).toBeInTheDocument();
      });
    });
    
    it('should handle offline mode correctly', async () => {
      // Mock FieldModeProvider to return offline state
      jest.mock('@/app/components/mobile/FieldModeProvider', () => ({
        useFieldMode: () => ({
          isFieldModeEnabled: false,
          isOnline: false,
          isLowDataMode: false
        })
      }));
      
      // Create mock error callback
      const mockOnExportError = jest.fn();
      
      // Render component with mocked context
      render(
        <DataExportComponent
          projectId="project-1"
          initialFormat="csv"
          availableTypes={['project']}
          onExportError={mockOnExportError}
        />
      );
      
      // Find and click the export button
      const exportButton = screen.getByText('reports.export');
      fireEvent.click(exportButton);
      
      // Error callback should be called with offline error
      expect(mockOnExportError).toHaveBeenCalledWith('reports.offlineExportError');
    });
  });
});
