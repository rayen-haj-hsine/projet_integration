// Jest setup file for frontend tests (jsdom environment)
// Using CommonJS because setupFilesAfterEnv files need to be transformed by Babel
require('@testing-library/jest-dom');

// Mock environment variables for testing
process.env.NODE_ENV = 'test';

// Add TextEncoder/TextDecoder for react-router-dom compatibility
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch for browser environment
if (typeof global !== 'undefined') {
  global.fetch = jest.fn();
}
if (typeof window !== 'undefined') {
  window.fetch = jest.fn();
}

// Mock window.matchMedia for components that use it
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

