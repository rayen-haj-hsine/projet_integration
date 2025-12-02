// tests/backend/controllers/ratings.test.js

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
import { rateReservation } from '../../../backend/src/controllers/reservations.controller.js';

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Ratings (backend)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully submit a rating for a reservation', async () => {
        const reservationId = 5;
        const userId = 12;
        const rating = 4;
        const comment = 'Great ride!';

        // Verify reservation exists and belongs to passenger
        pool.query.mockResolvedValueOnce([[{ id: reservationId, passenger_id: userId }]]);
        // Update rating
        pool.query.mockResolvedValueOnce([{}]);

        const req = {
            user: { id: userId },
            params: { id: reservationId },
            body: { rating, comment },
        };
        const res = mockResponse();
        const next = jest.fn();

        await rateReservation(req, res, next);

        // First query checks reservation ownership, second updates rating
        expect(pool.query).toHaveBeenCalledTimes(2);
        expect(res.json).toHaveBeenCalledWith({ message: 'Rating submitted successfully' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should reject rating when value is out of range', async () => {
        const req = {
            user: { id: 1 },
            params: { id: 2 },
            body: { rating: 6, comment: '' },
        };
        const res = mockResponse();
        const next = jest.fn();

        await rateReservation(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Rating must be between 1 and 5' });
        expect(next).not.toHaveBeenCalled();
    });
});
