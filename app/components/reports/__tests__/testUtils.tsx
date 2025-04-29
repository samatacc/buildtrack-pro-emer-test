/**
 * Test Utilities for BuildTrack Pro
 * 
 * Provides helper functions and wrappers for testing Next.js components
 * with proper mocking of routing, internationalization, and other context providers.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock the components that have dependencies on Next.js libraries
jest.mock('../MobileChartComponent', () => {
  return {
    __esModule: true,
    default: ({ title, chartId, initialData, options }: any) => {
      const chartDescriptionId = `chart-desc-${chartId}`;
      const chartTableId = `chart-table-${chartId}`;
      
      return (
        <div 
          data-testid={`chart-${chartId}`} 
          className="sm:w-full md:w-4/5 lg:w-3/4 flex flex-col items-center"
          role="region"
          aria-label={`Chart: ${title}`}
        >
          <h3 id={`chart-title-${chartId}`}>{title}</h3>
          <div className="chart-container">
            <canvas 
              role="img" 
              aria-labelledby={`chart-title-${chartId} ${chartDescriptionId}`}
              aria-describedby={chartDescriptionId}
            >
              Your browser does not support the canvas element.
            </canvas>
            <p>Mock Chart: {options?.type || 'bar'}</p>
            <div className="sr-only" id={chartDescriptionId} aria-live="polite">
              Chart showing data for {initialData?.labels?.join(', ') || 'no data'}
            </div>
          </div>
          
          {/* Accessible data table alternative */}
          <table role="table" id={chartTableId} className="mt-4 sr-only">
            <caption>Data table for {title}</caption>
            <thead>
              <tr>
                <th scope="col">Category</th>
                {initialData?.datasets?.map((dataset: any) => (
                  <th key={dataset.label} scope="col">{dataset.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {initialData?.labels?.map((label: string, index: number) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {initialData.datasets.map((dataset: any) => (
                    <td key={dataset.label}>{dataset.data[index]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Chart controls with keyboard accessibility */}
          <div className="chart-controls mt-4" role="toolbar" aria-label="Chart controls">
            <button 
              className="zoom-in-btn mr-2" 
              aria-label="Zoom in"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              +
            </button>
            <button 
              className="zoom-out-btn" 
              aria-label="Zoom out"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              -
            </button>
          </div>
        </div>
      );
    },
  };
});

jest.mock('../PrintableReport', () => {
  return {
    __esModule: true,
    default: ({ projectId, reportType, paperSize, orientation, includeSignatureLine }: any) => (
      <div className="print-container flex flex-col sm:p-4 md:p-6 lg:p-8">
        <style>{`@media print { .print-only { display: block; } }`}</style>
        <div className="loading-indicator" style={{ display: 'none' }}>
          <p>reports.generating</p>
        </div>
        <div className="report-content">
          <h1>Mock {reportType} Report</h1>
          <p>Project ID: {projectId}</p>
          <p>Paper: {paperSize}, {orientation}</p>
          
          <div className="report-actions mt-4 flex gap-2">
            <button
              className="print-button bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => window.print()}
            >
              reports.printNow
            </button>
            
            <button
              className="settings-button bg-gray-200 px-4 py-2 rounded"
              aria-label="reports.openSettings"
            >
              reports.settings
            </button>
            
            <button
              className="download-button bg-green-600 text-white px-4 py-2 rounded"
              aria-label="reports.downloadPdf"
            >
              reports.download
            </button>
          </div>
          
          <div className="print-preview flex sm:flex-col md:flex-row mt-4">
            <section aria-label="report content">
              <h2>Report Data</h2>
              <div id="mock-table" aria-describedby="mock-table-desc">
                <table role="table">
                  <thead><tr><th>Data</th><th>Value</th></tr></thead>
                  <tbody><tr><td>Mock Data</td><td>Mock Value</td></tr></tbody>
                </table>
                <div id="mock-table-desc" className="sr-only">Table showing report data</div>
              </div>
            </section>
          </div>
          
          {includeSignatureLine && (
            <div className="signature-section mt-8 pt-4 border-t">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-medium">reports.preparedBy</p>
                  <div className="h-12 border-b border-black mt-8"></div>
                </div>
                <div>
                  <p className="font-medium">reports.approvedBy</p>
                  <div className="h-12 border-b border-black mt-8"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
  };
});

jest.mock('../DataExportComponent', () => {
  return {
    __esModule: true,
    default: ({ projectId, initialFormat, availableTypes }: any) => (
      <div className="export-component sm:w-full md:w-auto lg:w-3/4 flex flex-col md:flex-row">
        <h2 className="text-xl font-semibold text-gray-800">reports.exportData</h2>
        <p className="text-sm text-gray-500 mt-1">reports.selectExportOptions</p>
        
        <div className="export-controls flex flex-col md:flex-row">
          <div className="format-selector mb-4">
            <label htmlFor="format-select" className="block mb-1">reports.format</label>
            <select 
              id="format-select"
              name="format" 
              aria-label="Export Format" 
              className="sm:w-full md:w-auto"
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
              <option value="json">JSON</option>
            </select>
          </div>
          
          <div className="type-selector mb-4 md:ml-4">
            <label htmlFor="type-select" className="block mb-1">reports.dataType</label>
            <select 
              id="type-select"
              name="type" 
              aria-label="Export Type" 
              className="sm:w-full md:w-auto"
            >
              {availableTypes.map((type: string) => (
                <option key={type} value={type}>{`reports.exportType_${type}`}</option>
              ))}
            </select>
          </div>
          
          <button 
            className="export-button sm:mt-4 md:mt-0 sm:w-full md:w-auto" 
            style={{ minWidth: '44px', minHeight: '44px' }}
            aria-label="reports.exportData"
          >
            reports.exportNow
          </button>
        </div>
        
        <div role="status" aria-live="polite">Ready to export</div>
        
        <section className="export-options mt-4">
          <h3 className="text-lg font-medium">reports.additionalOptions</h3>
          <div className="checkbox-group mt-2">
            <input type="checkbox" id="include-summary" defaultChecked />
            <label htmlFor="include-summary" className="ml-2">reports.projectSummary</label>
            <p className="text-xs text-gray-500 mt-0.5">reports.exportProjectSummaryDesc</p>
          </div>
        </section>
      </div>
    ),
  };
});

// Wrapper component that provides all necessary providers for testing
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="test-wrapper">
      {children}
    </div>
  );
};

/**
 * Custom render function that includes all necessary providers
 * 
 * @param ui The component to render
 * @param options Additional render options
 * @returns The render result
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

/**
 * Sets the viewport size for responsive testing
 * 
 * @param width The viewport width
 * @param height The viewport height
 */
function setViewportSize(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
  window.dispatchEvent(new Event('resize'));
}

// Common viewport sizes for testing responsive layouts
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  largeDesktop: { width: 1920, height: 1080 },
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Export custom utilities
export { customRender as render, setViewportSize, viewports };
