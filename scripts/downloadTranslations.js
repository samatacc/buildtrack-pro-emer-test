/**
 * Download Translations Script for BuildTrack Pro
 * 
 * This script downloads translations from Lokalise and updates the local message files.
 * It ensures that all supported languages have complete translations available.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Read configuration from TypeScript file
// Note: For simplicity in a script, we're parsing the TS file directly
// In a production environment, consider generating a JS config file
const configPath = path.join(__dirname, '../app/utils/lokaliseConfig.ts');
const configContent = fs.readFileSync(configPath, 'utf8');

// Extract config values using regex for simple parsing
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
 * Download translations from Lokalise
 */
async function downloadTranslations() {
  console.log('🌍 Starting translation download from Lokalise...');
  
  // API request options for Lokalise
  const options = {
    hostname: 'api.lokalise.com',
    path: `/api2/projects/${projectId}/files/download`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Token': apiKey
    }
  };
  
  // Request payload
  const data = JSON.stringify({
    format: 'json',
    original_filenames: false,
    bundle_structure: '%LANG_ISO%.json',
    directory_prefix: '',
    filter_langs: supportedLocales,
    export_empty_as: 'skip',
    placeholder_format: 'icu'
  });
  
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
    
    req.write(data);
    req.end();
  });
  
  // Download the ZIP file with translations
  if (response && response.bundle_url) {
    console.log('✅ Lokalise export created successfully, downloading bundle...');
    
    const tempZipPath = path.join(__dirname, 'translations.zip');
    const outputDir = path.join(__dirname, '../messages');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Download the ZIP file
    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(tempZipPath);
      https.get(response.bundle_url, (res) => {
        res.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log('✅ Bundle downloaded successfully');
          resolve();
        });
        
        file.on('error', (err) => {
          fs.unlink(tempZipPath, () => {});
          reject(err);
        });
      }).on('error', (err) => {
        fs.unlink(tempZipPath, () => {});
        reject(err);
      });
    });
    
    // Extract the ZIP file using unzip
    try {
      console.log('📦 Extracting translations to messages directory...');
      execSync(`unzip -o ${tempZipPath} -d ${outputDir}`);
      console.log('✅ Translations extracted successfully');
      
      // Clean up the ZIP file
      fs.unlinkSync(tempZipPath);
      
      // Verify all locale files exist
      const missingLocales = [];
      supportedLocales.forEach(locale => {
        const localePath = path.join(outputDir, `${locale}.json`);
        if (!fs.existsSync(localePath)) {
          missingLocales.push(locale);
        }
      });
      
      if (missingLocales.length > 0) {
        console.warn(`⚠️ Warning: Some locale files are missing: ${missingLocales.join(', ')}`);
        console.warn('You may need to add these languages in Lokalise or initialize them with empty translations');
      } else {
        console.log('✅ All locale files are present');
      }
      
      console.log('🌍 Translation download completed successfully!');
    } catch (error) {
      console.error('❌ Error extracting translations:', error.message);
      process.exit(1);
    }
  } else {
    console.error('❌ Failed to create translation bundle:', response);
    process.exit(1);
  }
}

// Execute the download function
downloadTranslations().catch(error => {
  console.error('❌ Error downloading translations:', error.message);
  process.exit(1);
});
