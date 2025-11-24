
import pool from '../config/db.js';
import Joi from 'joi';
import { getPagination } from '../utils/pagination.js';

const createTripSchema = Joi.object({
    departure_city: Joi.string().min(2).max(100).required(),
    destination_city: Joi.string().min(2).max(100).required(),
    departure_date: Joi.date().iso().required(),
    price: Joi.number().precision(2).min(0).required(),
    available_seats: Joi.number().integer().min(1).required()
});

export async function createTrip(req, res, next) {
    try {
        const { error, value } = createTripSchema.validate(req.body);
        if (error) { error.status = 422; throw error; }

        const driver_id = req.user.id;
        const { departure_city, destination_city, departure_date, price, available_seats } = value;

        const [users] = await pool.query('SELECT role FROM users WHERE id = ?', [driver_id]);
        if (users.length === 0 || users[0].role !== 'driver') {
            return res.status(403).json({ error: 'Only drivers can create trips' });
        }

        const [result] = await pool.query(
            `INSERT INTO trips (driver_id, departure_city, destination_city, departure_date, price, available_seats, status)
       VALUES (?, ?, ?, ?, ?, ?, 'open')`,
            [driver_id, departure_city, destination_city, departure_date, price, available_seats]
        );

        res.status(201).json({ id: result.insertId });
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

