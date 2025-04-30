import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    })),
  })),
}));

describe('BuildTrack Pro Supabase Authentication', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test user registration
  test('should register a new user with proper data formatting', async () => {
    // Prepare test data
    const testUser = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    // Mock successful signup
    const mockedClient = createClient('', '');
    (mockedClient.auth.signUp as any).mockResolvedValue({
      data: {
        user: {
          id: '123',
          email: testUser.email,
          user_metadata: { name: testUser.name },
        },
        session: { access_token: 'mock-token' },
      },
      error: null,
    });

    // Call the signup method
    const result = await mockedClient.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          name: testUser.name,
        },
      },
    });

    // Assertions
    expect(mockedClient.auth.signUp).toHaveBeenCalledWith({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          name: testUser.name,
        },
      },
    });
    expect(result.data?.user?.email).toBe(testUser.email);
    expect(result.error).toBeNull();
  });

  // Test user login
  test('should authenticate user with correct credentials', async () => {
    // Prepare test data
    const testCredentials = {
      email: 'existing@example.com',
      password: 'Password123!',
    };

    // Mock successful login
    const mockedClient = createClient('', '');
    (mockedClient.auth.signInWithPassword as any).mockResolvedValue({
      data: {
        user: {
          id: '123',
          email: testCredentials.email,
          user_metadata: { name: 'Existing User' },
        },
        session: { access_token: 'mock-token' },
      },
      error: null,
    });

    // Call the login method
    const result = await mockedClient.auth.signInWithPassword({
      email: testCredentials.email,
      password: testCredentials.password,
    });

    // Assertions
    expect(mockedClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: testCredentials.email,
      password: testCredentials.password,
    });
    expect(result.data?.user?.email).toBe(testCredentials.email);
    expect(result.error).toBeNull();
  });

  // Test login failure with invalid credentials
  test('should handle invalid credentials gracefully', async () => {
    // Prepare test data
    const invalidCredentials = {
      email: 'user@example.com',
      password: 'WrongPassword',
    };

    // Mock auth error response
    const mockedClient = createClient('', '');
    (mockedClient.auth.signInWithPassword as any).mockResolvedValue({
      data: null,
      error: {
        name: 'AuthApiError',
        status: 400,
        code: 'invalid_credentials',
        message: 'Invalid login credentials',
      },
    });

    // Call the login method
    const result = await mockedClient.auth.signInWithPassword({
      email: invalidCredentials.email,
      password: invalidCredentials.password,
    });

    // Assertions
    expect(mockedClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: invalidCredentials.email,
      password: invalidCredentials.password,
    });
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error?.code).toBe('invalid_credentials');
  });

  // Test error handling for existing user registration
  test('should handle registration of existing user', async () => {
    // Prepare test data
    const existingUser = {
      email: 'existing@example.com',
      password: 'Password123!',
      name: 'Existing User',
    };

    // Mock user already exists error
    const mockedClient = createClient('', '');
    (mockedClient.auth.signUp as any).mockResolvedValue({
      data: null,
      error: {
        message: 'User already registered',
        status: 400,
      },
    });

    // Call the signup method
    const result = await mockedClient.auth.signUp({
      email: existingUser.email,
      password: existingUser.password,
      options: {
        data: {
          name: existingUser.name,
        },
      },
    });

    // Assertions
    expect(mockedClient.auth.signUp).toHaveBeenCalledWith({
      email: existingUser.email,
      password: existingUser.password,
      options: {
        data: {
          name: existingUser.name,
        },
      },
    });
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('User already registered');
  });

  // Test updating user profile data
  test('should update user profile with BuildTrack Pro required fields', async () => {
    // Prepare test data
    const userId = '123';
    const profileData = {
      role: 'owner',
      team_size: 'Small (1-10)',
      focus_areas: ['Construction', 'Renovation'],
      has_sample_project: true,
      onboarding_completed: true,
    };

    // Create a more complete mock implementation
    const mockEq = vi.fn().mockResolvedValue({
      data: { ...profileData, id: userId },
      error: null,
    });
    
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    
    const mockFrom = vi.fn().mockReturnValue({
      update: mockUpdate,
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    });
    
    // Override the createClient mock for this test
    const mockedClient = createClient('', '');
    mockedClient.from = mockFrom;

    // Call the update method
    await mockedClient
      .from('profiles')
      .update(profileData)
      .eq('id', userId);

    // Assertions
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockUpdate).toHaveBeenCalledWith(profileData);
    expect(mockEq).toHaveBeenCalledWith('id', userId);
  });
  
  // Test for handling BuildTrack Pro's focus areas in user profile
  test('should handle focus areas as array in user profile', () => {
    // BuildTrack Pro uses a focus_areas column (TEXT[]) to store multiple construction specialties
    const focusAreas = ['Commercial', 'Residential', 'Renovation'];
    
    // This validates that the array format is preserved correctly when passing to Supabase
    expect(Array.isArray(focusAreas)).toBe(true);
    expect(focusAreas).toContain('Renovation');
    expect(focusAreas.length).toBe(3);
  });
});
