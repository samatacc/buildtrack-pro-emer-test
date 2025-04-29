// Import Jest DOM matchers
import '@testing-library/jest-dom';
import 'jest-fetch-mock';
import { toHaveNoViolations } from 'jest-axe';

// Add jest-axe matcher
expect.extend(toHaveNoViolations);

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

// Mock internationalization hooks
jest.mock('@/app/hooks/useNamespacedTranslations', () => ({
  useNamespacedTranslations: (namespace) => ({
    t: (key) => `${namespace}.${key}`,
    locale: 'en',
    formatDate: (date) => new Date(date).toLocaleDateString('en-US'),
    formatNumber: (num) => num.toLocaleString('en-US'),
    formatCurrency: (num) => `$${num.toLocaleString('en-US')}`
  })
}));

// Mock FieldModeProvider
jest.mock('@/app/components/mobile/FieldModeProvider', () => ({
  useFieldMode: () => ({
    isFieldModeEnabled: false,
    isOnline: true,
    isLowDataMode: false,
    batteryLevel: 100,
    toggleFieldMode: jest.fn(),
    toggleLowDataMode: jest.fn()
  })
}));

// Mock chart rendering for reports testing
class MockCanvasRenderingContext2D {
  constructor() {
    this.canvas = {
      width: 300,
      height: 150
    };
    // Add mock methods for all canvas operations
    this.clearRect = jest.fn();
    this.fillRect = jest.fn();
    this.fillText = jest.fn();
    this.beginPath = jest.fn();
    this.closePath = jest.fn();
    this.arc = jest.fn();
    this.fill = jest.fn();
    this.stroke = jest.fn();
    this.moveTo = jest.fn();
    this.lineTo = jest.fn();
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.lineWidth = 1;
    this.textAlign = 'start';
    this.textBaseline = 'alphabetic';
    this.font = '10px sans-serif';
  }
}

// Mock HTMLCanvasElement prototype
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => new MockCanvasRenderingContext2D());
