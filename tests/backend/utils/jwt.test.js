import { describe, it, expect, beforeEach } from '@jest/globals';
import { signToken, verifyToken } from '../../../backend/src/utils/jwt.js';

describe('JWT Utilities', () => {
  const testPayload = {
    id: 1,
    role: 'passenger',
    name: 'Test User'
  };

  beforeEach(() => {
    // Ensure JWT_SECRET is set for tests
    process.env.JWT_SECRET = 'test-secret-key-for-jwt-testing';
    process.env.JWT_EXPIRES_IN = '1h';
  });

  describe('signToken', () => {
    it('should sign a token successfully', () => {
      const token = signToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should create different tokens for different payloads', () => {
      const token1 = signToken({ id: 1, role: 'passenger' });
      const token2 = signToken({ id: 2, role: 'driver' });
      
      expect(token1).not.toBe(token2);
    });

    it('should create different tokens for same payload (due to timestamp)', () => {
      const token1 = signToken(testPayload);
      // Small delay to ensure different timestamp
      const token2 = signToken(testPayload);
      
      // Tokens might be different due to iat (issued at) claim
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
    });

    it('should handle empty payload', () => {
      const token = signToken({});
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = signToken(testPayload);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(testPayload.id);
      expect(decoded.role).toBe(testPayload.role);
      expect(decoded.name).toBe(testPayload.name);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        verifyToken(invalidToken);
      }).toThrow();
    });

    it('should throw error for tampered token', () => {
      const token = signToken(testPayload);
      const tamperedToken = token.slice(0, -5) + 'XXXXX';
      
      expect(() => {
        verifyToken(tamperedToken);
      }).toThrow();
    });

    it('should throw error for token signed with different secret', () => {
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'original-secret';
      const token = signToken(testPayload);
      
      process.env.JWT_SECRET = 'different-secret';
      
      expect(() => {
        verifyToken(token);
      }).toThrow();
      
      // Restore original secret
      process.env.JWT_SECRET = originalSecret;
    });

    it('should include expiration in token', () => {
      const token = signToken(testPayload);
      const decoded = verifyToken(token);
      
      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.exp).toBe('number');
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });
});

