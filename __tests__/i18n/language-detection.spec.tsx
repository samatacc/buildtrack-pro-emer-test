import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import LanguageDetector from '../../components/LanguageDetector';
import { getLanguagePreference, saveLanguagePreference } from '../../lib/i18n/languageStorage';

// Mock the required hooks and modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useLocale: jest.fn(),
}));

jest.mock('../../lib/i18n/languageStorage', () => ({
  getLanguagePreference: jest.fn(),
  saveLanguagePreference: jest.fn(),
}));

describe('LanguageDetector', () => {
  // Setup mocks for each test
  const mockRouter = {
    replace: jest.fn(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocale as jest.Mock).mockReturnValue('en');
    (getLanguagePreference as jest.Mock).mockReturnValue(null);
    
    // Mock navigator language for testing
    Object.defineProperty(window.navigator, 'language', {
      value: 'en-US',
      configurable: true,
    });
  });
  
  it('should not redirect when pathname is undefined', () => {
    (usePathname as jest.Mock).mockReturnValue(undefined);
    
    render(<LanguageDetector />);
    
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
  
  it('should not redirect when current URL already has valid locale', () => {
    (usePathname as jest.Mock).mockReturnValue('/en/dashboard');
    
    render(<LanguageDetector />);
    
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
  
  it('should redirect to saved language preference', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    (getLanguagePreference as jest.Mock).mockReturnValue('fr');
    
    render(<LanguageDetector />);
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/fr/dashboard', { scroll: false });
    expect(saveLanguagePreference).toHaveBeenCalledWith('fr');
  });
  
  it('should redirect based on browser language when no preference exists', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    (getLanguagePreference as jest.Mock).mockReturnValue(null);
    
    // Set browser language to pt-BR
    Object.defineProperty(window.navigator, 'language', {
      value: 'pt-BR',
      configurable: true,
    });
    
    render(<LanguageDetector />);
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/pt-BR/dashboard', { scroll: false });
    expect(saveLanguagePreference).toHaveBeenCalledWith('pt-BR');
  });
  
  it('should default to "en" when browser language is not supported', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    (getLanguagePreference as jest.Mock).mockReturnValue(null);
    
    // Set browser language to an unsupported locale
    Object.defineProperty(window.navigator, 'language', {
      value: 'de-DE',
      configurable: true,
    });
    
    render(<LanguageDetector />);
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/en/dashboard', { scroll: false });
    expect(saveLanguagePreference).toHaveBeenCalledWith('en');
  });
  
  it('should save URL locale as preference when it is valid', () => {
    (usePathname as jest.Mock).mockReturnValue('/es/dashboard');
    
    render(<LanguageDetector />);
    
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(saveLanguagePreference).toHaveBeenCalledWith('es');
  });
});
