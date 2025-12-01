module.exports = {
  // Use projects to separate backend and frontend test configurations
  projects: [
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/backend/**/*.test.js'],
      moduleFileExtensions: ['js', 'json'],
      transform: {
        '^.+\\.js$': 'babel-jest'
      },
      moduleNameMapper: {
        '^@backend/(.*)$': '<rootDir>/../backend/src/$1'
      },
      setupFiles: ['<rootDir>/jest.setup.backend.js'],
      setupFilesAfterEnv: [],
      // Automatically mock db.js to prevent import errors
      automock: false,
      collectCoverageFrom: [
        '../backend/src/**/*.{js,jsx}',
        '!**/node_modules/**',
        '!**/dist/**'
      ]
    },
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/frontend/**/*.test.{ts,tsx}'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      transform: {
        '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest'
      },
      moduleNameMapper: {
        '^@frontend/(.*)$': '<rootDir>/../frontend/src/$1',
        '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
        '\\.(svg|png|jpg|jpeg|gif|webp)$': '<rootDir>/__mocks__/fileMock.js',
        '^react$': '<rootDir>/node_modules/react',
        '^react-dom$': '<rootDir>/node_modules/react-dom'
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.frontend.js'],
      collectCoverageFrom: [
        '../frontend/src/**/*.{ts,tsx}',
        '!**/node_modules/**',
        '!**/dist/**',
        '!**/build/**'
      ],
      transformIgnorePatterns: [
        'node_modules/(?!(react-router-dom|@testing-library)/)'
      ]
    }
  ],
  
  // Global coverage thresholds
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  
  // Verbose output
  verbose: true
};

