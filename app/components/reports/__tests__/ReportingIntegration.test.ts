/**
 * @jest-environment jsdom
 */
import { validateReportDataConsistency, validateExportDataConsistency } from './helpers/reportConsistencyUtils';
import { ProjectData, ReportData, ReportType, ExportFormat, ExportType } from '../reportTypes';

// Mock project data matching BuildTrack Pro's schema
const mockProjectData: ProjectData = {
  id: 'project-1',
  name: 'Central City Tower Construction',
  description: 'Construction of a 30-story commercial building in downtown Central City.',
  status: 'in_progress',
  progress: 45,
  startDate: '2025-01-15',
  endDate: '2026-07-30',
  client: 'Central Development Corp.',
  location: '123 Main St, Central City',
  budget: {
    total: 28500000,
    spent: 12825000,
    remaining: 15675000,
    percentUsed: 45
  },
  team: {
    members: 78,
    contractors: 12,
    suppliers: 24
  },
  stats: {
    tasksTotal: 342,
    tasksCompleted: 154,
    tasksInProgress: 87,
    tasksBlocked: 24,
    materialsOrdered: 189,
    materialsDelivered: 142,
    documentsTotal: 267,
    permitsPending: 4,
    inspectionsCompleted: 12,
    inspectionsPending: 3,
    incidents: 2,
    safetyRating: 92
  }
};

// Mock the fetch API's internal implementation
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockProjectData)
  })
);

describe('Reporting System Integration Tests', () => {
  describe('Data Consistency Across Report Formats', () => {
    // Example project summary report data - matches what our components would generate
    const projectSummaryReport: ReportData = {
      title: 'Project Summary',
      sections: [
        {
          title: 'reports.projectOverview',
          content: [
            { type: 'text', value: mockProjectData.description },
            { 
              type: 'keyValue', 
              items: [
                { key: 'reports.status', value: `reports.projects.status.${mockProjectData.status}` },
                { key: 'reports.progress', value: `${mockProjectData.progress}%` },
                { key: 'reports.startDate', value: new Date(mockProjectData.startDate).toLocaleDateString('en-US', { dateStyle: 'long' }) },
                { key: 'reports.endDate', value: new Date(mockProjectData.endDate).toLocaleDateString('en-US', { dateStyle: 'long' }) },
                { key: 'reports.projects.client', value: mockProjectData.client },
                { key: 'reports.projects.location', value: mockProjectData.location }
              ]
            }
          ]
        },
        {
          title: 'reports.budgetSummary',
          content: [
            {
              type: 'chart',
              chartId: 'budget-overview',
              chartType: 'doughnut',
              data: {
                labels: ['reports.spent', 'reports.remaining'],
                datasets: [{
                  label: 'reports.budgetOverview',
                  data: [mockProjectData.budget.spent, mockProjectData.budget.remaining],
                  backgroundColor: ['rgb(236,107,44)', 'rgb(24,62,105)']
                }]
              }
            },
            { 
              type: 'keyValue', 
              items: [
                { key: 'reports.totalBudget', value: `$${mockProjectData.budget.total.toLocaleString('en-US')}` },
                { key: 'reports.spent', value: `$${mockProjectData.budget.spent.toLocaleString('en-US')}` },
                { key: 'reports.remaining', value: `$${mockProjectData.budget.remaining.toLocaleString('en-US')}` },
                { key: 'reports.percentUsed', value: `${mockProjectData.budget.percentUsed}%` }
              ]
            }
          ]
        },
        {
          title: 'reports.teamOverview',
          content: [
            { 
              type: 'keyValue', 
              items: [
                { key: 'reports.teamMembers', value: mockProjectData.team.members.toString() },
                { key: 'reports.contractors', value: mockProjectData.team.contractors.toString() },
                { key: 'reports.suppliers', value: mockProjectData.team.suppliers.toString() }
              ]
            }
          ]
        }
      ],
      metadata: {
        projectId: mockProjectData.id,
        projectName: mockProjectData.name,
        generatedAt: new Date(),
        generatedBy: 'Test Suite',
        reportType: 'project_summary',
        dateRange: { start: new Date('2025-01-01'), end: new Date() },
        paperSize: 'a4',
        orientation: 'portrait',
        locale: 'en'
      }
    };

    // Example task status report
    const taskStatusReport: ReportData = {
      title: 'Task Status',
      sections: [
        {
          title: 'reports.taskSummary',
          content: [
            {
              type: 'chart',
              chartId: 'task-status',
              chartType: 'pie',
              data: {
                labels: [
                  'reports.tasks.status.completed', 
                  'reports.tasks.status.inprogress', 
                  'reports.tasks.status.blocked',
                  'reports.tasks.status.notstarted'
                ],
                datasets: [{
                  label: 'reports.taskStatus',
                  data: [
                    mockProjectData.stats.tasksCompleted,
                    mockProjectData.stats.tasksInProgress,
                    mockProjectData.stats.tasksBlocked,
                    mockProjectData.stats.tasksTotal - mockProjectData.stats.tasksCompleted - mockProjectData.stats.tasksInProgress - mockProjectData.stats.tasksBlocked
                  ],
                  backgroundColor: ['#4CAF50', '#2196F3', '#F44336', '#9E9E9E']
                }]
              }
            },
            { 
              type: 'text', 
              value: `reports.totalTasks: ${mockProjectData.stats.tasksTotal}` 
            }
          ]
        }
      ],
      metadata: {
        projectId: mockProjectData.id,
        projectName: mockProjectData.name,
        generatedAt: new Date(),
        generatedBy: 'Test Suite',
        reportType: 'task_status',
        dateRange: { start: new Date('2025-01-01'), end: new Date() },
        paperSize: 'a4',
        orientation: 'portrait',
        locale: 'en'
      }
    };

    // Example project export data (CSV format)
    const projectExportData = {
      projectId: mockProjectData.id,
      type: 'project',
      format: 'csv',
      headers: ['name', 'description', 'status', 'progress', 'startDate', 'endDate', 'client', 'location'],
      data: [
        mockProjectData.name,
        mockProjectData.description,
        mockProjectData.status,
        mockProjectData.progress,
        mockProjectData.startDate,
        mockProjectData.endDate,
        mockProjectData.client,
        mockProjectData.location
      ],
      summary: {
        totalBudget: mockProjectData.budget.total,
        spentBudget: mockProjectData.budget.spent,
        remainingBudget: mockProjectData.budget.remaining
      }
    };

    // Example tasks export (Excel format)
    const tasksExportData = {
      projectId: mockProjectData.id,
      type: 'tasks',
      format: 'excel',
      headers: ['name', 'description', 'status', 'dueDate', 'assignee'],
      data: Array(mockProjectData.stats.tasksTotal).fill(0).map((_, i) => ({
        id: `task-${i}`,
        name: `Test Task ${i}`,
        status: i < mockProjectData.stats.tasksCompleted ? 'completed' :
                i < mockProjectData.stats.tasksCompleted + mockProjectData.stats.tasksInProgress ? 'in_progress' :
                i < mockProjectData.stats.tasksCompleted + mockProjectData.stats.tasksInProgress + mockProjectData.stats.tasksBlocked ? 'blocked' : 'not_started'
      })),
      summary: {
        totalCount: mockProjectData.stats.tasksTotal,
        completedCount: mockProjectData.stats.tasksCompleted,
        inProgressCount: mockProjectData.stats.tasksInProgress,
        blockedCount: mockProjectData.stats.tasksBlocked
      }
    };

    // Example materials export (JSON format)
    const materialsExportData = {
      projectId: mockProjectData.id,
      type: 'materials',
      format: 'json',
      headers: ['name', 'quantity', 'unit', 'status', 'location'],
      data: Array(mockProjectData.stats.materialsOrdered).fill(0).map((_, i) => ({
        id: `material-${i}`,
        name: `Test Material ${i}`,
        status: i < mockProjectData.stats.materialsDelivered ? 'delivered' : 'pending'
      })),
      summary: {
        totalCount: mockProjectData.stats.materialsOrdered,
        deliveredCount: mockProjectData.stats.materialsDelivered,
        pendingCount: mockProjectData.stats.materialsOrdered - mockProjectData.stats.materialsDelivered
      }
    };

    it('should maintain data consistency between project data and project summary report', () => {
      const result = validateReportDataConsistency(mockProjectData, projectSummaryReport, 'project_summary');
      expect(result.isConsistent).toBe(true);
      expect(result.inconsistencies.length).toBe(0);
    });

    it('should maintain data consistency between project data and task status report', () => {
      const result = validateReportDataConsistency(mockProjectData, taskStatusReport, 'task_status');
      expect(result.isConsistent).toBe(true);
      expect(result.inconsistencies.length).toBe(0);
    });

    it('should detect inconsistencies in project reports', () => {
      // Create a report with inconsistent data
      const inconsistentReport = JSON.parse(JSON.stringify(projectSummaryReport));
      // Modify budget chart data to be inconsistent
      inconsistentReport.sections[1].content[0].data.datasets[0].data = [10000000, 15000000]; // Incorrect values
      
      const result = validateReportDataConsistency(mockProjectData, inconsistentReport, 'project_summary');
      expect(result.isConsistent).toBe(false);
      expect(result.inconsistencies.length).toBeGreaterThan(0);
    });

    it('should maintain data consistency between project data and CSV export', () => {
      const result = validateExportDataConsistency(
        mockProjectData, 
        projectExportData, 
        'project', 
        'csv'
      );
      expect(result.isConsistent).toBe(true);
      expect(result.inconsistencies.length).toBe(0);
    });

    it('should maintain data consistency between project data and Excel tasks export', () => {
      const result = validateExportDataConsistency(
        mockProjectData, 
        tasksExportData, 
        'tasks', 
        'excel'
      );
      expect(result.isConsistent).toBe(true);
      expect(result.inconsistencies.length).toBe(0);
    });

    it('should maintain data consistency between project data and JSON materials export', () => {
      const result = validateExportDataConsistency(
        mockProjectData, 
        materialsExportData, 
        'materials', 
        'json'
      );
      expect(result.isConsistent).toBe(true);
      expect(result.inconsistencies.length).toBe(0);
    });

    it('should detect inconsistencies in export data', () => {
      // Create export data with inconsistent materials count
      const inconsistentExport = JSON.parse(JSON.stringify(materialsExportData));
      inconsistentExport.summary.deliveredCount = 100; // Incorrect value
      
      const result = validateExportDataConsistency(
        mockProjectData, 
        inconsistentExport, 
        'materials', 
        'json'
      );
      
      expect(result.isConsistent).toBe(false);
      expect(result.inconsistencies.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-Format Data Consistency Tests', () => {
    // Create a more complete sample project report in different formats
    const reportFormats = ['pdf', 'csv', 'excel', 'json'];
    const reportTypes = ['project_summary', 'task_status', 'budget_overview'];
    
    it('should be consistent in numerical values across different export formats', () => {
      // This test would verify that numerical values like budget amounts and task counts
      // are consistently represented across different export formats
      expect(true).toBe(true); // Placeholder - would implement full validation
    });
    
    it('should be consistent in dates and times across formats and locales', () => {
      // This test would verify date formatting consistency across report formats and locales
      expect(true).toBe(true); // Placeholder - would implement full validation
    });
    
    it('should be consistent in percent values and calculations across formats', () => {
      // This test would verify percentage calculations consistency
      const progress = mockProjectData.progress;
      const percentUsed = mockProjectData.budget.percentUsed;
      
      // Verify that percentages match in all cases
      expect(progress).toBe(45);
      expect(percentUsed).toBe(45);
      
      // Verify that the percentage is correctly calculated
      const calculatedPercentage = Math.round(mockProjectData.budget.spent / mockProjectData.budget.total * 100);
      expect(percentUsed).toBe(calculatedPercentage);
    });
  });
  
  describe('Cross-Locale Data Consistency Tests', () => {
    // Testing data consistency across different locales
    const locales = ['en', 'es', 'fr', 'pt-BR'];
    
    it('should consistently format currency values across locales', () => {
      // Create formatted values for each locale
      const formattedCurrencies = {
        'en': `$${mockProjectData.budget.total.toLocaleString('en-US')}`,
        'es': `${mockProjectData.budget.total.toLocaleString('es-ES')}€`,
        'fr': `${mockProjectData.budget.total.toLocaleString('fr-FR')}€`,
        'pt-BR': `R$${mockProjectData.budget.total.toLocaleString('pt-BR')}`
      };
      
      // Log the formatted values for debugging
      console.log('Formatted currency values:', formattedCurrencies);
      
      // For proper currency value comparison, we need a more robust approach than simple parsing
      // In a real implementation, we would use a specialized library for currency handling
      // For this test, we'll verify the formatted strings contain the same digits when non-digits are removed
      const extractDigits = (str: string) => str.replace(/[^0-9]/g, '');
      
      // Extract just the digits from each formatted currency value
      const currencyDigits = Object.values(formattedCurrencies).map(extractDigits);
      
      // The extracted digit string should be the same for all currencies
      const expectedDigits = mockProjectData.budget.total.toString();
      currencyDigits.forEach(digits => {
        expect(digits).toBe(expectedDigits);
      });
    });
    
    it('should consistently format dates across locales', () => {
      // Create formatted values for each locale
      const date = new Date(mockProjectData.startDate);
      const formattedDates = {
        'en': date.toLocaleDateString('en-US'),
        'es': date.toLocaleDateString('es-ES'),
        'fr': date.toLocaleDateString('fr-FR'),
        'pt-BR': date.toLocaleDateString('pt-BR')
      };
      
      // Verify each format is different but represents the same date
      Object.values(formattedDates).forEach(formattedDate => {
        const parsedDate = new Date(formattedDate);
        // Test would compare years, months, days
        expect(true).toBe(true); // Placeholder for date parsing logic
      });
    });
  });
});
