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

/**
 * GET /api/admin/driver-requests
 * List all pending driver upgrade requests
 */
export async function getDriverRequests(req, res, next) {
    try {
        const [rows] = await pool.query(`
            SELECT 
                dr.id, dr.user_id, dr.profile_photo, dr.license_document, 
                dr.status, dr.created_at,
                u.name, u.email, u.phone, u.role
            FROM driver_requests dr
            JOIN users u ON u.id = dr.user_id
            WHERE dr.status = 'pending'
            ORDER BY dr.created_at ASC
        `);
        res.json(rows);
    } catch (err) {
        next(err);
    }
}

/**
 * PATCH /api/admin/driver-requests/:id/approve
 * Approve a driver upgrade request
 */
export async function approveDriverRequest(req, res, next) {
    try {
        const requestId = parseInt(req.params.id, 10);

        // Get the request
        const [requests] = await pool.query(
            'SELECT user_id, profile_photo, license_document FROM driver_requests WHERE id = ? AND status = ?',
            [requestId, 'pending']
        );

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Request not found or already processed' });
        }

        const { user_id, profile_photo, license_document } = requests[0];

        // Update user role to driver and set photos
        await pool.query(
            'UPDATE users SET role = ?, profile_photo = ?, license_document = ?, is_verified = 1 WHERE id = ?',
            ['driver', profile_photo, license_document, user_id]
        );

        // Mark request as approved
        await pool.query(
            'UPDATE driver_requests SET status = ?, reviewed_at = NOW() WHERE id = ?',
            ['approved', requestId]
        );

        res.json({ message: 'Driver request approved successfully' });
    } catch (err) {
        next(err);
    }
}

/**
 * PATCH /api/admin/driver-requests/:id/reject
 * Reject a driver upgrade request
 */
export async function rejectDriverRequest(req, res, next) {
    try {
        const requestId = parseInt(req.params.id, 10);
        const { admin_notes } = req.body;

        const [result] = await pool.query(
            'UPDATE driver_requests SET status = ?, reviewed_at = NOW(), admin_notes = ? WHERE id = ? AND status = ?',
            ['rejected', admin_notes || null, requestId, 'pending']
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Request not found or already processed' });
        }

        res.json({ message: 'Driver request rejected' });
    } catch (err) {
        next(err);
    }
}
