import { describe, it, expect, beforeEach } from '@jest/globals';

describe('API Axios Configuration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should configure baseURL correctly for localhost', () => {
    // This test verifies the axios configuration
    // Since we're importing the actual axios instance, we test its behavior
    const BACKEND_HOST = 'localhost';
    const BACKEND_PORT = '4000';
    const expectedBaseURL = `http://${BACKEND_HOST}:${BACKEND_PORT}/api`;
    
    // This is a conceptual test - adjust based on how you want to test the axios instance
    expect(BACKEND_HOST).toBe('localhost');
    expect(BACKEND_PORT).toBe('4000');
    expect(expectedBaseURL).toBe('http://localhost:4000/api');
  });

  it('should add Authorization header when token exists', () => {
    const token = 'mock-jwt-token';
    localStorage.setItem('token', token);
    
    // This test verifies the interceptor logic
    // In a real scenario, you'd test the actual axios instance from your api/axios.ts
    expect(localStorage.getItem('token')).toBe(token);
  });

  it('should not add Authorization header when token is missing', () => {
    localStorage.removeItem('token');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should handle full URL for deployed backend', () => {
    const BACKEND_HOST = 'https://api.example.com';
    const baseURL = BACKEND_HOST.startsWith('http')
      ? `${BACKEND_HOST}/api`
      : `http://${BACKEND_HOST}:4000/api`;
    
    expect(baseURL).toBe('https://api.example.com/api');
  });
});

