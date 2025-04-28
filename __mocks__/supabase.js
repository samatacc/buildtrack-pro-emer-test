// Mock for Supabase Auth

const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@buildtrackpro.com',
    user_metadata: {
      first_name: 'Test',
      last_name: 'User'
    }
  },
  access_token: 'mock-token',
  refresh_token: 'mock-refresh-token'
};

// Create mock for createClientComponentClient
export const createClientComponentClient = jest.fn(() => ({
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
    signOut: jest.fn().mockResolvedValue({}),
    onAuthStateChange: jest.fn().mockImplementation((callback) => {
      // Call the callback immediately with authenticated state
      callback('SIGNED_IN', { session: mockSession });
      // Return unsubscribe function
      return () => {};
    }),
    getUser: jest.fn().mockResolvedValue({
      data: { user: mockSession.user },
      error: null
    }),
    updateUser: jest.fn().mockResolvedValue({
      data: { user: mockSession.user },
      error: null
    }),
    admin: {
      getUserById: jest.fn().mockResolvedValue({
        data: { user: mockSession.user },
        error: null
      }),
      updateUserById: jest.fn().mockResolvedValue({
        data: { user: mockSession.user },
        error: null
      })
    }
  },
  from: jest.fn().mockImplementation(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: [] }))),
  }))
}));
