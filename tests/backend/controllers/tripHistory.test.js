// tests/backend/controllers/tripHistory.test.js

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the DB pool
jest.mock('../../../backend/src/config/db.js', () => {
    const mockQuery = jest.fn();
    return {
        __esModule: true,
        default: { query: mockQuery },
        mockQuery,
    };
});

import pool from '../../../backend/src/config/db.js';
import { getTripHistory } from '../../../backend/src/controllers/trips.controller.js';

// Helper to create mock Express req/res
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Trip History (backend)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return past trips for a driver', async () => {
        const mockTrips = [
            { id: 1, departure_city: 'Paris', destination_city: 'Lyon', departure_date: '2024-01-01', price: 20, status: 'closed' },
            { id: 2, departure_city: 'Paris', destination_city: 'Marseille', departure_date: '2024-02-01', price: 30, status: 'closed' },
        ];
        // driver role – query trips where driver_id = userId and departure_date < NOW()
        pool.query.mockResolvedValueOnce([mockTrips]);

        const req = { user: { id: 10, role: 'driver' } };
        const res = mockResponse();
        const next = jest.fn();

        await getTripHistory(req, res, next);

        expect(pool.query).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(mockTrips);
        expect(next).not.toHaveBeenCalled();
    });

    it('should return past trips for a passenger', async () => {
        const mockTrips = [
            { id: 3, departure_city: 'Berlin', destination_city: 'Munich', departure_date: '2024-03-01', price: 25, status: 'closed' },
        ];
        // passenger role – query reservations joined with trips where departure_date < NOW()
        pool.query.mockResolvedValueOnce([mockTrips]);

        const req = { user: { id: 20, role: 'passenger' } };
        const res = mockResponse();
        const next = jest.fn();

        await getTripHistory(req, res, next);

        expect(pool.query).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(mockTrips);
        expect(next).not.toHaveBeenCalled();
    });
});
