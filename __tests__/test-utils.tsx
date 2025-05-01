import React from 'react';
import { render } from '@testing-library/react';

// Mock Next.js navigation modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Create a custom wrapper to provide all necessary context providers
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui);
}
