/**
 * Manual mocks for BuildTrack Pro app dependencies
 * This file provides consistent test mocks across all report component tests
 */
import React from 'react';

// Mock useNamespacedTranslations hook
export const useNamespacedTranslations = jest.fn().mockImplementation(() => ({
  t: (key: string) => key,
  locale: 'en',
  formatNumber: (val: number) => val.toString(),
  formatCurrency: (val: number) => `$${val}`,
  formatDate: (date: Date) => date.toISOString()
}));

// Mock useFieldMode hook
export const useFieldMode = jest.fn().mockImplementation(() => ({
  isFieldModeEnabled: false,
  isOnline: true,
  isLowDataMode: false
}));

// Mock useRouter hook
export const useRouter = jest.fn().mockImplementation(() => ({
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  pathname: '/dashboard/reports'
}));

// Mock chart component for easier testing
export const MockChart = (props: any) => {
  const chartId = props.chartId || 'default-chart';
  return (
    <div className="mobile-chart-component w-full flex flex-col md:flex-row lg:items-center gap-4">
      {/* Chart header with ARIA labeling */}
      <div className="chart-header mb-2 sm:mb-4">
        <h3 id={`chart-title-${chartId}`} className="text-lg sm:text-xl md:text-2xl font-medium">{props.title || 'Chart'}</h3>
        {props.subtitle && <p id={`chart-subtitle-${chartId}`} className="text-sm text-gray-600 md:text-base">{props.subtitle}</p>}
      </div>
      
      {/* Chart visualization container */}
      <div 
        data-testid={`chart-${chartId}`}
        role="figure"
        aria-labelledby={`chart-title-${chartId}`}
        className="chart-visualization w-full sm:w-4/5 md:w-3/4 lg:w-2/3 mx-auto flex flex-col items-center"
      >
        <canvas className="w-full h-auto"></canvas>
        <div className="chart-placeholder flex justify-center items-center p-4">Mock chart visualization</div>
      </div>
      
      {/* Accessibility region for screen readers */}
      <div 
        role="region"
        aria-label="Trend Description"
        className="visually-hidden screen-reader-content sr-only"
      >
        <p>This chart shows a trend where values increase in Q1, peak in Q2, and decline in Q3 and Q4.</p>
        <ul className="list-disc pl-5">
          <li>Highest value: 19 in February</li>
          <li>Lowest value: 3 in March</li>
          <li>Average value: 9.75</li>
        </ul>
      </div>
    </div>
  );
};

// Mock DataExportComponent
export const MockDataExport = (props: any) => (
  <div className="data-export-component export-component flex flex-col sm:flex-row md:items-start lg:justify-between p-4 sm:p-6 rounded-lg bg-white shadow-md" role="region" aria-label="Export Data">
    <form className="w-full md:max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="form-group flex flex-col sm:col-span-1">
        <label htmlFor="export-format" className="mb-2 text-sm font-medium">Format</label>
        <select id="export-format" aria-label="Export Format" className="p-2 border rounded-md sm:text-sm md:text-base">
          <option value="csv">CSV</option>
          <option value="excel">Excel</option>
          <option value="pdf">PDF</option>
        </select>
      </div>
      
      <div className="form-group flex flex-col sm:col-span-1">
        <label htmlFor="export-type" className="mb-2 text-sm font-medium">Type</label>
        <select id="export-type" aria-label="Export Type" className="p-2 border rounded-md sm:text-sm md:text-base">
          <option value="project">Project</option>
          <option value="tasks">Tasks</option>
          <option value="materials">Materials</option>
        </select>
      </div>
      
      <div className="form-group sm:col-span-2 flex justify-end mt-4">
        <button type="button" className="primary-button px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm md:text-base">Export Data</button>
      </div>
    </form>
  </div>
);

// Mock PrintableReport
export const MockPrintableReport = (props: any) => (
  <div className="printable-report print-container flex flex-col max-w-4xl mx-auto p-4 sm:p-6 md:p-8 bg-white shadow-lg">
    <div className="report-header border-b-2 border-gray-200 pb-4 mb-6 md:mb-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Project Summary Report</h1>
      <p className="text-sm md:text-base text-gray-600">Project: {props.projectId || 'Demo Project'}</p>
    </div>
    
    <div className="report-content flex-grow" role="main">
      <section className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3">Executive Summary</h2>
        <p className="text-sm md:text-base">This report provides an overview of the project status, including key metrics and milestones.</p>
      </section>
      
      <section className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3">Project Timeline</h2>
        <div className="timeline-chart w-full h-32 sm:h-40 md:h-60 bg-gray-100 rounded flex items-center justify-center" role="img" aria-label="Project Timeline">
          [Timeline Visualization]
        </div>
      </section>
    </div>
    
    <div className="report-controls mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2" role="status" aria-live="polite">
      <button className="print-button px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 sm:text-sm md:text-base" aria-label="Print Report">Print</button>
      <button className="export-button px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 sm:text-sm md:text-base" aria-label="Export as PDF">Export PDF</button>
    </div>
  </div>
);
