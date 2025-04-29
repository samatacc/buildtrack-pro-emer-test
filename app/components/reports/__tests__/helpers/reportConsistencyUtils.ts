/**
 * Reporting Consistency Test Utilities
 * 
 * Tools for testing data consistency across different report formats and export types
 * in BuildTrack Pro's reporting system.
 */

import { ProjectData, ReportType, ExportFormat, ExportType } from '../reportTypes';

// Re-export types for convenience in tests
export type { ProjectData, ReportType, ExportFormat, ExportType };

/**
 * Validates that project data is consistently represented across
 * different report formats and export types.
 * 
 * @param projectData The source project data
 * @param reportData The rendered report data
 * @param reportType The type of report
 * @returns Object with validation results and any inconsistencies
 */
export function validateReportDataConsistency(
  projectData: ProjectData,
  reportData: any,
  reportType: ReportType
): { 
  isConsistent: boolean;
  inconsistencies: string[];
} {
  const result = {
    isConsistent: true,
    inconsistencies: [] as string[]
  };
  
  // Basic project metadata should be consistent across all report types
  if (reportData.metadata?.projectId !== projectData.id) {
    result.isConsistent = false;
    result.inconsistencies.push(`Project ID mismatch: ${reportData.metadata?.projectId} vs ${projectData.id}`);
  }
  
  if (reportData.metadata?.projectName !== projectData.name) {
    result.isConsistent = false;
    result.inconsistencies.push(`Project name mismatch: ${reportData.metadata?.projectName} vs ${projectData.name}`);
  }
  
  // Validate report-specific data
  switch (reportType) {
    case 'project_summary':
      validateProjectSummaryData(projectData, reportData, result);
      break;
    case 'task_status':
      validateTaskStatusData(projectData, reportData, result);
      break;
    case 'budget_overview':
      validateBudgetData(projectData, reportData, result);
      break;
    case 'material_usage':
      validateMaterialData(projectData, reportData, result);
      break;
    default:
      // Default validation
      break;
  }
  
  return result;
}

/**
 * Validates that export data is consistent with the source project data
 * 
 * @param projectData The source project data
 * @param exportData The exported data
 * @param exportType The type of export
 * @param exportFormat The format of the export
 * @returns Object with validation results and any inconsistencies
 */
export function validateExportDataConsistency(
  projectData: ProjectData,
  exportData: any,
  exportType: ExportType,
  exportFormat: ExportFormat
): {
  isConsistent: boolean;
  inconsistencies: string[];
} {
  const result = {
    isConsistent: true,
    inconsistencies: [] as string[]
  };
  
  // Basic validation for project ID
  if (exportData.projectId !== projectData.id) {
    result.isConsistent = false;
    result.inconsistencies.push(`Project ID mismatch in export: ${exportData.projectId} vs ${projectData.id}`);
  }
  
  // Validate export type-specific data
  switch (exportType) {
    case 'project':
      validateProjectExportData(projectData, exportData, exportFormat, result);
      break;
    case 'tasks':
      validateTasksExportData(projectData, exportData, exportFormat, result);
      break;
    case 'materials':
      validateMaterialsExportData(projectData, exportData, exportFormat, result);
      break;
    // Add more export type validations as needed
    default:
      // Default validation
      break;
  }
  
  return result;
}

/**
 * Validates project summary report data consistency
 */
function validateProjectSummaryData(
  projectData: ProjectData,
  reportData: any,
  result: { isConsistent: boolean; inconsistencies: string[] }
): void {
  // Validate budget section
  const budgetSection = reportData.sections?.find((s: any) => s.title === 'reports.budgetSummary');
  if (budgetSection) {
    const budgetChart = budgetSection.content.find((c: any) => c.type === 'chart' && c.chartId === 'budget-overview');
    if (budgetChart) {
      // Validate budget chart data matches project data
      const chartData = budgetChart.data.datasets[0].data;
      if (chartData[0] !== projectData.budget.spent || chartData[1] !== projectData.budget.remaining) {
        result.isConsistent = false;
        result.inconsistencies.push('Budget chart data does not match project budget data');
      }
    }
    
    // Validate budget key-value pairs
    const budgetKV = budgetSection.content.find((c: any) => c.type === 'keyValue');
    if (budgetKV) {
      const totalBudgetItem = budgetKV.items.find((i: any) => i.key === 'reports.totalBudget');
      if (totalBudgetItem && parseFloat(totalBudgetItem.value.replace(/[^0-9.-]+/g, '')) !== projectData.budget.total) {
        result.isConsistent = false;
        result.inconsistencies.push('Total budget value in report does not match project data');
      }
    }
  }
  
  // Validate team section
  const teamSection = reportData.sections?.find((s: any) => s.title === 'reports.teamOverview');
  if (teamSection) {
    const teamKV = teamSection.content.find((c: any) => c.type === 'keyValue');
    if (teamKV) {
      const teamMembersItem = teamKV.items.find((i: any) => i.key === 'reports.teamMembers');
      if (teamMembersItem && parseInt(teamMembersItem.value) !== projectData.team.members) {
        result.isConsistent = false;
        result.inconsistencies.push('Team members count in report does not match project data');
      }
    }
  }
}

/**
 * Validates task status report data consistency
 */
function validateTaskStatusData(
  projectData: ProjectData,
  reportData: any,
  result: { isConsistent: boolean; inconsistencies: string[] }
): void {
  // Validate task summary section
  const taskSummarySection = reportData.sections?.find((s: any) => s.title === 'reports.taskSummary');
  if (taskSummarySection) {
    const taskChart = taskSummarySection.content.find((c: any) => c.type === 'chart' && c.chartId === 'task-status');
    if (taskChart) {
      // Validate task chart data matches project data
      const chartData = taskChart.data.datasets[0].data;
      if (
        chartData[0] !== projectData.stats.tasksCompleted ||
        chartData[1] !== projectData.stats.tasksInProgress ||
        chartData[2] !== projectData.stats.tasksBlocked
      ) {
        result.isConsistent = false;
        result.inconsistencies.push('Task status chart data does not match project task data');
      }
    }
    
    // Validate task total
    const taskTotalText = taskSummarySection.content.find((c: any) => c.type === 'text' && c.value.includes('reports.totalTasks'));
    if (taskTotalText && !taskTotalText.value.includes(String(projectData.stats.tasksTotal))) {
      result.isConsistent = false;
      result.inconsistencies.push('Total tasks in report does not match project data');
    }
  }
}

/**
 * Validates budget overview report data consistency
 */
function validateBudgetData(
  projectData: ProjectData,
  reportData: any,
  result: { isConsistent: boolean; inconsistencies: string[] }
): void {
  // Basic budget validation - would be expanded in a real implementation
  const budgetSection = reportData.sections?.find((s: any) => s.title?.includes('budget'));
  if (!budgetSection) {
    result.isConsistent = false;
    result.inconsistencies.push('Budget section missing from budget report');
  }
}

/**
 * Validates material usage report data consistency
 */
function validateMaterialData(
  projectData: ProjectData,
  reportData: any,
  result: { isConsistent: boolean; inconsistencies: string[] }
): void {
  // Basic material validation - would be expanded in a real implementation
  const materialSection = reportData.sections?.find((s: any) => s.title?.includes('material'));
  if (!materialSection) {
    result.isConsistent = false;
    result.inconsistencies.push('Material section missing from material report');
  }
}

/**
 * Validates project export data consistency
 */
function validateProjectExportData(
  projectData: ProjectData,
  exportData: any,
  exportFormat: ExportFormat,
  result: { isConsistent: boolean; inconsistencies: string[] }
): void {
  // Format-specific validations
  switch (exportFormat) {
    case 'csv':
    case 'excel':
      // Check for required columns in spreadsheet formats
      if (!exportData.headers.includes('name') || !exportData.headers.includes('status')) {
        result.isConsistent = false;
        result.inconsistencies.push('Required columns missing from project export');
      }
      break;
      
    case 'pdf':
      // PDF format validation
      break;
      
    case 'json':
      // JSON format validation - should have complete data structure
      if (!exportData.data.name || !exportData.data.status || !exportData.data.budget) {
        result.isConsistent = false;
        result.inconsistencies.push('Required fields missing from JSON project export');
      }
      break;
  }
}

/**
 * Validates tasks export data consistency
 */
function validateTasksExportData(
  projectData: ProjectData,
  exportData: any,
  exportFormat: ExportFormat,
  result: { isConsistent: boolean; inconsistencies: string[] }
): void {
  // Basic tasks validation - would be expanded in a real implementation
  const totalTasks = exportData.summary?.totalCount || exportData.data?.length;
  if (totalTasks !== projectData.stats.tasksTotal) {
    result.isConsistent = false;
    result.inconsistencies.push(`Task count mismatch: export has ${totalTasks}, project has ${projectData.stats.tasksTotal}`);
  }
}

/**
 * Validates materials export data consistency
 */
function validateMaterialsExportData(
  projectData: ProjectData,
  exportData: any,
  exportFormat: ExportFormat,
  result: { isConsistent: boolean; inconsistencies: string[] }
): void {
  // Basic materials validation - would be expanded in a real implementation
  const materialsDelivered = exportData.summary?.deliveredCount || 
    exportData.data?.filter((m: any) => m.status === 'delivered').length;
  
  if (materialsDelivered !== projectData.stats.materialsDelivered) {
    result.isConsistent = false;
    result.inconsistencies.push(`Materials delivered mismatch: export has ${materialsDelivered}, project has ${projectData.stats.materialsDelivered}`);
  }
}
