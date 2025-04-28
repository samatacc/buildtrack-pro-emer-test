# BuildTrack Pro Internationalization Architecture

## Overview

This document outlines BuildTrack Pro's internationalization (i18n) architecture, patterns, and best practices. Our i18n system is designed to serve construction professionals in multiple regions, ensuring they can access the platform in their preferred language while maintaining a consistent, high-performance experience on all devices, especially mobile.

## Architecture Components

### 1. Core Framework Integration

BuildTrack Pro uses [next-intl](https://next-intl-docs.vercel.app/) integrated with Next.js's App Router for internationalization:

```
/app
  /[locale]           # Dynamic locale segment for all routes
    /marketing        # Marketing site routes
    /dashboard        # Dashboard routes
    /auth             # Authentication routes
    /...              # Other routes
```

This structure ensures that:
- All URLs include the locale parameter (e.g., `/en/dashboard`, `/pt-BR/projects`)
- Translations load only for the active locale
- Server-side rendering (SSR) works correctly with translations

### 2. Translation Management

Translation files are stored in the `/messages` directory:

```
/messages
  /en.json           # English (default)
  /pt-BR.json        # Brazilian Portuguese
  /es.json           # Spanish
  /fr.json           # French
```

Each translation file follows a namespace structure:
```json
{
  "common": {
    "appName": "BuildTrack Pro",
    "welcome": "Welcome"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "projects": "Projects"
  },
  "auth": {
    "signIn": "Sign In",
    "signUp": "Sign Up"
  }
}
```

### 3. Utility Structure

Our i18n utilities are organized as follows:

- **`i18n.ts`**: Root configuration file defining supported locales and display names
- **`lib/i18n/utils.ts`**: Core utility functions for i18n operations
- **`lib/i18n/languageStorage.ts`**: Manages language preference persistence
- **`hooks/useTranslations.ts`**: Custom hook for accessing translations
- **`components/LanguageSelector.tsx`**: UI component for switching languages
- **`components/LanguageDetector.tsx`**: Automatic language detection and redirection

### 4. Configuration

The i18n configuration in `i18n.ts` defines:

- Supported locales (`en`, `pt-BR`, `es`, `fr`)
- Default locale (`en`)
- Locale display names and flags
- Text direction support (LTR for all current languages)

### 5. Middleware Integration

The internationalization middleware (`middleware.ts`) manages:

- URL normalization with locale prefixes
- Default locale redirection
- 404 handling for unsupported locales

## Key Components and Utilities

### 1. The `useTranslations` Hook

```typescript
const { t } = useTranslations('namespace');
t('key'); // Retrieves translation with fallback support
```

Special features:
- Namespace support with dot notation (`navigation.dashboard`)
- Error handling for missing translations
- Type safety for translation keys
- Interpolation support (`t('welcome', { name: 'User' })`)

### 2. Language Detection

The `LanguageDetector` component implements a preference hierarchy:

1. User's saved preference (cookie or profile)
2. Browser language setting
3. Default locale (English)

It automatically redirects first-time visitors to their preferred language.

### 3. Language Selector

The `LanguageSelector` component provides:

- Dropdown or button-based language selection
- Visual indicators (flags, language names)
- Smooth transitions between languages
- Mobile-optimized design
- Keyboard and screen reader accessibility

### 4. Language Storage

The `languageStorage` module:

- Persists language preferences in cookies
- Synchronizes with user profiles when authenticated
- Manages preference expiration and security settings

## Implementation Guidelines

### Adding a New Language

To add a new supported language:

1. Update `i18n.ts` to add the locale to the `locales` array
2. Add locale display name and flag emoji
3. Create a new translation file in `/messages/{locale}.json`
4. Run the translation completeness test to identify missing keys
5. Update tests to include the new locale

Example:
```typescript
// Adding German
export const locales = ['en', 'pt-BR', 'es', 'fr', 'de'];

export const localeNames = {
  en: 'English',
  'pt-BR': 'Português (Brasil)',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
};

export const localeFlags = {
  en: '🇺🇸',
  'pt-BR': '🇧🇷',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
};
```

### Creating New Translations

When creating new UI elements:

1. **Never** hardcode text strings in components
2. Add keys to all locale files at the same time
3. Use appropriate namespaces for organization
4. Add JSDoc comments for context where needed
5. Use variables for dynamic content

Example:
```typescript
// Bad
<Button>Cancel</Button>

// Good
<Button>{t('common.buttons.cancel')}</Button>
```

### Variable Interpolation

For dynamic content:

```typescript
// In translation file
{
  "project": {
    "welcome": "Welcome to project {name}"
  }
}

// In component
t('project.welcome', { name: projectName })
```

### Pluralization

For count-dependent messages:

```typescript
// In translation file
{
  "tasks": {
    "count": "{count, plural, =0{No tasks} one{1 task} other{# tasks}}"
  }
}

// In component
t('tasks.count', { count: taskCount })
```

## Best Practices

### 1. Mobile-First Considerations

- Test all translations on small screens
- Allow for text expansion in translated content
- Use flexible layouts that accommodate different text lengths
- Implement appropriate text truncation when necessary

### 2. Performance Optimization

- Import translations only for the current locale
- Lazy-load translations for rarely accessed routes
- Use the built-in caching mechanisms
- Monitor bundle size impact of translation files

### 3. Accessibility (WCAG 2.1 AA)

- Include proper `lang` attributes on HTML elements
- Ensure sufficient color contrast in all languages
- Make language selector fully keyboard accessible
- Support screen readers with appropriate ARIA attributes
- Maintain focus management during language changes

### 4. Construction Industry Terminology

- Maintain a glossary of industry-specific terms
- Ensure consistent translation of technical terms
- Involve domain experts in reviewing translations
- Consider regional variations for construction terminology

### 5. Design Consistency

- Follow BuildTrack Pro's design system for all language variants
- Maintain the primary color scheme (Blue: rgb(24,62,105), Orange: rgb(236,107,44))
- Use consistent animations and transitions
- Apply neumorphism and glassmorphism effects consistently

## Testing and Quality Assurance

- Run the automated test suite after adding new translations
- Use snapshot testing for UI components with translations
- Maintain visual regression tests for layout stability
- Test language switching on all supported devices
- Verify form validation works correctly in all languages

## Troubleshooting Common Issues

### Missing Translations

If "MISSING_MESSAGE" appears in the UI:
1. Check the message key path
2. Verify the namespace is correct
3. Add the missing key to all locale files
4. Run the translation completeness test

### Layout Issues

If text overflows or breaks layouts:
1. Use flexible container sizing
2. Implement text truncation with tooltips
3. Consider using auto-sizing techniques
4. Test with languages that typically have longer words

### Performance Problems

If translations cause performance issues:
1. Check bundle sizes for translation files
2. Consider splitting large translation files into modules
3. Implement code-splitting for routes with large translation needs
4. Optimize the language detection and switching process

## Future Enhancements

- Right-to-left (RTL) language support
- Machine translation API integration for user-generated content
- Translation memory system to maintain consistency
- Collaborative translation workflow tools
- Enhanced analytics for language usage patterns
