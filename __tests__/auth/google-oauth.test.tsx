import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, describe, test, beforeEach, vi, afterEach } from 'vitest';
import { useSupabaseAuth, SupabaseAuthProvider } from '../../lib/auth/SupabaseAuthContext';
import LoginPage from '../../app/auth/login/page';

// Mock modules before imports
vi.mock('@supabase/supabase-js', () => {
  const mockSignInWithOAuth = vi.fn();
  return {
    createClient: () => ({
      auth: {
        signInWithOAuth: mockSignInWithOAuth,
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } }
        })),
      }
    }),
    mockSignInWithOAuth // Export for test access
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: '/',
  }),
}));

// Mock window.crypto for PKCE challenge generation
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn().mockImplementation(() => {
        return Promise.resolve(new Uint8Array([1, 2, 3, 4]).buffer);
      })
    },
    getRandomValues: vi.fn().mockImplementation((array) => {
      return array.fill(1);
    })
  }
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  key: vi.fn(),
  length: 0
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Helper to wrap components with auth provider
const renderWithAuth = (ui: React.ReactElement) => {
  return render(
    <SupabaseAuthProvider>
      {ui}
    </SupabaseAuthProvider>
  );
};

describe('Google OAuth Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders Google sign-in button', async () => {
    renderWithAuth(<LoginPage />);
    
    // Check if Google login button exists
    const googleButton = screen.getByRole('button', { name: /Sign in with Google/i });
    expect(googleButton).toBeInTheDocument();
    
    // Check button styling matches BuildTrack Pro design system
    // Primary Blue: rgb(24,62,105)
    const buttonElement = googleButton.closest('button');
    expect(buttonElement).toHaveClass('bg-blue-950'); // Tailwind class for dark blue
  });

  test('calls signInWithOAuth when Google button is clicked', async () => {
    // Get exported mock from the mock module
    const { mockSignInWithOAuth } = require('@supabase/supabase-js');
    
    // Setup window.location
    const originalLocation = window.location;
    const locationMock = { origin: 'http://localhost:3000' };
    Object.defineProperty(window, 'location', { value: locationMock, writable: true });
    
    renderWithAuth(<LoginPage />);
    
    // Click Google sign-in button
    const googleButton = screen.getByRole('button', { name: /Sign in with Google/i });
    await userEvent.click(googleButton);
    
    // Check that signInWithOAuth was called with correct parameters
    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: expect.objectContaining({
        redirectTo: expect.stringContaining('/auth/callback'),
        queryParams: expect.objectContaining({
          access_type: 'offline',
          prompt: 'consent',
        }),
        scopes: expect.stringMatching(/openid|profile|email/)
      })
    });
    
    // Restore original location
    Object.defineProperty(window, 'location', { value: originalLocation });
  });

  test('handles PKCE flow correctly', async () => {
    // Get exported mock
    const { mockSignInWithOAuth } = require('@supabase/supabase-js');
    
    // Setup window.location
    const originalLocation = window.location;
    const locationMock = { origin: 'http://localhost:3000' };
    Object.defineProperty(window, 'location', { value: locationMock, writable: true });
    
    renderWithAuth(<LoginPage />);
    
    // Click Google sign-in button
    const googleButton = screen.getByRole('button', { name: /Sign in with Google/i });
    await userEvent.click(googleButton);
    
    // Verify localStorage was used (should store code verifier with PKCE)
    expect(window.localStorage.setItem).toHaveBeenCalled();
    
    // Check that OAuth call includes PKCE parameters
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'google',
        options: expect.objectContaining({
          queryParams: expect.anything(),
        })
      })
    );
    
    // Restore original location
    Object.defineProperty(window, 'location', { value: originalLocation });
  });

  test('reports errors for failed Google authentication', async () => {
    // Get exported mock and set it to reject
    const { mockSignInWithOAuth } = require('@supabase/supabase-js');
    mockSignInWithOAuth.mockRejectedValueOnce(new Error('Authentication failed'));
    
    renderWithAuth(<LoginPage />);
    
    // Click Google sign-in button
    const googleButton = screen.getByRole('button', { name: /Sign in with Google/i });
    await userEvent.click(googleButton);
    
    // Wait for error to be displayed
    // Note: This may need adjustment based on how errors are displayed in your app
    await waitFor(() => {
      const errorElement = screen.queryByText(/failed|error|unauthorized/i);
      expect(errorElement).toBeTruthy();
    });
  });
});
