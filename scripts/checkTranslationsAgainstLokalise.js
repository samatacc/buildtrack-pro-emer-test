/**
 * Check Translations Against Lokalise
 * 
 * This script compares local translation files with Lokalise to identify:
 * 1. Missing keys in Lokalise that exist locally
 * 2. Missing keys locally that exist in Lokalise
 * 3. Inconsistencies between environments
 * 
 * Follows BuildTrack Pro's mobile-first and accessibility principles
 * by ensuring translations are complete for all UI components.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

// Read configuration from TypeScript file
const configPath = path.join(__dirname, '../app/utils/lokaliseConfig.ts');
const configContent = fs.readFileSync(configPath, 'utf8');

// Extract config values
const apiKeyMatch = configContent.match(/apiKey: process\.env\.([A-Z_]+)/);
const projectIdMatch = configContent.match(/projectId: process\.env\.([A-Z_]+)/);
const localesMatch = configContent.match(/supportedLocales: \[(.*?)\]/);

const apiKeyEnvVar = apiKeyMatch ? apiKeyMatch[1] : 'LOKALISE_API_KEY';
const projectIdEnvVar = projectIdMatch ? projectIdMatch[1] : 'LOKALISE_PROJECT_ID';
const supportedLocales = localesMatch 
  ? localesMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''))
  : ['en', 'es', 'fr', 'pt-BR'];

// Get API key and project ID from environment variables
const apiKey = process.env[apiKeyEnvVar];
const projectId = process.env[projectIdEnvVar];

if (!apiKey || !projectId) {
  console.error(`Error: Missing required environment variables: ${apiKeyEnvVar} and/or ${projectIdEnvVar}`);
  console.error('Make sure these are set in your environment or .env file');
  process.exit(1);
}

/**
 * Extract all keys from a nested JSON object
 * @param {Object} obj - The JSON object to extract keys from
 * @param {string} prefix - Current key prefix
 * @param {Set} keysSet - Set to collect keys
 */
function extractKeysFromJson(obj, prefix = '', keysSet = new Set()) {
  for (const [key, value] of Object.entries(obj)) {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      // Recursively process nested objects
      extractKeysFromJson(value, currentKey, keysSet);
    } else {
      // Add leaf node (actual translation) to set
      keysSet.add(currentKey);
    }
  }
  return keysSet;
}

/**
 * Get keys from local translation files
 */
async function getLocalTranslationKeys() {
  console.log('📁 Reading local translation files...');
  
  const messagesDir = path.join(__dirname, '../messages');
  const localKeysMap = {};
  
  // Check if messages directory exists
  if (!fs.existsSync(messagesDir)) {
    console.error(`❌ Messages directory not found at ${messagesDir}`);
    process.exit(1);
  }
  
  // Process each supported locale
  for (const locale of supportedLocales) {
    const localeFilePath = path.join(messagesDir, `${locale}.json`);
    
    if (fs.existsSync(localeFilePath)) {
      try {
        const fileContent = fs.readFileSync(localeFilePath, 'utf8');
        const translations = JSON.parse(fileContent);
        
        // Extract all keys from this locale file
        const keysSet = extractKeysFromJson(translations);
        localKeysMap[locale] = keysSet;
        
        console.log(`✅ Found ${keysSet.size} keys for locale '${locale}'`);
      } catch (error) {
        console.error(`❌ Error processing ${localeFilePath}:`, error.message);
      }
    } else {
      console.warn(`⚠️ Warning: Translation file for locale '${locale}' not found locally`);
      localKeysMap[locale] = new Set();
    }
  }
  
  return localKeysMap;
}

/**
 * Get translation keys from Lokalise
 */
async function getLokaliseTranslationKeys() {
  console.log('🌍 Fetching translation keys from Lokalise...');
  
  // Get all keys from Lokalise
  const lokaliseKeysMap = {};
  let page = 1;
  let limit = 500; // Max allowed by Lokalise API
  let totalPages = 1;
  
  // Process all supported locales first
  for (const locale of supportedLocales) {
    lokaliseKeysMap[locale] = new Set();
  }
  
  // Paginate through all keys
  while (page <= totalPages) {
    // API request options for Lokalise
    const options = {
      hostname: 'api.lokalise.com',
      path: `/api2/projects/${projectId}/keys?limit=${limit}&page=${page}&include_translations=1`,
      method: 'GET',
      headers: {
        'X-Api-Token': apiKey
      }
    };
    
    // Make the request to Lokalise API
    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(new Error(`Failed to parse response: ${error.message}`));
            }
          } else {
            reject(new Error(`Request failed with status code ${res.statusCode}: ${data}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    });
    
    if (response && response.keys) {
      // Set total pages from response pagination
      if (response.pagination) {
        totalPages = response.pagination.total_pages;
      }
      
      // Process each key
      for (const key of response.keys) {
        const keyName = key.key_name.web;
        
        // Process translations for this key
        if (key.translations) {
          for (const translation of key.translations) {
            const locale = translation.language_iso;
            
            // Only process translations for our supported locales
            if (supportedLocales.includes(locale) && translation.translation) {
              if (!lokaliseKeysMap[locale]) {
                lokaliseKeysMap[locale] = new Set();
              }
              
              lokaliseKeysMap[locale].add(keyName);
            }
          }
        }
      }
      
      console.log(`✅ Processed page ${page}/${totalPages} from Lokalise`);
      page++;
    } else {
      console.error('❌ Failed to fetch keys from Lokalise:', response);
      break;
    }
  }
  
  // Log summary
  for (const locale of supportedLocales) {
    console.log(`✅ Found ${lokaliseKeysMap[locale]?.size || 0} keys for locale '${locale}' in Lokalise`);
  }
  
  return lokaliseKeysMap;
}

/**
 * Compare local and Lokalise translation keys
 */
function compareTranslationKeys(localKeysMap, lokaliseKeysMap) {
  console.log('\n📊 Comparing translation keys between local files and Lokalise...');
  
  let hasIssues = false;
  
  for (const locale of supportedLocales) {
    const localKeys = localKeysMap[locale] || new Set();
    const lokaliseKeys = lokaliseKeysMap[locale] || new Set();
    
    // Convert Sets to Arrays for easier comparison
    const localKeysArray = Array.from(localKeys);
    const lokaliseKeysArray = Array.from(lokaliseKeys);
    
    // Find missing keys in each direction
    const missingInLokalise = localKeysArray.filter(key => !lokaliseKeys.has(key));
    const missingLocally = lokaliseKeysArray.filter(key => !localKeys.has(key));
    
    if (missingInLokalise.length > 0 || missingLocally.length > 0) {
      hasIssues = true;
      
      console.log(`\n🔍 Issues found for locale '${locale}':`);
      
      if (missingInLokalise.length > 0) {
        console.log(`  ❌ Keys missing in Lokalise: ${missingInLokalise.length}`);
        
        // Limit output to first 10 keys to avoid cluttering the terminal
        const keysToShow = missingInLokalise.slice(0, 10);
        keysToShow.forEach(key => console.log(`    - ${key}`));
        
        if (missingInLokalise.length > 10) {
          console.log(`    ... and ${missingInLokalise.length - 10} more`);
        }
      }
      
      if (missingLocally.length > 0) {
        console.log(`  ❌ Keys missing locally: ${missingLocally.length}`);
        
        // Limit output to first 10 keys
        const keysToShow = missingLocally.slice(0, 10);
        keysToShow.forEach(key => console.log(`    - ${key}`));
        
        if (missingLocally.length > 10) {
          console.log(`    ... and ${missingLocally.length - 10} more`);
        }
      }
    } else {
      console.log(`✅ All keys match for locale '${locale}'`);
    }
  }
  
  return hasIssues;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting translation check against Lokalise...');
  
  try {
    const localKeysMap = await getLocalTranslationKeys();
    const lokaliseKeysMap = await getLokaliseTranslationKeys();
    
    const hasIssues = compareTranslationKeys(localKeysMap, lokaliseKeysMap);
    
    if (hasIssues) {
      console.log('\n⚠️ Translation inconsistencies found! Consider running:');
      console.log('  - npm run upload-translations (to push missing keys to Lokalise)');
      console.log('  - npm run download-translations (to pull missing keys from Lokalise)');
      console.log('This ensures all UI components have consistent translations for optimal accessibility.');
      process.exit(1); // Exit with error code for CI/CD pipelines
    } else {
      console.log('\n✅ All translations are in sync!');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Error checking translations:', error.message);
    process.exit(1);
  }
}

// Execute the main function
main();
