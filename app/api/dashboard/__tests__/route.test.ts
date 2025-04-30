import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '../route';
import { WidgetType, WidgetSize } from '@/lib/types/widget';

// Mock the NextRequest class
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextRequest: vi.fn(),
    NextResponse: {
      json: vi.fn((data, options) => ({ data, options }))
    }
  };
});

// Mock the Supabase client
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              preferences: {
                dashboards: [{
                  id: 'default',
                  name: 'Default Dashboard',
                  isDefault: true,
                  widgets: [
                    {
                      id: 'test-widget-1',
                      type: WidgetType.ACTIVE_PROJECTS,
                      size: WidgetSize.MEDIUM,
                      title: 'Active Projects',
                      isVisible: true
                    }
                  ],
                  layouts: {
                    desktop: [
                      { i: 'test-widget-1', x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 2 }
                    ],
                    tablet: [],
                    mobile: []
                  }
                }]
              }
            },
            error: null
          }))
        }))
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }))
}));

// Mock the cookies module
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn()
  })
}));

describe('Dashboard API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET handler', () => {
    it('returns the requested dashboard', async () => {
      // Setup the mock request
      const mockRequest = new NextRequest('http://localhost:3000/api/dashboard?id=default');
      (mockRequest as any).nextUrl = {
        searchParams: new URLSearchParams('id=default')
      };

      // Call the API handler
      const response = await GET(mockRequest);

      // Check response
      expect(response).toHaveProperty('data.dashboard.id', 'default');
      expect(response).toHaveProperty('data.dashboard.widgets');
      expect(response.data.dashboard.widgets).toHaveLength(1);
      expect(response.data.dashboard.widgets[0].id).toBe('test-widget-1');
    });

    it('handles unauthorized requests', async () => {
      // Setup the mock request
      const mockRequest = new NextRequest('http://localhost:3000/api/dashboard');
      (mockRequest as any).nextUrl = {
        searchParams: new URLSearchParams()
      };

      // Override auth mock to return error
      const mockAuthGetUser = vi.fn(() => Promise.resolve({
        data: { user: null },
        error: new Error('Unauthorized')
      }));

      const createClientMock = require('@supabase/auth-helpers-nextjs').createRouteHandlerClient;
      createClientMock.mockReturnValueOnce({
        auth: {
          getUser: mockAuthGetUser
        }
      });

      // Call the API handler
      const response = await GET(mockRequest);

      // Check response
      expect(response).toHaveProperty('options.status', 401);
      expect(response).toHaveProperty('data.error', 'Unauthorized');
    });

    it('handles missing dashboards', async () => {
      // Setup the mock request
      const mockRequest = new NextRequest('http://localhost:3000/api/dashboard?id=nonexistent');
      (mockRequest as any).nextUrl = {
        searchParams: new URLSearchParams('id=nonexistent')
      };

      // Call the API handler
      const response = await GET(mockRequest);

      // Check response
      expect(response).toHaveProperty('data.dashboard', null);
    });
  });

  describe('POST handler', () => {
    it('saves dashboard configuration', async () => {
      // Setup the mock request with request body
      const mockDashboard = {
        id: 'default',
        name: 'Updated Dashboard',
        widgets: []
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/dashboard', {
        method: 'POST',
        body: JSON.stringify({ dashboard: mockDashboard })
      });

      // Mock the json method
      mockRequest.json = vi.fn().mockResolvedValue({ dashboard: mockDashboard });

      // Call the API handler
      const response = await POST(mockRequest);

      // Check response
      expect(response).toHaveProperty('data.success', true);
      expect(response).toHaveProperty('data.dashboardId', 'default');

      // Check the upsert operation was called
      const supabaseMock = require('@supabase/auth-helpers-nextjs').createRouteHandlerClient();
      const upsertMock = supabaseMock.from().upsert;
      expect(upsertMock).toHaveBeenCalled();
    });

    it('handles unauthorized requests', async () => {
      // Setup the mock request
      const mockRequest = new NextRequest('http://localhost:3000/api/dashboard', {
        method: 'POST',
        body: JSON.stringify({ dashboard: {} })
      });

      // Mock the json method
      mockRequest.json = vi.fn().mockResolvedValue({ dashboard: {} });

      // Override auth mock to return error
      const mockAuthGetUser = vi.fn(() => Promise.resolve({
        data: { user: null },
        error: new Error('Unauthorized')
      }));

      const createClientMock = require('@supabase/auth-helpers-nextjs').createRouteHandlerClient;
      createClientMock.mockReturnValueOnce({
        auth: {
          getUser: mockAuthGetUser
        }
      });

      // Call the API handler
      const response = await POST(mockRequest);

      // Check response
      expect(response).toHaveProperty('options.status', 401);
      expect(response).toHaveProperty('data.error', 'Unauthorized');
    });

    it('handles invalid dashboard data', async () => {
      // Setup the mock request with invalid dashboard data
      const mockRequest = new NextRequest('http://localhost:3000/api/dashboard', {
        method: 'POST',
        body: JSON.stringify({ dashboard: null })
      });

      // Mock the json method
      mockRequest.json = vi.fn().mockResolvedValue({ dashboard: null });

      // Call the API handler
      const response = await POST(mockRequest);

      // Check response
      expect(response).toHaveProperty('options.status', 400);
      expect(response).toHaveProperty('data.error', 'Invalid dashboard data');
    });
  });
});
