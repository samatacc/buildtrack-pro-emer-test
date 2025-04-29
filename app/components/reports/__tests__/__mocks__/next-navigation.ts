// Mock implementation for Next.js navigation
const useRouter = jest.fn().mockImplementation(() => ({
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  pathname: '/dashboard/reports',
  query: {},
  asPath: '/dashboard/reports',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  }
}));

module.exports = {
  useRouter
};
