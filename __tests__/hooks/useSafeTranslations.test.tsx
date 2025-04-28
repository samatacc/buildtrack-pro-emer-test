import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSafeTranslations } from '@/app/hooks/useSafeTranslations';

// Mock the next-intl useTranslations hook
jest.mock('next-intl', () => ({
  useTranslations: jest.fn((namespace) => {
    return (key: string) => {
      // Simulate missing key behavior by throwing an error
      if (key === 'missing.key') {
        throw new Error('Missing message');
      }
      // Return the key and namespace for successful translations
      return `${namespace}.${key}`;
    };
  })
}));

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn()
  }),
  usePathname: () => '/en/dashboard'
}));

// Test component that uses the hook
function TestComponent({ namespace = 'common', testKey = 'test.key' }) {
  const { t } = useSafeTranslations(namespace);
  return <div data-testid="translation">{t(testKey)}</div>;
}

describe('useSafeTranslations', () => {
  it('returns translations for valid keys', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('translation')).toHaveTextContent('common.test.key');
  });

  it('returns fallback content for missing keys', () => {
    render(<TestComponent testKey="missing.key" />);
    expect(screen.getByTestId('translation')).toHaveTextContent('key');
  });

  it('works with different namespaces', () => {
    render(<TestComponent namespace="profile" />);
    expect(screen.getByTestId('translation')).toHaveTextContent('profile.test.key');
  });

  it('logs a warning for missing keys', () => {
    // Spy on console.warn
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    render(<TestComponent testKey="missing.key" />);
    
    // Verify warning was logged
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Translation key not found: common.missing.key')
    );
    
    // Restore console.warn
    consoleWarnSpy.mockRestore();
  });
});
