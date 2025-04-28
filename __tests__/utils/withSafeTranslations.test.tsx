import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { withSafeTranslations, WithTranslationsProps } from '@/app/utils/withSafeTranslations';
import { PROFILE_KEYS } from '@/app/constants/translationKeys';

// Mock the useSafeTranslations hook
jest.mock('@/app/hooks/useSafeTranslations', () => ({
  useSafeTranslations: jest.fn((namespace) => {
    return {
      t: (key: string) => {
        // Simulate translations
        if (key === 'error.trigger') {
          throw new Error('Translation error');
        }
        return `${namespace}:${key}`;
      },
      currentLocale: 'en',
      changeLocale: jest.fn()
    };
  })
}));

// Mock the ErrorBoundary component
jest.mock('@/app/components/ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  )
}));

// Test component that uses translations
function TestComponent({ t }: WithTranslationsProps) {
  return (
    <div>
      <h1 data-testid="title">{t('title')}</h1>
      <p data-testid="description">{t('description')}</p>
      <button data-testid="action">{t(PROFILE_KEYS.LANGUAGE)}</button>
    </div>
  );
}

// Create a wrapped version with the HOC
const WrappedComponent = withSafeTranslations(TestComponent, 'test');

describe('withSafeTranslations HOC', () => {
  it('renders the component with translated content', () => {
    render(<WrappedComponent />);
    
    expect(screen.getByTestId('title')).toHaveTextContent('test:title');
    expect(screen.getByTestId('description')).toHaveTextContent('test:description');
    expect(screen.getByTestId('action')).toHaveTextContent('test:language');
  });
  
  it('sets the correct display name for debugging', () => {
    expect(WrappedComponent.displayName).toBe('withSafeTranslations(TestComponent)');
  });
  
  it('wraps the component with an error boundary', () => {
    render(<WrappedComponent />);
    
    const errorBoundary = screen.getByTestId('error-boundary');
    expect(errorBoundary).toBeInTheDocument();
  });
  
  it('allows custom namespaces to be specified', () => {
    const CustomNamespaceComponent = withSafeTranslations(TestComponent, 'custom');
    render(<CustomNamespaceComponent />);
    
    // Content should be prefixed with the custom namespace
    expect(screen.getByTestId('title')).toHaveTextContent('custom:title');
  });
});
