import pool from '../config/db.js';

/**
 * GET /api/admin/pending-drivers
 * List all drivers who are not verified
 */
export async function getPendingDrivers(req, res, next) {
    try {
        const [rows] = await pool.query(
            "SELECT id, name, email, phone, profile_photo, license_document, created_at FROM users WHERE role = 'driver' AND is_verified = 0"
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
}

/**
 * PATCH /api/admin/approve-driver/:id
 * Approve a driver
 */
export async function approveDriver(req, res, next) {
    try {
        const driverId = parseInt(req.params.id, 10);
        await pool.query('UPDATE users SET is_verified = 1 WHERE id = ?', [driverId]);
        res.json({ message: 'Driver approved successfully' });
    } catch (err) {
        next(err);
    }
}

/**
 * PATCH /api/admin/reject-driver/:id
 * Reject a driver (for now, we'll just delete them or leave them unverified. Let's delete to keep it clean)
 */
export async function rejectDriver(req, res, next) {
    try {
        const driverId = parseInt(req.params.id, 10);
        // In a real app, we might want to keep the record but mark as rejected.
        // For this MVP, we delete the user so they can try again or to clean up.
        await pool.query('DELETE FROM users WHERE id = ?', [driverId]);
        res.json({ message: 'Driver rejected and removed' });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/admin/passengers
 * List all passengers with their last reservation
 */
export async function getPassengers(req, res, next) {
    try {
        const query = `
            SELECT 
                u.id, u.name, u.email, u.phone, u.created_at,
                r.id as last_reservation_id,
                r.created_at as last_reservation_date,
                t.departure_city, t.destination_city, t.departure_date as trip_date
            FROM users u
            LEFT JOIN (
                SELECT passenger_id, MAX(created_at) as max_created
                FROM reservations
                GROUP BY passenger_id
            ) latest_res ON u.id = latest_res.passenger_id
            LEFT JOIN reservations r ON r.passenger_id = u.id AND r.created_at = latest_res.max_created
            LEFT JOIN trips t ON r.trip_id = t.id
            WHERE u.role = 'passenger'
            ORDER BY u.created_at DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/admin/drivers
 * List all verified drivers
 */
export async function getApprovedDrivers(req, res, next) {
    try {
        const [rows] = await pool.query(
            "SELECT id, name, email, phone, profile_photo, license_document, created_at FROM users WHERE role = 'driver' AND is_verified = 1 ORDER BY created_at DESC"
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
}
