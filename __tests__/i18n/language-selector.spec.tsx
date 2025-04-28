import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from '../../hooks/useTranslations';
import LanguageSelector from '../../components/LanguageSelector';
import { saveLanguagePreference } from '../../lib/i18n/languageStorage';
import { locales, localeNames, localeFlags } from '../../i18n';
import { getLocalizedUrl } from '../../lib/i18n/utils';

// Mock required hooks and modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useLocale: jest.fn(),
}));

jest.mock('../../hooks/useTranslations', () => ({
  useTranslations: jest.fn(),
}));

jest.mock('../../lib/i18n/languageStorage', () => ({
  saveLanguagePreference: jest.fn(),
}));

jest.mock('../../lib/i18n/utils', () => ({
  getLocalizedUrl: jest.fn(),
  getLocaleDisplayName: (locale: string) => localeNames[locale as keyof typeof localeNames] || locale,
  getLocaleFlag: (locale: string) => localeFlags[locale as keyof typeof localeFlags] || '🌐',
}));

describe('LanguageSelector', () => {
  // Setup mocks
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };
  
  const mockT = jest.fn().mockImplementation((key: string) => {
    const translations: Record<string, string> = {
      'languageSelector': 'Language',
      'auth.signIn': 'Sign In',
      'auth.signUp': 'Sign Up',
    };
    return translations[key] || key;
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock document.createElement for style injection
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'style') {
        return {
          id: '',
          innerHTML: '',
          appendChild: jest.fn(),
        };
      }
      return document.createElement(tag);
    });
    
    document.head.appendChild = jest.fn();
    
    // Setup default mocks
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/en/dashboard');
    (useLocale as jest.Mock).mockReturnValue('en');
    (useTranslations as jest.Mock).mockReturnValue({ t: mockT });
    (getLocalizedUrl as jest.Mock).mockImplementation((path, locale) => `/${locale}${path.replace(/^\/[^/]+/, '')}`);
    
    // Reset setTimeout
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  
  it('renders the dropdown language selector correctly', () => {
    render(<LanguageSelector type="dropdown" />);
    
    // Should show current language (English)
    const button = screen.getByRole('button', { name: /language/i });
    expect(button).toBeInTheDocument();
    expect(button.textContent).toContain('English');
    
    // Should include the flag emoji
    expect(button.textContent).toContain('🇺🇸');
  });
  
  it('opens the language dropdown when clicked', () => {
    render(<LanguageSelector type="dropdown" />);
    
    // Dropdown should be closed initially
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    
    // Click to open dropdown
    fireEvent.click(screen.getByRole('button', { name: /language/i }));
    
    // Dropdown should now be open
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    
    // Should show all supported languages
    locales.forEach(locale => {
      expect(screen.getByText(localeNames[locale as keyof typeof localeNames])).toBeInTheDocument();
    });
  });
  
  it('changes language when a different option is selected', () => {
    render(<LanguageSelector type="dropdown" />);
    
    // Open dropdown
    fireEvent.click(screen.getByRole('button', { name: /language/i }));
    
    // Click on Portuguese option
    fireEvent.click(screen.getByText('Português (Brasil)'));
    
    // Should save preference
    expect(saveLanguagePreference).toHaveBeenCalledWith('pt-BR');
    
    // Should add transition class
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('language-transition');
    
    // Fast-forward timers
    jest.advanceTimersByTime(150);
    
    // Should navigate
    expect(mockRouter.push).toHaveBeenCalledWith('/pt-BR/dashboard');
    expect(mockRouter.refresh).toHaveBeenCalled();
  });
  
  it('renders the button-style language selector correctly', () => {
    render(<LanguageSelector type="buttons" />);
    
    // Should show a button for each language
    locales.forEach(locale => {
      const button = screen.getByText(localeNames[locale as keyof typeof localeNames]);
      expect(button).toBeInTheDocument();
      
      // Current language should have special styling
      if (locale === 'en') {
        expect(button.getAttribute('aria-current')).toBe('true');
      } else {
        expect(button.getAttribute('aria-current')).toBe('false');
      }
    });
  });
  
  it('handles keyboard navigation correctly', () => {
    render(<LanguageSelector type="dropdown" />);
    
    // Open dropdown
    fireEvent.click(screen.getByRole('button', { name: /language/i }));
    
    // Press Escape to close
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // Dropdown should close
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
