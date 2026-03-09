/**
 * Jest Configuration for SIIL Project
 * Configured for ES Modules (type: "module" in package.json)
 */

export default {
  // Use node environment for testing
  testEnvironment: 'node',

  // Transform ES modules
  transform: {},

  // File extensions to consider
  moduleFileExtensions: ['js', 'mjs'],

  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/**/*.test.js',
    '!js/**/*.spec.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],

  // Coverage thresholds (>80% for core modules)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Coverage directory
  coverageDirectory: 'coverage',

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],

  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.venv/'
  ],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Reset mocks between tests
  resetMocks: true
};
