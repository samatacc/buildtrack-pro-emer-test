/**
 * Upload Translations Script for BuildTrack Pro
 * 
 * This script uploads English translations to Lokalise for translation into other languages.
 * It follows BuildTrack Pro's development workflow and maintains the project's 
 * multilingual capabilities.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

// Read configuration from TypeScript file
const configPath = path.join(__dirname, '../app/utils/lokaliseConfig.ts');
const configContent = fs.readFileSync(configPath, 'utf8');

// Extract config values using regex for simple parsing
const apiKeyMatch = configContent.match(/apiKey: process\.env\.([A-Z_]+)/);
const projectIdMatch = configContent.match(/projectId: process\.env\.([A-Z_]+)/);

const apiKeyEnvVar = apiKeyMatch ? apiKeyMatch[1] : 'LOKALISE_API_KEY';
const projectIdEnvVar = projectIdMatch ? projectIdMatch[1] : 'LOKALISE_PROJECT_ID';

// Get API key and project ID from environment variables
const apiKey = process.env[apiKeyEnvVar];
const projectId = process.env[projectIdEnvVar];

if (!apiKey || !projectId) {
  console.error(`Error: Missing required environment variables: ${apiKeyEnvVar} and/or ${projectIdEnvVar}`);
  console.error('Make sure these are set in your environment or .env file');
  process.exit(1);
}

/**
 * Upload English translations to Lokalise
 */
async function uploadTranslations() {
  console.log('🌍 Starting translation upload to Lokalise...');
  
  const enTranslationsPath = path.join(__dirname, '../messages/en.json');
  
  // Check if the English translations file exists
  if (!fs.existsSync(enTranslationsPath)) {
    console.error(`❌ Error: English translations file not found at ${enTranslationsPath}`);
    process.exit(1);
  }
  
  // Read the English translations file
  const enTranslations = fs.readFileSync(enTranslationsPath, 'utf8');
  
  // Prepare the data for the Lokalise API
  // Using multipart/form-data for file upload
  const boundary = '---------------------------' + Date.now().toString(16);
  
  // Prepare the multipart form data
  const postData = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="data"',
    '',
    JSON.stringify({
      filename: 'en.json',
      lang_iso: 'en',
      detect_icu_plurals: true,
      replace_modified: false, // Don't overwrite existing translations
      apply_tm: true, // Apply translation memory
      tags: ['buildtrack-pro']
    }),
    `--${boundary}`,
    'Content-Disposition: form-data; name="file"; filename="en.json"',
    'Content-Type: application/json',
    '',
    enTranslations,
    `--${boundary}--`
  ].join('\r\n');
  
  // API request options for Lokalise
  const options = {
    hostname: 'api.lokalise.com',
    path: `/api2/projects/${projectId}/files/upload`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(postData),
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
    
    req.write(postData);
    req.end();
  });
  
  if (response && response.project_id) {
    console.log('✅ Translations uploaded successfully to Lokalise!');
    console.log(`📊 Process summary:`);
    console.log(`  - New keys added: ${response.statistics.keys_added || 0}`);
    console.log(`  - Keys updated: ${response.statistics.keys_updated || 0}`);
    console.log(`  - Keys skipped: ${response.statistics.keys_skipped || 0}`);
    
    if (response.warnings && response.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      response.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning.message || warning}`);
      });
    }
    
    console.log('\n🔗 You can now manage translations in Lokalise:');
    console.log(`  https://app.lokalise.com/project/${projectId}`);
  } else {
    console.error('❌ Failed to upload translations:', response);
    process.exit(1);
  }
}

// Execute the upload function
uploadTranslations().catch(error => {
  console.error('❌ Error uploading translations:', error.message);
  process.exit(1);
});
