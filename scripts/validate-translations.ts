import fs from 'fs';
import path from 'path';

/**
 * Translation validation script for BuildTrack Pro
 * 
 * This script validates that all translation keys present in the English locale
 * are also present in all other locales. This helps prevent missing translations
 * that could cause runtime errors.
 */

const locales = ['en', 'es', 'fr', 'pt-BR'];
const messagesDir = path.join(process.cwd(), 'messages');

/**
 * Collects all keys from a translation object, flattening nested objects
 * @param obj The translation object
 * @param prefix Current key prefix for nested objects
 * @returns Array of flattened key paths
 */
function collectKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  
  Object.entries(obj).forEach(([key, value]) => {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      // Recursively collect keys from nested objects
      keys = [...keys, ...collectKeys(value, currentKey)];
    } else {
      keys.push(currentKey);
    }
  });
  
  return keys;
}

/**
 * Validates translation files against the English baseline
 */
function validateTranslations() {
  // Load the English translations as the baseline
  const enPath = path.join(messagesDir, 'en.json');
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  
  // Collect all keys from English translations
  const enKeys = collectKeys(enContent);
  console.log(`Found ${enKeys.length} translation keys in English locale`);
  
  let hasErrors = false;
  
  // Check other locales
  locales.filter(locale => locale !== 'en').forEach(locale => {
    const localePath = path.join(messagesDir, `${locale}.json`);
    
    if (!fs.existsSync(localePath)) {
      console.error(`⛔ Error: Translation file for ${locale} does not exist`);
      hasErrors = true;
      return;
    }
    
    try {
      const localeContent = JSON.parse(fs.readFileSync(localePath, 'utf8'));
      const localeKeys = collectKeys(localeContent);
      console.log(`Found ${localeKeys.length} translation keys in ${locale} locale`);
      
      // Find missing keys
      const missingKeys = enKeys.filter(key => !localeKeys.includes(key));
      
      if (missingKeys.length > 0) {
        console.error(`⛔ Missing keys in ${locale}.json:`);
        missingKeys.forEach(key => console.error(`  - ${key}`));
        hasErrors = true;
      } else {
        console.log(`✅ ${locale} translations are complete`);
      }
    } catch (error) {
      console.error(`⛔ Error parsing ${locale}.json:`, error);
      hasErrors = true;
    }
  });
  
  if (hasErrors) {
    console.error('\n⛔ Translation validation failed');
    process.exit(1);
  } else {
    console.log('\n✅ All translations are valid');
  }
}

// Run validation
validateTranslations();
