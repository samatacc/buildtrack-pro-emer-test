import { renderHook, act, waitFor } from '@testing-library/react';
import { useProfile } from '../../app/hooks/useProfile';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import ProfileAPI from '../../lib/api/profile-client';

// Mock the ProfileAPI
jest.mock('../../lib/api/profile-client', () => ({
  __esModule: true,
  default: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    updatePreferences: jest.fn()
  }
}));

// Mock the Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } }
      })
    }
  }))
}));

// Sample profile data for testing
const mockProfileData = {
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
  // Required timestamp fields
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  // Add preferences for the test
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
  }
};

describe('useProfile Hook', () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock API responses
    (ProfileAPI.getProfile as jest.Mock).mockResolvedValue(mockProfileData);
    (ProfileAPI.updateProfile as jest.Mock).mockImplementation(
      (updatedData) => Promise.resolve({ ...mockProfileData, ...updatedData })
    );
    (ProfileAPI.updatePreferences as jest.Mock).mockImplementation(
      (updatedPrefs) => Promise.resolve({ 
        ...mockProfileData, 
        preferences: { ...mockProfileData.preferences, ...updatedPrefs } 
      })
    );
    
    // Set up query client and wrapper
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  });
  
  // Test profile fetching
  it('fetches profile data successfully', async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });
    
    // Initially in loading state
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the query to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Check profile data
    expect(result.current.profile).toEqual(mockProfileData);
    expect(ProfileAPI.getProfile).toHaveBeenCalled();
  });
  
  // Test profile updating
  it('updates profile data successfully', async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });
    
    // Wait for initial data to load
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Update profile data
    const updateData = { firstName: 'Updated', lastName: 'Name' };
    
    await act(async () => {
      await result.current.updateProfile(updateData);
    });
    
    // Check if API was called with correct data
    expect(ProfileAPI.updateProfile).toHaveBeenCalledWith(updateData);
    
    // Refetch should be triggered, check cache for updated data
    await waitFor(() => {
      expect(queryClient.getQueryData(['profile', 'details'])).toEqual({
        ...mockProfileData,
        ...updateData
      });
    });
  });
  
  // Test preferences updating
  it('updates preferences successfully', async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });
    
    // Wait for initial data to load
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Update preferences
    const newPrefs = {
      notificationSettings: { 
        email: true, 
        push: false 
      }
    };
    
    await act(async () => {
      await result.current.updatePreferences(newPrefs);
    });
    
    // Check if API was called with correct data
    expect(ProfileAPI.updatePreferences).toHaveBeenCalledWith(newPrefs);
  });
  
  // Test offline behavior
  it('handles offline state correctly', async () => {
    // Mock the navigator.onLine property
    const originalOnline = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
      writable: true
    });
    
    const { result } = renderHook(() => useProfile(), { wrapper });
    
    // Wait for hook to initialize
    await waitFor(() => expect(result.current.isOnline).toBe(false));
    
    // Restore navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: originalOnline,
      writable: true
    });
  });
});
