
// src/controllers/reservations.controller.js
import pool from '../config/db.js';
import Joi from 'joi';

/**
 * Schema: create reservation
 */
const createReservationSchema = Joi.object({
    trip_id: Joi.number().integer().required()
});

/**
 * POST /api/reservations
 * Create reservation (passenger)
 * - Prevent duplicate active reservations (pending/confirmed)
 * - Atomically decrement seats (single UPDATE to avoid race)
 * - Insert reservation with "pending" status
 */
export async function createReservation(req, res, next) {
    try {
        const { error, value } = createReservationSchema.validate(req.body);
        if (error) { error.status = 422; throw error; }

        const passenger_id = req.user.id;
        const { trip_id } = value;

        // Verify trip exists & is open
        const [trips] = await pool.query(
            'SELECT id, driver_id, available_seats, status FROM trips WHERE id = ?',
            [trip_id]
        );
        if (!trips.length) return res.status(404).json({ error: 'Trip not found' });
        const trip = trips[0];
        if (trip.status !== 'open') return res.status(400).json({ error: 'Trip is not open' });

        // Prevent duplicate active reservation
        const [existing] = await pool.query(
            'SELECT id FROM reservations WHERE trip_id = ? AND passenger_id = ? AND status IN ("pending","confirmed")',
            [trip_id, passenger_id]
        );
        if (existing.length) return res.status(409).json({ error: 'Already reserved this trip' });

        // Atomic seat decrement (works without transactions)
        const [updateRes] = await pool.query(
            'UPDATE trips SET available_seats = available_seats - 1 WHERE id = ? AND status = "open" AND available_seats > 0',
            [trip_id]
        );
        if (updateRes.affectedRows === 0) {
            return res.status(400).json({ error: 'No seats available' });
        }

        // Insert reservation as pending
        const [resInsert] = await pool.query(
            'INSERT INTO reservations (trip_id, passenger_id, status) VALUES (?, ?, "pending")',
            [trip_id, passenger_id]
        );

        res.status(201).json({ id: resInsert.insertId, status: 'pending' });
    } catch (err) {
        next(err);
    }
}

/**
 * PATCH /api/reservations/:id/confirm
 * Confirm reservation (driver of the trip)
 * - Only trip driver can confirm
 * - Reservation must be pending
 * - Adds a confirmation notification to passenger
 */
export async function confirmReservation(req, res, next) {
    try {
        const reservationId = parseInt(req.params.id, 10);

        const [rows] = await pool.query(
            `SELECT r.id, r.trip_id, r.passenger_id, r.status, t.driver_id
       FROM reservations r
       JOIN trips t ON t.id = r.trip_id
       WHERE r.id = ?`,
            [reservationId]
        );
        if (!rows.length) return res.status(404).json({ error: 'Reservation not found' });

        const reservation = rows[0];
        if (reservation.status !== 'pending') {
            return res.status(400).json({ error: 'Reservation not pending' });
        }

        // Only driver of the trip can confirm
        if (req.user.id !== reservation.driver_id) {
            return res.status(403).json({ error: 'Forbidden: not trip driver' });
        }

        await pool.query('UPDATE reservations SET status = "confirmed" WHERE id = ?', [reservationId]);

        await pool.query(
            'INSERT INTO notifications (user_id, message, type, is_read) VALUES (?, ?, "confirmation", 0)',
            [reservation.passenger_id, 'Your reservation has been confirmed']
        );

        res.json({ id: reservationId, status: 'confirmed' });
    } catch (err) {
        next(err);
    }
}

/**
 * PATCH /api/reservations/:id/cancel
 * Cancel reservation (driver or passenger) -> DELETE record
 * - Validate actor: passenger (own reservation) OR driver (trip owner)
 * - Restore seats if reservation was not already cancelled
 * - Delete reservation row
 * - Add cancellation notification to the other party
 */
export async function cancelReservation(req, res, next) {
    try {
        const reservationId = parseInt(req.params.id, 10);

        const [rows] = await pool.query(
            `SELECT r.id, r.trip_id, r.passenger_id, r.status, t.driver_id
       FROM reservations r
       JOIN trips t ON t.id = r.trip_id
       WHERE r.id = ?`,
            [reservationId]
        );
        if (!rows.length) return res.status(404).json({ error: 'Reservation not found' });

        const reservation = rows[0];

        const isPassenger = req.user.id === reservation.passenger_id;
        const isDriverOfTrip = req.user.id === reservation.driver_id;
        if (!isPassenger && !isDriverOfTrip) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Restore seat only if reservation had consumed one (pending/confirmed)
        if (reservation.status !== 'cancelled') {
            await pool.query(
                'UPDATE trips SET available_seats = available_seats + 1 WHERE id = ?',
                [reservation.trip_id]
            );
        }

        // Delete reservation record
        await pool.query('DELETE FROM reservations WHERE id = ?', [reservationId]);

        // Notify the other party
        const notifyUserId = isPassenger ? reservation.driver_id : reservation.passenger_id;
        await pool.query(
            'INSERT INTO notifications (user_id, message, type, is_read) VALUES (?, ?, "cancellation", 0)',
            [notifyUserId, 'A reservation has been cancelled and removed']
        );

        res.json({ id: reservationId, deleted: true });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/reservations/me
 * List my reservations (role-aware)
 * - Passenger: reservations they created, with trip info
 * - Driver: reservations on their trips, with passenger names
 */

export async function listMyReservations(req, res, next) {
    try {
        const userId = req.user.id;

        const [rows] = await pool.query(
            `SELECT r.id, r.status, r.created_at,
              t.departure_city, t.destination_city, t.departure_date, t.price,
              u.name AS passenger_name
       FROM reservations r
       JOIN trips t ON t.id = r.trip_id
       JOIN users u ON u.id = r.passenger_id
       WHERE r.passenger_id = ? OR t.driver_id = ?
       ORDER BY r.created_at DESC`,
            [userId, userId]
        );

        return res.json(rows);
    } catch (err) {
        next(err);
    }
}

