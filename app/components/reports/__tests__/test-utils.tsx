import React, { ReactElement } from 'react';
import { render as rtlRender, screen, waitFor, act, fireEvent, RenderOptions } from '@testing-library/react';
import { 
  useNamespacedTranslations, 
  useFieldMode, 
  useRouter, 
  MockChart, 
  MockDataExport, 
  MockPrintableReport 
} from './__mocks__/app-mocks';

// Set up mocks for component imports to avoid path resolution issues
jest.mock('../MobileChartComponent', () => ({
  __esModule: true,
  default: MockChart
}));

jest.mock('../DataExportComponent', () => ({
  __esModule: true,
  default: MockDataExport
}));

jest.mock('../PrintableReport', () => ({
  __esModule: true,
  default: MockPrintableReport
}));

// Next.js specific mocks
jest.mock('next/navigation', () => ({
  useRouter
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

// Create a wrapper component with mock providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => rtlRender(ui, { wrapper: AllTheProviders, ...options });

// Setup fake timers for all tests
beforeEach(() => {
  jest.useFakeTimers();
});

// Export all testing utilities
export * from '@testing-library/react';
export { customRender as render };
export { useNamespacedTranslations, useFieldMode, useRouter, MockChart };
