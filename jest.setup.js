// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => {
  const originalModule = jest.requireActual('@supabase/supabase-js');
  return {
    ...originalModule,
    createClient: () => ({
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        getSession: jest.fn(),
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
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
    }),
  };
});
