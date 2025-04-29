/**
 * Type definitions for BuildTrack Pro reporting system
 * 
 * This file defines the common interfaces and types used across
 * the reporting and analytics components, ensuring type consistency
 * and data integrity between different report formats and export types.
 */

/**
 * Report types available in the system
 */
export type ReportType = 'project_summary' | 'task_status' | 'budget_overview' | 'material_usage' | 'team_performance' | 'safety_report';

/**
 * Paper sizes for printable reports
 */
export type PaperSize = 'letter' | 'a4' | 'legal' | 'tabloid';

/**
 * Orientation options for printable reports
 */
export type Orientation = 'portrait' | 'landscape';

/**
 * Export formats supported by data export
 */
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

/**
 * Export types available in the system
 */
export type ExportType = 'project' | 'tasks' | 'materials' | 'documents' | 'team' | 'financial' | 'custom';

/**
 * Project data structure for reports and exports
 */
export interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  progress: number;
  startDate: string;
  endDate: string;
  client: string;
  location: string;
  budget: {
    total: number;
    spent: number;
    remaining: number;
    percentUsed: number;
  };
  team: {
    members: number;
    contractors: number;
    suppliers: number;
  };
  stats: {
    tasksTotal: number;
    tasksCompleted: number;
    tasksInProgress: number;
    tasksBlocked: number;
    materialsOrdered: number;
    materialsDelivered: number;
    documentsTotal: number;
    permitsPending: number;
    inspectionsCompleted: number;
    inspectionsPending: number;
    incidents: number;
    safetyRating: number;
  };
}

/**
 * Chart data structure used across reports
 */
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

/**
 * Print settings for reports
 */
export interface PrintSettings {
  paperSize: PaperSize;
  orientation: Orientation;
  includeHeader: boolean;
  includeFooter: boolean;
  includeCompanyLogo: boolean;
  includePageNumbers: boolean;
  includePrintDate: boolean;
  includeSignatureLine: boolean;
  addConfidentialWatermark: boolean;
}

/**
 * Export options configuration
 */
export interface ExportOptions {
  projectId: string;
  type: ExportType;
  format: ExportFormat;
  options: string[];
  includeSubtasks: boolean;
  includeArchived: boolean;
  includeComments: boolean;
  dateRange: {
    start: string;
    end: string;
  };
  locale: string;
}

/**
 * Report section types
 */
export type ReportSectionContentType = 'text' | 'keyValue' | 'chart' | 'table' | 'progressBar';

/**
 * Report section structure
 */
export interface ReportSection {
  title: string;
  content: Array<{
    type: ReportSectionContentType;
    [key: string]: any;
  }>;
}

/**
 * Complete report data structure
 */
export interface ReportData {
  title: string;
  sections: ReportSection[];
  metadata: {
    projectId: string;
    projectName: string;
    generatedAt: Date;
    generatedBy: string;
    reportType: ReportType;
    dateRange: { start: Date; end: Date };
    paperSize: PaperSize;
    orientation: Orientation;
    locale: string;
  };
}
