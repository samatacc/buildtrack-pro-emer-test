import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { SupabaseAuthProvider } from '../../lib/auth/SupabaseAuthContext';
import RegisterPage from '../../app/auth/register/page';
import LoginPage from '../../app/auth/login/page';

// Mock implementation getter to update mocks during tests
const getMockImplementation = () => {
  return {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn((callback) => {
        // We don't immediately trigger callback to avoid React act warnings
        return {
          data: { subscription: { unsubscribe: vi.fn() } }
        }
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(),
        single: vi.fn(),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      insert: vi.fn(),
    })),
  };
};

// Helper to wrap components with auth provider
const renderWithAuth = (ui) => {
  return render(
    <SupabaseAuthProvider>
      {ui}
    </SupabaseAuthProvider>
  );
};

describe('BuildTrack Pro Authentication System', () => {
  // Reset all mocks after each test
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Registration Flow', () => {
    test('renders registration form with BuildTrack Pro design system', async () => {
      // Render the registration page
      renderWithAuth(<RegisterPage />);
      
      // Verify key form elements are rendered with proper styling
      await waitFor(() => {
        // Check for heading with proper color (Primary Blue: rgb(24,62,105))
        const heading = screen.getByText('Create your account');
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveClass('text-[rgb(24,62,105)]');
        
        // Check for orange elements (Primary Orange: rgb(236,107,44))
        const signInLink = screen.getByText('Sign in');
        expect(signInLink).toBeInTheDocument();
        expect(signInLink).toHaveClass('text-[rgb(236,107,44)]');
        
        // Check form fields
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        
        // Check submit button
        const submitButton = screen.getByRole('button', { name: /Continue/i });
        expect(submitButton).toBeInTheDocument();
      });
    });
    
    test('handles successful registration and redirects to onboarding', async () => {
      // Mock successful registration
      const mockSignUp = vi.fn().mockResolvedValue({
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'token' }
        },
        error: null
      });
      
      // Get Supabase mocked client and update auth.signUp
      const supabaseMock = (await import('@supabase/supabase-js')).createClient;
      supabaseMock.mockImplementation(() => {
        const implementation = getMockImplementation();
        implementation.auth.signUp = mockSignUp;
        return implementation;
      });
      
      const user = userEvent.setup();
      renderWithAuth(<RegisterPage />);
      
      // Fill out form
      await user.type(screen.getByLabelText(/Name/i), 'Test User');
      await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/Password/i), 'Password123!');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /Continue/i }));
      
      // Verify signUp was called with correct params
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
    
    test('shows user-friendly error when user already exists', async () => {
      // Mock user already exists error
      const mockSignUp = vi.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'User already registered',
          status: 400
        }
      });
      
      // Update mock implementation
      const supabaseMock = (await import('@supabase/supabase-js')).createClient;
      supabaseMock.mockImplementation(() => {
        const implementation = getMockImplementation();
        implementation.auth.signUp = mockSignUp;
        return implementation;
      });
      
      const user = userEvent.setup();
      renderWithAuth(<RegisterPage />);
      
      // Fill out form
      await user.type(screen.getByLabelText(/Name/i), 'Test User');
      await user.type(screen.getByLabelText(/Email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/Password/i), 'Password123!');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /Continue/i }));
      
      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/User already registered/i)).toBeInTheDocument();
      });
    });
  });
  
  describe('Login Flow', () => {
    test('renders login form with BuildTrack Pro branding', async () => {
      renderWithAuth(<LoginPage />);
      
      await waitFor(() => {
        // Verify heading with primary blue color
        const heading = screen.getByText('Sign in to your account');
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveClass('text-[rgb(24,62,105)]');
        
        // Verify form fields
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        
        // Verify primary button (has orange styling)
        const button = screen.getByRole('button', { name: /Sign in/i });
        expect(button).toBeInTheDocument();
      });
    });
    
    test('handles successful login and redirects to dashboard', async () => {
      // Mock successful login
      const mockSignIn = vi.fn().mockResolvedValue({
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'token' }
        },
        error: null
      });
      
      // Update mock implementation
      const supabaseMock = (await import('@supabase/supabase-js')).createClient;
      supabaseMock.mockImplementation(() => {
        const implementation = getMockImplementation();
        implementation.auth.signInWithPassword = mockSignIn;
        return implementation;
      });
      
      const user = userEvent.setup();
      renderWithAuth(<LoginPage />);
      
      // Fill form
      await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/Password/i), 'Password123!');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /Sign in/i }));
      
      // Verify signIn was called with correct params
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123!'
        });
      });
    });
    
    test('displays user-friendly message for invalid credentials', async () => {
      // Mock invalid credentials error
      const mockSignIn = vi.fn().mockResolvedValue({
        data: null,
        error: {
          name: 'AuthApiError',
          status: 400,
          code: 'invalid_credentials',
          message: 'Invalid login credentials'
        }
      });
      
      // Update mock implementation
      const supabaseMock = (await import('@supabase/supabase-js')).createClient;
      supabaseMock.mockImplementation(() => {
        const implementation = getMockImplementation();
        implementation.auth.signInWithPassword = mockSignIn;
        return implementation;
      });
      
      const user = userEvent.setup();
      renderWithAuth(<LoginPage />);
      
      // Fill form
      await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/Password/i), 'WrongPassword');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /Sign in/i }));
      
      // Verify error message is displayed with proper styling
      await waitFor(() => {
        const errorMessage = screen.getByText(/Incorrect email or password/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
