const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/', 
    '<rootDir>/.next/',
    '<rootDir>/app/components/reports/__tests__/helpers/',
    '<rootDir>/app/components/reports/__tests__/testUtils.tsx'
  ],
  moduleNameMapper: {
    // Handle module aliases (if you have any in tsconfig.json)
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/hooks/(.*)$': '<rootDir>/app/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/app/utils/$1',
  },
  // Add collectCoverage to generate coverage reports
  collectCoverage: true,
  collectCoverageFrom: [
    'app/components/reports/**/*.{js,jsx,ts,tsx}',
    '!app/components/reports/**/*.d.ts',
    '!app/components/reports/**/__tests__/**',
  ],
  coverageThreshold: {
    'app/components/reports/': {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
