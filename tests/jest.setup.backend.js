// Jest setup file for backend tests (Node.js environment)
// IMPORTANT: This file uses CommonJS because setupFiles runs before ES modules are available
// Set environment variables FIRST before any imports
// This prevents errors when db.js tries to access process.env.DB_HOST.includes()

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = '4000';

// Database environment variables (to prevent errors when importing db.js)
// These MUST be set before any imports that use them
// Ensure DB_HOST is always a string to prevent .includes() errors
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '3306';
process.env.DB_USER = process.env.DB_USER || 'test_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';
process.env.DB_NAME = process.env.DB_NAME || 'test_db';

// Note: We can't use ES modules imports here because setupFiles runs in CommonJS context
// Jest globals like jest.fn() will be available in test files via @jest/globals
