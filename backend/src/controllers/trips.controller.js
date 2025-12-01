
import pool from '../config/db.js';
import Joi from 'joi';
import { getPagination } from '../utils/pagination.js';

const createTripSchema = Joi.object({
    departure_city: Joi.string().min(2).max(100).required(),
    destination_city: Joi.string().min(2).max(100).required(),
    departure_date: Joi.date().iso().required(),
    price: Joi.number().precision(2).min(0).required(),
    available_seats: Joi.number().integer().min(1).required(),
    is_recurring: Joi.boolean().default(false),
    recurrence_pattern: Joi.string().valid('none', 'daily', 'weekly', 'weekdays').default('none'),
    recurrence_end_date: Joi.date().iso().allow(null).default(null)
});

export async function createTrip(req, res, next) {
    try {
        const { error, value } = createTripSchema.validate(req.body);
        if (error) { error.status = 422; throw error; }

        const driver_id = req.user.id;
        const {
            departure_city, destination_city, departure_date, price, available_seats,
            is_recurring, recurrence_pattern, recurrence_end_date
        } = value;

        const [users] = await pool.query('SELECT role FROM users WHERE id = ?', [driver_id]);
        if (users.length === 0 || users[0].role !== 'driver') {
            return res.status(403).json({ error: 'Only drivers can create trips' });
        }

        // 1. Create the initial (parent) trip
        const [result] = await pool.query(
            `INSERT INTO trips (driver_id, departure_city, destination_city, departure_date, price, available_seats, status, is_recurring, recurrence_pattern, recurrence_end_date)
       VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?, ?)`,
            [driver_id, departure_city, destination_city, departure_date, price, available_seats, is_recurring, recurrence_pattern, recurrence_end_date]
        );

        const parentTripId = result.insertId;
        let generatedCount = 0;

        // 2. If recurring, generate future trips
        if (is_recurring && recurrence_pattern !== 'none' && recurrence_end_date) {
            const startDate = new Date(departure_date);
            const endDate = new Date(recurrence_end_date);
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 60); // Hard limit: 60 days into future

            const effectiveEndDate = endDate < maxDate ? endDate : maxDate;
            let currentDate = new Date(startDate);

            // Move to next occurrence immediately
            currentDate.setDate(currentDate.getDate() + 1);

            while (currentDate <= effectiveEndDate) {
                let shouldCreate = false;

                if (recurrence_pattern === 'daily') {
                    shouldCreate = true;
                } else if (recurrence_pattern === 'weekly') {
                    // Check if same day of week
                    if (currentDate.getDay() === startDate.getDay()) {
                        shouldCreate = true;
                    }
                } else if (recurrence_pattern === 'weekdays') {
                    // Mon(1) to Fri(5)
                    const day = currentDate.getDay();
                    if (day >= 1 && day <= 5) {
                        shouldCreate = true;
                    }
                }

                if (shouldCreate) {
                    // Format date for MySQL
                    const nextDate = new Date(currentDate);
                    // Preserve time from original departure
                    nextDate.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);

                    await pool.query(
                        `INSERT INTO trips (driver_id, departure_city, destination_city, departure_date, price, available_seats, status, is_recurring, recurrence_pattern, recurrence_end_date, parent_trip_id)
                         VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?)`,
                        [driver_id, departure_city, destination_city, nextDate, price, available_seats, true, recurrence_pattern, recurrence_end_date, parentTripId]
                    );
                    generatedCount++;
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        res.status(201).json({
            id: parentTripId,
            message: 'Trip created successfully',
            generated_trips: generatedCount
        });
    } catch (err) {
        next(err);
    }
}

export async function searchTrips(req, res, next) {
    try {
        const { page, limit, offset } = getPagination(req.query);

        const filters = [];
        const params = [];

        if (req.query.departure_city) {
            filters.push('departure_city LIKE ?');
            params.push(`%${req.query.departure_city}%`);
        }
        if (req.query.destination_city) {
            filters.push('destination_city LIKE ?');
            params.push(`%${req.query.destination_city}%`);
        }
        if (req.query.from_date) {
            filters.push('departure_date >= ?');
            params.push(req.query.from_date);
        }
        if (req.query.to_date) {
            filters.push('departure_date <= ?');
            params.push(req.query.to_date);
        }

        // Price range filters
        if (req.query.minPrice) {
            filters.push('price >= ?');
            params.push(parseFloat(req.query.minPrice));
        }
        if (req.query.maxPrice) {
            filters.push('price <= ?');
            params.push(parseFloat(req.query.maxPrice));
        }

        // Minimum available seats filter
        if (req.query.minSeats) {
            filters.push('available_seats >= ?');
            params.push(parseInt(req.query.minSeats, 10));
        }

        // ✅ Default: Only show future trips
        filters.push('departure_date >= NOW()');

        if (req.user && req.user.role === 'driver') {
            filters.push('driver_id != ?');
            params.push(req.user.id);
        }

        filters.push("status = 'open'");

        const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

        const [rows] = await pool.query(
            `SELECT SQL_CALC_FOUND_ROWS id, driver_id, departure_city, destination_city, departure_date, price, available_seats, status
       FROM trips ${where}
       ORDER BY departure_date ASC
       LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        const [totalRows] = await pool.query('SELECT FOUND_ROWS() AS total');
        const total = totalRows[0].total;

        res.json({ page, limit, total, results: rows });
    } catch (err) {
        next(err);
    }
}

export async function getTripById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        const [rows] = await pool.query(
            `SELECT t.*, u.name as driver_name, u.phone as driver_phone
       FROM trips t
       JOIN users u ON u.id = t.driver_id
       WHERE t.id = ?`,
            [id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
}

export async function listMyTrips(req, res, next) {
    try {
        const driverId = req.user.id;
        const [rows] = await pool.query(
            `SELECT id, departure_city, destination_city, departure_date, price, available_seats, status
             FROM trips WHERE driver_id = ? ORDER BY departure_date ASC`,
            [driverId]
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
}


export async function deleteTrip(req, res, next) {
    try {
        const tripId = parseInt(req.params.id, 10);
        const driverId = req.user.id;

        // Verify trip exists and belongs to driver
        const [trips] = await pool.query(
            'SELECT id, driver_id, departure_city, destination_city, departure_date FROM trips WHERE id = ?',
            [tripId]
        );

        if (!trips.length) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        if (trips[0].driver_id !== driverId) {
            return res.status(403).json({ error: 'You can only delete your own trips' });
        }

        const trip = trips[0];

        // Get all passengers with reservations for this trip
        const [reservations] = await pool.query(
            'SELECT passenger_id FROM reservations WHERE trip_id = ?',
            [tripId]
        );

        // Notify all passengers about trip deletion
        if (reservations.length > 0) {
            const notificationMessage = `Trip from ${trip.departure_city} to ${trip.destination_city} on ${new Date(trip.departure_date).toLocaleDateString()} has been deleted by the driver`;

            for (const reservation of reservations) {
                await pool.query(
                    'INSERT INTO notifications (user_id, message, type, is_read) VALUES (?, ?, "trip_deletion", 0)',
                    [reservation.passenger_id, notificationMessage]
                );
            }

            // Delete all reservations for this trip
            await pool.query('DELETE FROM reservations WHERE trip_id = ?', [tripId]);
        }

        // Delete the trip
        await pool.query('DELETE FROM trips WHERE id = ?', [tripId]);

        res.json({
            success: true,
            message: 'Trip deleted successfully',
            notifiedPassengers: reservations.length
        });
    } catch (err) {
        next(err);
    }
}

const updateTripSchema = Joi.object({
    departure_date: Joi.date().iso(),
    price: Joi.number().precision(2).min(0),
    available_seats: Joi.number().integer().min(1)
});

export async function updateTrip(req, res, next) {
    try {
        const tripId = parseInt(req.params.id, 10);
        const driverId = req.user.id;
        const { error, value } = updateTripSchema.validate(req.body);
        if (error) { error.status = 422; throw error; }

        const { departure_date, price, available_seats } = value;

        // Verify trip exists and belongs to driver
        const [trips] = await pool.query(
            'SELECT id, driver_id, departure_city, destination_city, departure_date FROM trips WHERE id = ?',
            [tripId]
        );

        if (!trips.length) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        if (trips[0].driver_id !== driverId) {
            return res.status(403).json({ error: 'You can only update your own trips' });
        }

        const trip = trips[0];

        // Prepare update query
        const updates = [];
        const params = [];

        if (departure_date) {
            updates.push('departure_date = ?');
            params.push(departure_date);
        }
        if (price !== undefined) {
            updates.push('price = ?');
            params.push(price);
        }
        if (available_seats !== undefined) {
            updates.push('available_seats = ?');
            params.push(available_seats);
        }

        if (updates.length === 0) {
            return res.json({ message: 'No changes provided' });
        }

        params.push(tripId);
        await pool.query(`UPDATE trips SET ${updates.join(', ')} WHERE id = ?`, params);

        // Notify passengers if critical details changed
        const [reservations] = await pool.query(
            'SELECT passenger_id FROM reservations WHERE trip_id = ?',
            [tripId]
        );

        if (reservations.length > 0) {
            let changes = [];
            if (departure_date) changes.push(`Date changed to ${new Date(departure_date).toLocaleString()}`);
            if (price) changes.push(`Price changed to ${price} DT`);

            if (changes.length > 0) {
                const message = `Trip update: ${trip.departure_city} to ${trip.destination_city}. ${changes.join(', ')}`;
                for (const r of reservations) {
                    await pool.query(
                        'INSERT INTO notifications (user_id, message, type, is_read) VALUES (?, ?, "trip_update", 0)',
                        [r.passenger_id, message]
                    );
                }
            }
        }

        res.json({ success: true, message: 'Trip updated successfully' });

    } catch (err) {
        next(err);
    }
}


import axios from 'axios';

// Haversine formula to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

export async function estimatePrice(req, res, next) {
    try {
        const { departure_city, destination_city } = req.body;

        if (!departure_city || !destination_city) {
            return res.status(400).json({ error: 'Departure and destination cities are required' });
        }

        // Geocode departure city
        const depRes = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q: departure_city, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'TripShare-App/1.0' }
        });

        // Geocode destination city
        const destRes = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q: destination_city, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'TripShare-App/1.0' }
        });

        if (depRes.data.length === 0 || destRes.data.length === 0) {
            return res.status(404).json({ error: 'One or both cities not found' });
        }

        const depCoords = { lat: parseFloat(depRes.data[0].lat), lon: parseFloat(depRes.data[0].lon) };
        const destCoords = { lat: parseFloat(destRes.data[0].lat), lon: parseFloat(destRes.data[0].lon) };

        const distanceKm = calculateDistance(depCoords.lat, depCoords.lon, destCoords.lat, destCoords.lon);

        // Pricing logic: Base $2 + $0.06 per km (More reasonable for carpooling)
        const basePrice = 2;
        const pricePerKm = 0.06;
        let estimatedPrice = basePrice + (distanceKm * pricePerKm);
        estimatedPrice = Math.round(estimatedPrice * 100) / 100; // Round to 2 decimals

        res.json({
            distance_km: Math.round(distanceKm),
            estimated_price: estimatedPrice,
            currency: 'USD'
        });

    } catch (err) {
        next(err);
    }
}

export async function getTripHistory(req, res, next) {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        let rows = [];

        if (role === 'driver') {
            // Drivers: trips they published in the past
            [rows] = await pool.query(
                `SELECT id, departure_city, destination_city, departure_date, price, available_seats, status
                 FROM trips
                 WHERE driver_id = ? AND departure_date < NOW()
                 ORDER BY departure_date DESC`,
                [userId]
            );
        } else {
            // Passengers: trips they reserved in the past
            [rows] = await pool.query(
                `SELECT t.id, t.departure_city, t.destination_city, t.departure_date, t.price, t.status as trip_status,
                        r.status as reservation_status, r.created_at as reservation_date
                 FROM reservations r
                 JOIN trips t ON t.id = r.trip_id
                 WHERE r.passenger_id = ? AND t.departure_date < NOW()
                 ORDER BY t.departure_date DESC`,
                [userId]
            );
        }

        res.json(rows);
    } catch (err) {
        next(err);
    }
}
