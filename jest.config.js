module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'ai/*/src/**/*.js',
    '!ai/*/src/**/*.test.js',
    '!ai/cli/**'
  ],
  testMatch: [
    'ai/*/tests/**/*.test.js',
    'ai/*/src/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/ai/cli/',
    '/.git/'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/ai/cli/'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/ai/$1'
  },
  setupFilesAfterEnv: [],
  verbose: true,
  bail: false,
  maxWorkers: '50%'
};
