// Import Jest DOM matchers
import '@testing-library/jest-dom';
import 'jest-fetch-mock';

// Enable fetch mocks
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();
beforeEach(() => {
  fetchMock.resetMocks();
});

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

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}));

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.OPENAI_ORG_ID = 'test-org-id';
process.env.OPENAI_PROJECT_ID = 'test-project-id';
process.env.NEXT_PUBLIC_ENABLE_MOCK_IMAGES = 'true';
process.env.NEXT_PUBLIC_FEATURE_MOCK_IMAGES = 'true';

// Mock file system for image saving
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn().mockReturnValue('{"images":[]}')
}));
