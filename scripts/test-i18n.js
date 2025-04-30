/**
 * BuildTrack Pro Internationalization Test Suite
 * 
 * This script tests the internationalization functionality across
 * multiple routes and locales to verify it's working correctly.
 */

const axios = require('axios');
const colors = require('colors/safe');
const { execSync } = require('child_process');

// Configuration
const BASE_URL = 'http://localhost:3000';
const LOCALES = ['en', 'es', 'fr', 'pt-BR'];
const ROUTES = [
  '', // Root path
  '/dashboard',
  '/login',
  '/projects',
  '/i18n-test'
];

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

// Utility functions
const log = {
  info: (msg) => console.log(colors.blue(`[INFO] ${msg}`)),
  success: (msg) => console.log(colors.green(`[SUCCESS] ${msg}`)),
  error: (msg) => console.log(colors.red(`[ERROR] ${msg}`)),
  warning: (msg) => console.log(colors.yellow(`[WARNING] ${msg}`)),
  result: (msg) => console.log(colors.cyan(`[RESULT] ${msg}`))
};

async function testUrl(url) {
  results.total++;
  try {
    const response = await axios.get(url, { 
      maxRedirects: 0,
      validateStatus: status => true // Allow any status code
    });
    const status = response.status;
    const location = response.headers?.location || 'N/A';
    
    // Check for success or acceptable redirect
    const isSuccess = 
      (status >= 200 && status < 300) || 
      (status === 307 && location.includes('/en')) ||
      (status === 307 && location.includes('/marketing'));
    
    if (isSuccess) {
      results.passed++;
      log.success(`${url} - ${status} ${status === 307 ? `→ ${location}` : ''}`);
      results.details.push({
        url,
        status,
        location,
        result: 'PASS'
      });
      return true;
    } else {
      results.failed++;
      log.error(`${url} - ${status} ${status === 307 ? `→ ${location}` : ''}`);
      results.details.push({
        url,
        status,
        location,
        result: 'FAIL'
      });
      return false;
    }
  } catch (err) {
    results.failed++;
    log.error(`${url} - Network error: ${err.message}`);
    results.details.push({
      url,
      status: 'ERROR',
      error: err.message,
      result: 'FAIL'
    });
    return false;
  }
}

async function runTests() {
  log.info('Starting BuildTrack Pro Internationalization Tests');
  log.info(`Testing ${LOCALES.length} locales and ${ROUTES.length} routes`);
  
  // 1. Test direct access to routes without locale
  log.info('\n===== Testing Direct Routes (No Locale) =====');
  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`;
    await testUrl(url);
  }
  
  // 2. Test with explicit locales
  for (const locale of LOCALES) {
    log.info(`\n===== Testing ${locale.toUpperCase()} Locale Routes =====`);
    for (const route of ROUTES) {
      if (route === '') {
        // Root with locale
        const url = `${BASE_URL}/${locale}`;
        await testUrl(url);
      } else if (route === '/i18n-test') {
        // Skip locale for i18n-test route
        continue;
      } else {
        // Regular route with locale
        const url = `${BASE_URL}/${locale}${route}`;
        await testUrl(url);
      }
    }
  }
  
  // 3. Test i18n-test page specifically
  log.info('\n===== Testing i18n-test Special Route =====');
  await testUrl(`${BASE_URL}/i18n-test`);
  
  // Display summary
  log.info('\n===== Test Summary =====');
  log.result(`Total Tests: ${results.total}`);
  log.success(`Passed: ${results.passed}`);
  log.error(`Failed: ${results.failed}`);
  log.result(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  
  if (results.failed > 0) {
    log.warning('\nFailed Tests:');
    results.details
      .filter(test => test.result === 'FAIL')
      .forEach(test => {
        log.error(`${test.url} - ${test.status} ${test.location ? `→ ${test.location}` : ''}`);
      });
  }
  
  return results.failed === 0;
}

// Run the tests and output results
runTests()
  .then(success => {
    if (success) {
      log.success('\nAll internationalization tests passed!');
      process.exit(0);
    } else {
      log.error('\nSome internationalization tests failed.');
      process.exit(1);
    }
  })
  .catch(err => {
    log.error(`\nTest runner error: ${err.message}`);
    process.exit(1);
  });
