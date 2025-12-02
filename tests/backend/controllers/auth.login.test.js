// tests/backend/controllers/auth.login.test.js

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies
jest.mock('../../../backend/src/config/db.js', () => {
    const mockQuery = jest.fn();
    return {
        __esModule: true,
        default: { query: mockQuery },
        mockQuery,
    };
});

jest.mock('../../../backend/src/utils/password.js', () => {
    const mockVerifyPassword = jest.fn();
    return {
        __esModule: true,
        verifyPassword: mockVerifyPassword,
        mockVerifyPassword,
    };
});

jest.mock('../../../backend/src/utils/jwt.js', () => {
    const mockSignToken = jest.fn();
    return {
        __esModule: true,
        signToken: mockSignToken,
        mockSignToken,
    };
});

import pool from '../../../backend/src/config/db.js';
import { verifyPassword } from '../../../backend/src/utils/password.js';
import { signToken } from '../../../backend/src/utils/jwt.js';
import { login } from '../../../backend/src/controllers/auth.controller.js';

// Helper to create mock Express req/res
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Auth Controller - login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a token for a valid passenger login', async () => {
        const mockUser = {
            id: 1,
            email: 'passenger@example.com',
            password_hash: 'hashed_pw',
            role: 'passenger',
            name: 'Passenger',
            is_verified: true,
        };

        // Mock DB to return the user
        pool.query.mockResolvedValueOnce([[mockUser]]);
        // Mock password verification to succeed
        verifyPassword.mockResolvedValueOnce(true);
        // Mock JWT signing
        signToken.mockReturnValueOnce('jwt-token');

        const req = { body: { email: mockUser.email, password: 'plain' } };
        const res = mockResponse();
        const next = jest.fn();

        await login(req, res, next);

        expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = ?', [mockUser.email]);
        expect(verifyPassword).toHaveBeenCalledWith('plain', mockUser.password_hash);
        expect(signToken).toHaveBeenCalledWith({ id: mockUser.id, role: mockUser.role, name: mockUser.name });
        expect(res.json).toHaveBeenCalledWith({
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
            token: 'jwt-token',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should reject login when credentials are wrong', async () => {
        // No user found
        pool.query.mockResolvedValueOnce([[]]);

        const req = { body: { email: 'unknown@example.com', password: 'any' } };
        const res = mockResponse();
        const next = jest.fn();

        await login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should reject unverified driver', async () => {
        const mockDriver = {
            id: 2,
            email: 'driver@example.com',
            password_hash: 'hashed_pw',
            role: 'driver',
            name: 'Driver',
            is_verified: false,
        };

        pool.query.mockResolvedValueOnce([[mockDriver]]);
        verifyPassword.mockResolvedValueOnce(true);

        const req = { body: { email: mockDriver.email, password: 'plain' } };
        const res = mockResponse();
        const next = jest.fn();

        await login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Your account is pending verification.' });
        expect(next).not.toHaveBeenCalled();
    });
});
