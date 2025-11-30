
import pool from '../config/db.js';
import Joi from 'joi';

/**
 * Validation schema for sending a message
 */
const messageSchema = Joi.object({
    receiver_id: Joi.number().integer().required(),
    message: Joi.string().min(1).max(1000).required()
});

/**
 * Check if two users (A and B) are connected via a reservation (pending/confirmed) for any trip
 * Returns true if there exists a reservation where (A is passenger and B is driver) OR (A is driver and B is passenger)
 */
async function haveReservationLink(userAId, userBId) {
    const [rows] = await pool.query(
        `
    SELECT 1
    FROM reservations r
    JOIN trips t ON t.id = r.trip_id
    WHERE r.status IN ('pending','confirmed')
      AND (
        (r.passenger_id = ? AND t.driver_id = ?)
        OR
        (r.passenger_id = ? AND t.driver_id = ?)
      )
    LIMIT 1
    `,
        [userAId, userBId, userBId, userAId]
    );
    return rows.length > 0;
}

/**
 * List chat contacts for the logged-in user:
 * - If user is a passenger: all drivers from his non-cancelled reservations
 * - If user is a driver: all passengers who reserved his trips (non-cancelled)
 * - If role missing, union of both
 */
export async function listContacts(req, res, next) {
    try {
        const myId = req.user.id;
        const [roleRows] = await pool.query('SELECT role FROM users WHERE id = ?', [myId]);
        const role = roleRows.length ? roleRows[0].role : null;

        const contacts = [];

        // As passenger -> drivers
        const [drivers] = await pool.query(
            `
      SELECT DISTINCT t.driver_id AS contact_id, u.name, u.email, u.phone
      FROM reservations r
      JOIN trips t ON t.id = r.trip_id
      JOIN users u ON u.id = t.driver_id
      WHERE r.passenger_id = ? AND r.status IN ('pending','confirmed')
      ORDER BY u.name ASC
      `,
            [myId]
        );

        // As driver -> passengers
        const [passengers] = await pool.query(
            `
      SELECT DISTINCT r.passenger_id AS contact_id, u.name, u.email, u.phone
      FROM reservations r
      JOIN trips t ON t.id = r.trip_id
      JOIN users u ON u.id = r.passenger_id
      WHERE t.driver_id = ? AND r.status IN ('pending','confirmed')
      ORDER BY u.name ASC
      `,
            [myId]
        );

        if (role === 'passenger') {
            res.json(drivers);
        } else if (role === 'driver') {
            res.json(passengers);
        } else {
            // Fallback: union and de-duplicate
            const map = new Map();
            [...drivers, ...passengers].forEach(c => map.set(c.contact_id, c));
            res.json(Array.from(map.values()));
        }
    } catch (err) {
        next(err);
    }
}


export async function getConversation(req, res, next) {
    try {
        const myId = req.user.id;
        const otherUserId = parseInt(req.params.userId, 10);

        if (Number.isNaN(otherUserId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        const allowed = await haveReservationLink(myId, otherUserId);
        if (!allowed) return res.status(403).json({ error: 'You are not allowed to chat with this user' });

        const [msgs] = await pool.query(
            `
      SELECT id, sender_id, receiver_id, message, created_at
      FROM chats
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC, id ASC
      `,
            [myId, otherUserId, otherUserId, myId]
        );

        res.json(msgs);
    } catch (err) {
        next(err);
    }
}

/**
 * Send a message if users are linked via reservation(s)
 */
export async function sendMessage(req, res, next) {
    try {
        const { error, value } = messageSchema.validate(req.body, { abortEarly: false });
        if (error) { error.status = 422; throw error; }

        const senderId = req.user.id;
        const { receiver_id, message } = value;

        const allowed = await haveReservationLink(senderId, receiver_id);
        if (!allowed) return res.status(403).json({ error: 'You are not allowed to chat with this user' });

        const [result] = await pool.query(
            'INSERT INTO chats (sender_id, receiver_id, message) VALUES (?, ?, ?)',
            [senderId, receiver_id, message]
        );

        res.status(201).json({
            id: result.insertId,
            sender_id: senderId,
            receiver_id,
            message,
            created_at: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
}
