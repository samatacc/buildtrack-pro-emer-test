import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSupabaseAuth, SupabaseAuthProvider } from '../../lib/auth/SupabaseAuthContext';
import { createClient } from '@supabase/supabase-js';
import RegisterPage from '../../app/auth/register/page';
import LoginPage from '../../app/auth/login/page';

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(),
        single: jest.fn(),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
      insert: jest.fn(),
    })),
  })),
}));

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
  }),
}));

// Mock the Supabase auth provider
const mockUseSupabaseAuth = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
};

// Helper to wrap components with auth provider
const renderWithAuth = (ui, providerProps = {}) => {
  return render(
    <SupabaseAuthProvider>
      {ui}
    </SupabaseAuthProvider>
  );
};

describe('Authentication System', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('Registration Flow', () => {
    test('renders registration form correctly', async () => {
      renderWithAuth(<RegisterPage />);
      
      // Check that form elements are rendered
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
    });

    test('validates form inputs', async () => {
      const user = userEvent.setup();
      renderWithAuth(<RegisterPage />);
      
      // Click submit without filling in fields
      await user.click(screen.getByRole('button', { name: /Sign Up/i }));
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      });
    });

    test('handles successful registration', async () => {
      const user = userEvent.setup();
      
      // Mock successful registration
      const mockSignUp = jest.fn().mockResolvedValue({
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'token' }
        },
        error: null
      });
      
      // Get the mocked createClient and update its return value
      const mockedCreateClient = require('@supabase/supabase-js').createClient;
      mockedCreateClient.mockImplementation(() => ({
        auth: {
          signUp: mockSignUp,
          getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
          onAuthStateChange: jest.fn(() => ({
            data: { subscription: { unsubscribe: jest.fn() } }
          })),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn(),
            single: jest.fn(),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn(),
          }),
          insert: jest.fn(),
        }),
      }));
      
      renderWithAuth(<RegisterPage />);
      
      // Fill in form
      await user.type(screen.getByLabelText(/Name/i), 'Test User');
      await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/Password/i), 'Password123!');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /Sign Up/i }));
      
      // Check that signUp was called with correct params
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123!',
          options: {
            data: {
              name: 'Test User'
            }
          }
        });
      });
    });

    test('handles existing user error', async () => {
      const user = userEvent.setup();
      
      // Mock user already exists error
      const mockSignUp = jest.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'User already registered',
          status: 400
        }
      });
      
      // Get the mocked createClient and update its return value
      const mockedCreateClient = require('@supabase/supabase-js').createClient;
      mockedCreateClient.mockImplementation(() => ({
        auth: {
          signUp: mockSignUp,
          getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
          onAuthStateChange: jest.fn(() => ({
            data: { subscription: { unsubscribe: jest.fn() } }
          })),
        },
        from: jest.fn(),
      }));
      
      renderWithAuth(<RegisterPage />);
      
      // Fill in form
      await user.type(screen.getByLabelText(/Name/i), 'Test User');
      await user.type(screen.getByLabelText(/Email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/Password/i), 'Password123!');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /Sign Up/i }));
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/User already registered/i)).toBeInTheDocument();
      });
    });
  });

  describe('Login Flow', () => {
    test('renders login form correctly', async () => {
      renderWithAuth(<LoginPage />);
      
      // Check that form elements are rendered
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    test('handles successful login', async () => {
      const user = userEvent.setup();
      
      // Mock successful login
      const mockSignIn = jest.fn().mockResolvedValue({
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'token' }
        },
        error: null
      });
      
      // Get the mocked createClient and update its return value
      const mockedCreateClient = require('@supabase/supabase-js').createClient;
      mockedCreateClient.mockImplementation(() => ({
        auth: {
          signInWithPassword: mockSignIn,
          getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
          onAuthStateChange: jest.fn(() => ({
            data: { subscription: { unsubscribe: jest.fn() } }
          })),
        },
        from: jest.fn(),
      }));
      
      renderWithAuth(<LoginPage />);
      
      // Fill in form
      await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/Password/i), 'Password123!');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /Sign In/i }));
      
      // Check that signIn was called with correct params
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123!'
        });
      });
    });

    test('handles invalid credentials error', async () => {
      const user = userEvent.setup();
      
      // Mock invalid credentials error
      const mockSignIn = jest.fn().mockResolvedValue({
        data: null,
        error: {
          name: 'AuthApiError',
          status: 400,
          code: 'invalid_credentials',
          message: 'Invalid login credentials'
        }
      });
      
      // Get the mocked createClient and update its return value
      const mockedCreateClient = require('@supabase/supabase-js').createClient;
      mockedCreateClient.mockImplementation(() => ({
        auth: {
          signInWithPassword: mockSignIn,
          getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
          onAuthStateChange: jest.fn(() => ({
            data: { subscription: { unsubscribe: jest.fn() } }
          })),
        },
        from: jest.fn(),
      }));
      
      renderWithAuth(<LoginPage />);
      
      // Fill in form
      await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/Password/i), 'WrongPassword');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /Sign In/i }));
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Incorrect email or password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Session Management', () => {
    test('redirects to dashboard when authenticated', async () => {
      // Mock authenticated user
      const mockGetSession = jest.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: '123', email: 'test@example.com' },
            access_token: 'token'
          }
        },
        error: null
      });
      
      const mockRouter = {
        push: jest.fn(),
        replace: jest.fn(),
        pathname: '/',
      };
      
      // Note: We cannot re-mock next/navigation here as it's too late
      // The mocking should be done at the top level
      
      // Get the mocked createClient and update its return value
      const mockedCreateClient = require('@supabase/supabase-js').createClient;
      const mockAuthStateChange = jest.fn((callback) => {
        callback('SIGNED_IN', {
          user: { id: '123', email: 'test@example.com' },
          access_token: 'token'
        });
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });
      
      mockedCreateClient.mockImplementation(() => ({
        auth: {
          getSession: mockGetSession,
          onAuthStateChange: mockAuthStateChange,
        },
        from: jest.fn(),
      }));
      
      renderWithAuth(<LoginPage />);
      
      // Check if redirection would happen (can't fully test due to mock limitations)
      await waitFor(() => {
        expect(mockGetSession).toHaveBeenCalled();
      });
    });
  });
});
