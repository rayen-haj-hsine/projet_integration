import { describe, it, expect } from '@jest/globals';
import { hashPassword, verifyPassword } from '../../../backend/src/utils/password.js';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const plainPassword = 'SecurePassword123!';
      const hashed = await hashPassword(plainPassword);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(plainPassword);
      expect(hashed.length).toBeGreaterThan(20); // bcrypt hashes are long
    });

    it('should produce different hashes for the same password (salt)', async () => {
      const plainPassword = 'SamePassword123!';
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);
      
      expect(hash1).not.toBe(hash2); // Different salts = different hashes
    });

    it('should handle empty password', async () => {
      const hashed = await hashPassword('');
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const plainPassword = 'CorrectPassword123!';
      const hashed = await hashPassword(plainPassword);
      
      const isValid = await verifyPassword(plainPassword, hashed);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const plainPassword = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashed = await hashPassword(plainPassword);
      
      const isValid = await verifyPassword(wrongPassword, hashed);
      expect(isValid).toBe(false);
    });

    it('should handle empty password verification', async () => {
      const hashed = await hashPassword('SomePassword');
      const isValid = await verifyPassword('', hashed);
      expect(isValid).toBe(false);
    });

    it('should handle special characters in password', async () => {
      const specialPassword = 'P@ssw0rd!#$%^&*()';
      const hashed = await hashPassword(specialPassword);
      const isValid = await verifyPassword(specialPassword, hashed);
      
      expect(isValid).toBe(true);
    });
  });
});

