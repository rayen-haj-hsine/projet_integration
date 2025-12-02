// tests/backend/controllers/chats.test.js

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock DB pool
jest.mock('../../../backend/src/config/db.js', () => {
    const mockQuery = jest.fn();
    return {
        __esModule: true,
        default: { query: mockQuery },
        mockQuery,
    };
});

import pool from '../../../backend/src/config/db.js';
import { listContacts, getConversation, sendMessage } from '../../../backend/src/controllers/chats.controller.js';

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Chat controller (backend)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should list driver contacts for a passenger', async () => {
        const drivers = [{ contact_id: 2, name: 'Driver', email: 'd@example.com', phone: '123' }];
        // 1. Get role
        pool.query.mockResolvedValueOnce([[{ role: 'passenger' }]]);
        // 2. Get drivers (executed regardless of role logic order in code, but code awaits them)
        pool.query.mockResolvedValueOnce([drivers]);
        // 3. Get passengers (executed regardless)
        pool.query.mockResolvedValueOnce([[]]);

        const req = { user: { id: 1 } };
        const res = mockResponse();
        const next = jest.fn();

        await listContacts(req, res, next);

        expect(res.json).toHaveBeenCalledWith(drivers);
        expect(next).not.toHaveBeenCalled();
    });

    it('should retrieve a conversation when users have a reservation link', async () => {
        const msgs = [{ id: 1, sender_id: 2, receiver_id: 1, message: 'Hi', created_at: '2024-01-01' }];

        // 1. haveReservationLink -> pool.query (SELECT 1 ...)
        pool.query.mockResolvedValueOnce([[{ 1: 1 }]]);
        // 2. getConversation -> pool.query (SELECT messages ...)
        pool.query.mockResolvedValueOnce([msgs]);
        // 3. getConversation -> pool.query (UPDATE chats SET is_read ...)
        pool.query.mockResolvedValueOnce([{}]);

        const req = { user: { id: 1 }, params: { userId: '2' } };
        const res = mockResponse();
        const next = jest.fn();

        await getConversation(req, res, next);

        expect(res.json).toHaveBeenCalledWith(msgs);
        expect(next).not.toHaveBeenCalled();
    });

    it('should send a message when users are linked', async () => {
        // 1. haveReservationLink -> pool.query
        pool.query.mockResolvedValueOnce([[{ 1: 1 }]]);
        // 2. INSERT message -> pool.query
        // Return an object with insertId as the first element of the array (mocking [result, fields])
        pool.query.mockResolvedValueOnce([{ insertId: 42 }]);

        const req = { user: { id: 1 }, body: { receiver_id: 2, message: 'Hello' } };
        const res = mockResponse();
        const next = jest.fn();

        await sendMessage(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            id: 42,
            sender_id: 1,
            receiver_id: 2,
            message: 'Hello',
            created_at: expect.any(String),
        });
        expect(next).not.toHaveBeenCalled();
    });
});
