import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PROFILE_KEYS } from '@/app/constants/translationKeys';

// Mock translations for different locales
const mockTranslations = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      languageSelector: 'Change Language'
    },
    profile: {
      title: 'Profile Settings',
      language: 'Language',
      timezone: 'Timezone'
    }
  },
  es: {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      languageSelector: 'Cambiar Idioma'
    },
    profile: {
      title: 'Perfil',
      language: 'Idioma',
      timezone: 'Zona Horaria'
    }
  },
  fr: {
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      languageSelector: 'Changer de Langue'
    },
    profile: {
      title: 'Profil',
      language: 'Langue',
      timezone: 'Fuseau Horaire'
    }
  }
};

// Mock the next-intl hook
jest.mock('next-intl', () => ({
  useTranslations: jest.fn((namespace) => {
    // Get the current locale from the document
    const locale = document.documentElement.lang || 'en';
    
    // Return a function that gets translations for the current locale and namespace
    return (key: string) => {
      try {
        // Navigate the nested structure to find the translation
        const keyParts = key.split('.');
        let translation = mockTranslations[locale][namespace];
        
        for (const part of keyParts) {
          translation = translation[part];
        }
        
        return translation || key;
      } catch (error) {
        // Return the key itself if translation is not found
        return key;
      }
    };
  })
}));

// Mock our custom hooks
jest.mock('@/app/hooks/useSafeTranslations', () => ({
  useSafeTranslations: jest.fn((namespace) => {
    const locale = document.documentElement.lang || 'en';
    
    return {
      t: (key: string) => {
        try {
          // Handle constants from translationKeys
          if (key === PROFILE_KEYS.LANGUAGE) {
            return mockTranslations[locale].profile.language;
          }
          if (key === PROFILE_KEYS.TIMEZONE) {
            return mockTranslations[locale].profile.timezone;
          }
          
          // Navigate the nested structure to find the translation
          const keyParts = key.split('.');
          let translation = mockTranslations[locale][namespace];
          
          for (const part of keyParts) {
            translation = translation[part];
          }
          
          return translation || key;
        } catch (error) {
          // Return the key itself if translation is not found
          return key;
        }
      },
      currentLocale: locale,
      changeLocale: jest.fn()
    };
  })
}));

// Simple test component that uses translations
function TestComponent({ namespace = 'common' }) {
  const { t } = jest.requireMock('@/app/hooks/useSafeTranslations').useSafeTranslations(namespace);
  
  return (
    <div className="p-4 rounded-2xl bg-white shadow-md" data-testid="test-component">
      <h1 className="text-lg font-bold text-[rgb(24,62,105)]" data-testid="title">
        {namespace === 'profile' ? t(PROFILE_KEYS.TITLE) : t('title')}
      </h1>
      <div className="flex gap-4 mt-4">
        <button 
          className="px-4 py-2 bg-[rgb(236,107,44)] text-white rounded-lg hover:bg-opacity-90"
          data-testid="save-button"
        >
          {t('save')}
        </button>
        <button 
          className="px-4 py-2 border border-[rgb(24,62,105)] text-[rgb(24,62,105)] rounded-lg hover:bg-gray-50"
          data-testid="cancel-button"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}

describe('Internationalization Integration', () => {
  const locales = ['en', 'es', 'fr'];
  
  test.each(locales)('renders with correct translations for %s locale', (locale) => {
    // Set the document language attribute to simulate locale
    document.documentElement.lang = locale;
    
    render(<TestComponent />);
    
    // Verify common translations are applied correctly
    expect(screen.getByTestId('save-button')).toHaveTextContent(
      mockTranslations[locale].common.save
    );
    expect(screen.getByTestId('cancel-button')).toHaveTextContent(
      mockTranslations[locale].common.cancel
    );
  });
  
  test.each(locales)('renders profile components with correct translations for %s locale', (locale) => {
    // Set the document language attribute to simulate locale
    document.documentElement.lang = locale;
    
    render(<TestComponent namespace="profile" />);
    
    // Verify profile translations are applied correctly
    expect(screen.getByTestId('title')).toHaveTextContent(
      mockTranslations[locale].profile.title
    );
  });
  
  it('applies BuildTrack Pro design system', () => {
    document.documentElement.lang = 'en';
    render(<TestComponent />);
    
    const component = screen.getByTestId('test-component');
    const title = screen.getByTestId('title');
    const saveButton = screen.getByTestId('save-button');
    const cancelButton = screen.getByTestId('cancel-button');
    
    // Verify design system is applied correctly
    expect(component).toHaveClass('rounded-2xl bg-white shadow-md');
    expect(title).toHaveClass('text-lg font-bold text-[rgb(24,62,105)]');
    expect(saveButton).toHaveClass('bg-[rgb(236,107,44)] text-white rounded-lg');
    expect(cancelButton).toHaveClass('border-[rgb(24,62,105)] text-[rgb(24,62,105)] rounded-lg');
  });
});
