import pool from '../config/db.js';
import Joi from 'joi';

/**
 * Schema: create rating
 */
const createRatingSchema = Joi.object({
    reservation_id: Joi.number().integer().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(1000).allow('').optional()
});

/**
 * POST /api/ratings
 * Create a rating for a completed trip reservation
 */
export async function createRating(req, res, next) {
    try {
        const { error, value } = createRatingSchema.validate(req.body);
        if (error) { error.status = 422; throw error; }

        const userId = req.user.id;
        const { reservation_id, rating, comment } = value;

        // Get reservation details
        const [reservations] = await pool.query(
            `SELECT r.id, r.passenger_id, r.trip_id, t.departure_date
             FROM reservations r
             JOIN trips t ON t.id = r.trip_id
             WHERE r.id = ?`,
            [reservation_id]
        );

        if (!reservations.length) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        const reservation = reservations[0];

        // Verify user owns this reservation
        if (reservation.passenger_id !== userId) {
            return res.status(403).json({ error: 'You can only rate your own reservations' });
        }

        // Verify trip has completed (departure date has passed)
        const departureDate = new Date(reservation.departure_date);
        const now = new Date();
        if (departureDate > now) {
            return res.status(400).json({ error: 'Cannot rate a trip that has not yet completed' });
        }

        // Check if rating already exists
        const [existing] = await pool.query(
            'SELECT id FROM ratings WHERE reservation_id = ?',
            [reservation_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'You have already rated this trip' });
        }

        // Insert rating
        const [result] = await pool.query(
            'INSERT INTO ratings (reservation_id, user_id, trip_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [reservation_id, userId, reservation.trip_id, rating, comment || null]
        );

        res.status(201).json({
            id: result.insertId,
            reservation_id,
            trip_id: reservation.trip_id,
            rating,
            comment: comment || null
        });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/ratings/trip/:tripId
 * Get all ratings for a trip with average
 */
export async function getTripRatings(req, res, next) {
    try {
        const tripId = parseInt(req.params.tripId, 10);

        // Get all ratings for the trip
        const [ratings] = await pool.query(
            `SELECT r.id, r.rating, r.comment, r.created_at,
                    u.name as user_name
             FROM ratings r
             JOIN users u ON u.id = r.user_id
             WHERE r.trip_id = ?
             ORDER BY r.created_at DESC`,
            [tripId]
        );

        // Calculate average rating
        let averageRating = 0;
        if (ratings.length > 0) {
            const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
            averageRating = (sum / ratings.length).toFixed(1);
        }

        res.json({
            tripId,
            averageRating: parseFloat(averageRating),
            totalRatings: ratings.length,
            ratings
        });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/ratings/user/:userId
 * Get all ratings received by a driver/user
 */
export async function getUserRatings(req, res, next) {
    try {
        const targetUserId = parseInt(req.params.userId, 10);

        // Get all ratings for trips driven by this user
        const [ratings] = await pool.query(
            `SELECT r.id, r.rating, r.comment, r.created_at,
                    t.departure_city, t.destination_city, t.departure_date,
                    u.name as reviewer_name
             FROM ratings r
             JOIN trips t ON t.id = r.trip_id
             JOIN users u ON u.id = r.user_id
             WHERE t.driver_id = ?
             ORDER BY r.created_at DESC`,
            [targetUserId]
        );

        // Calculate average rating
        let averageRating = 0;
        if (ratings.length > 0) {
            const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
            averageRating = (sum / ratings.length).toFixed(1);
        }

        res.json({
            userId: targetUserId,
            averageRating: parseFloat(averageRating),
            totalRatings: ratings.length,
            ratings
        });
    } catch (err) {
        next(err);
    }
}
