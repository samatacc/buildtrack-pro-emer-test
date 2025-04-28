import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0, // gcTime replaces cacheTime in react-query v5
      staleTime: 0,
    },
  },
});

type CustomRenderOptions = {
  queryClient?: QueryClient;
} & Omit<RenderOptions, 'wrapper'>;

// Create a wrapper with all necessary providers
function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const queryClient = options?.queryClient || createTestQueryClient();
  
  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
    ...options,
  });
}

// Mock profile data for testing
export const mockProfileData = {
  id: 'test-user-id',
  email: 'test@buildtrackpro.com',
  firstName: 'Test',
  lastName: 'User',
  avatarUrl: '/images/mock-avatar.jpg',
  jobTitle: 'Project Manager',
  department: 'Construction',
  language: 'en',
  timezone: 'America/New_York',
  preferredContactMethod: 'email',
  notificationPreferences: {
    email: true,
    push: true,
    sms: false
  },
  // Required timestamp fields
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  // Additional fields that might be used in tests
  preferences: {
    notificationSettings: {
      dailyDigest: true,
      projectUpdates: true,
      taskAssignments: true,
      mentions: true,
      deadlines: true
    },
    theme: 'light',
    dashboardLayout: 'default'
  },
  skills: [],
  certifications: []
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
