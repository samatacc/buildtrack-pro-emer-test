import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90
      },
      exclude: [
        'node_modules/**',
        '.next/**',
        'public/**',
        'styles/**',
        'coverage/**',
        '**/*.d.ts',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/jest.config.js',
        '**/next.config.js'
      ]
    },
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './')
    }
  }
})
