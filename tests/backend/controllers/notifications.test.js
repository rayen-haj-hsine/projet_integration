// tests/backend/controllers/notifications.test.js

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
// Corrected import name: markRead instead of markAsRead
import { listNotifications, markRead } from '../../../backend/src/controllers/notifications.controller.js';

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Notifications (backend)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should list notifications for a user', async () => {
        const notifs = [
            { id: 1, message: 'Welcome', type: 'system', is_read: 0, created_at: '2024-01-01' }
        ];
        pool.query.mockResolvedValueOnce([notifs]);

        const req = { user: { id: 10 } };
        const res = mockResponse();
        const next = jest.fn();

        await listNotifications(req, res, next);

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT id, message'),
            [10]
        );
        expect(res.json).toHaveBeenCalledWith(notifs);
        expect(next).not.toHaveBeenCalled();
    });

    it('should mark a notification as read', async () => {
        // 1. Check ownership
        pool.query.mockResolvedValueOnce([[{ id: 5 }]]);
        // 2. Update
        pool.query.mockResolvedValueOnce([{}]);

        const req = { user: { id: 10 }, params: { id: '5' } };
        const res = mockResponse();
        const next = jest.fn();

        await markRead(req, res, next);

        expect(pool.query).toHaveBeenCalledTimes(2);
        // Corrected expectation: controller returns { id, is_read: 1 }
        expect(res.json).toHaveBeenCalledWith({ id: 5, is_read: 1 });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 if notification not found or not owned', async () => {
        // Check ownership returns empty
        pool.query.mockResolvedValueOnce([[]]);

        const req = { user: { id: 10 }, params: { id: '99' } };
        const res = mockResponse();
        const next = jest.fn();

        await markRead(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Notification not found' });
        expect(next).not.toHaveBeenCalled();
    });
});
