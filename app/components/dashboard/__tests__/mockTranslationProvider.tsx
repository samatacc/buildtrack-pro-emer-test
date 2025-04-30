import React, { ReactNode } from 'react';

// Create a mock context for translations
export const TranslationsContext = React.createContext({
  t: (key: string) => key,
});

interface MockTranslationProviderProps {
  children: ReactNode;
}

// Mock translation provider for testing
export const MockTranslationProvider = ({ children }: MockTranslationProviderProps) => {
  // Simple translation function that returns the key itself for testing
  const t = (key: string) => {
    // Add specific translations for test cases
    const translations: Record<string, string> = {
      'dashboard.widgets.selector.title': 'Add a Widget',
      'dashboard.widgets.selector.description': 'Choose a widget to add to your dashboard',
      'dashboard.widgets.selector.add': 'Add Widget',
      'dashboard.widgets.selector.cancel': 'Cancel',
      'dashboard.widgets.activeProjects.title': 'Active Projects',
      'dashboard.widgets.activeProjects.description': 'View and manage your active projects',
      'dashboard.widgets.projectTimeline.title': 'Project Timeline',
      'dashboard.widgets.projectTimeline.description': 'View project timelines and milestones',
      'dashboard.widgets.sizeSelector.title': 'Select Size',
      'dashboard.widget.sizes.small': 'Small',
      'dashboard.widget.sizes.medium': 'Medium',
      'dashboard.widget.sizes.large': 'Large',
      'dashboard.widgets.actions.resize': 'Resize Widget',
      'dashboard.widgets.actions.remove': 'Remove Widget',
      'dashboard.widgets.actions.settings': 'Widget Settings',
      'dashboard.widgets.actions.hide': 'Hide Widget',
      'dashboard.widgets.actions.show': 'Show Widget',
      'dashboard.widget.confirmRemove': 'Are you sure you want to remove this widget?'
    };

    return translations[key] || key;
  };

  return (
    <TranslationsContext.Provider value={{ t }}>
      {children}
    </TranslationsContext.Provider>
  );
};

// Mock hook for translations
export const useTranslations = () => {
  return { t: (key: string) => React.useContext(TranslationsContext).t(key) };
};
