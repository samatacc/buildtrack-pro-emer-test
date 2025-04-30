#!/usr/bin/env node

/**
 * Component Verification Script
 * This script performs isolated testing of specific components without relying on the entire testing infrastructure.
 * Useful for quickly checking component implementations when the main testing infrastructure has issues.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { argv } = require('process');

// Parse command line arguments
const args = argv.slice(2);
const componentArg = args.find(arg => arg.startsWith('--component='));
const component = componentArg ? componentArg.split('=')[1] : null;

if (!component) {
  console.error('Error: You must specify a component name with --component=ComponentName');
  process.exit(1);
}

console.log(`\n===== Component Verification: ${component} =====\n`);

// Define component paths for Document 402 features
const componentPaths = {
  'ActiveProjectsWidget': './app/components/dashboard/widgets/project/ActiveProjectsWidget.tsx',
  'DragHandle': './app/components/dashboard/widgets/DragHandle.tsx',
  'DndProvider': './lib/providers/DndProvider.tsx',
  'WidgetContext': './lib/contexts/WidgetContext.tsx'
};

// Define feature specifications for Document 402
const featureSpecs = {
  'ActiveProjectsWidget': [
    { name: 'Translation Support', pattern: /useTranslations/ },
    { name: 'Health Status Filtering', pattern: /filterByHealth/ },
    { name: 'Project Sorting', pattern: /sortBy/ },
    { name: 'Loading State', pattern: /isLoading/ },
    { name: 'Error Handling', pattern: /error.*\?/ },
    { name: 'Progress Visualization', pattern: /data-testid="progress-bar"/ },
    { name: 'Health Indicators', pattern: /data-testid="health-indicator"/ }
  ],
  'DragHandle': [
    { name: 'React DnD Integration', pattern: /useDrag/ },
    { name: 'Edit Mode Awareness', pattern: /isEditMode/ },
    { name: 'Drag Visual Feedback', pattern: /isDragging/ }
  ],
  'DndProvider': [
    { name: 'HTML5Backend', pattern: /HTML5Backend/ },
    { name: 'Touch Backend Support', pattern: /TouchBackend/ }
  ],
  'WidgetContext': [
    { name: 'API Integration', pattern: /supabase/ },
    { name: 'Widget Settings Type Safety', pattern: /WidgetSettings/ },
    { name: 'Dashboard Persistence', pattern: /saveDashboard/ }
  ]
};

// Verify component implementation
function verifyComponent(componentName) {
  const componentPath = componentPaths[componentName];
  
  if (!componentPath) {
    console.error(`Error: Component ${componentName} is not defined in our verification list.`);
    console.log('Available components:', Object.keys(componentPaths).join(', '));
    process.exit(1);
  }
  
  const fullPath = path.resolve(process.cwd(), componentPath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`Error: Component file not found at ${fullPath}`);
    process.exit(1);
  }
  
  console.log(`Verifying ${componentName} implementation...`);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Check for features
  const specs = featureSpecs[componentName] || [];
  let implementedCount = 0;
  
  console.log('\nFeature verification:');
  console.log('--------------------');
  
  specs.forEach(spec => {
    const isImplemented = spec.pattern.test(content);
    const status = isImplemented ? '✓' : '✗';
    console.log(`${status} ${spec.name}`);
    
    if (isImplemented) {
      implementedCount++;
    }
  });
  
  const coverage = specs.length > 0 ? (implementedCount / specs.length) * 100 : 0;
  
  console.log('\nSummary:');
  console.log('--------');
  console.log(`Features Implemented: ${implementedCount}/${specs.length} (${coverage.toFixed(2)}%)`);
  console.log(`Status: ${coverage === 100 ? 'PASS' : 'NEEDS ATTENTION'}`);

  // For Debug-Only: Output file content
  if (args.includes('--debug')) {
    console.log('\nComponent Content (Debug Mode):');
    console.log('----------------------------');
    console.log(content);
  }
  
  return {
    component: componentName,
    coverage,
    implemented: implementedCount,
    total: specs.length
  };
}

// Run verification
const result = verifyComponent(component);

// Exit with appropriate code
process.exit(result.coverage === 100 ? 0 : 1);
