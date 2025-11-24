
import pool from '../config/db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import Joi from 'joi';

/**
 * Schemas
 */
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().max(150).required(),
    password: Joi.string().min(6).max(100).required(),
    phone: Joi.string().max(20).allow(null, ''),
    role: Joi.string().valid('driver', 'passenger').required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const updateMeSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().max(150).optional(),
    phone: Joi.string().max(20).allow(null, '').optional()
}).min(1);

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(100).required()
});

/**
 * Auth handlers
 */
export async function register(req, res, next) {
    try {
        const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
        if (error) { error.status = 422; throw error; }

        const { name, email, password, phone, role } = value;

        const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (exists.length > 0) return res.status(409).json({ error: 'Email already registered' });

        const password_hash = await hashPassword(password);
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, password_hash, phone ?? null, role]
        );

        const token = signToken({ id: result.insertId, role, name });
        res.status(201).json({ id: result.insertId, name, email, role, token });
    } catch (err) {
        next(err);
    }
}

export async function login(req, res, next) {
    try {
        const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
        if (error) { error.status = 422; throw error; }

        const { email, password } = value;
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = rows[0];
        const ok = await verifyPassword(password, user.password_hash);
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

        const token = signToken({ id: user.id, role: user.role, name: user.name });
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token });
    } catch (err) {
        next(err);
    }
}

/**
 * Profile handlers
 */
export async function getMe(req, res, next) {
    try {
        const userId = req.user.id;
        const [rows] = await pool.query(
            'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
            [userId]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
}

export async function updateMe(req, res, next) {
    try {
        const { error, value } = updateMeSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) { error.status = 422; throw error; }

        const userId = req.user.id;

        const [rows] = await pool.query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const current = rows[0];

        const nextName = value.name ?? current.name;
        const nextEmail = value.email ?? current.email;
        const nextPhone = value.phone ?? current.phone;

        if (value.email && value.email !== current.email) {
            const [exists] = await pool.query('SELECT id FROM users WHERE email = ? AND id <> ?', [value.email, userId]);
            if (exists.length > 0) return res.status(409).json({ error: 'Email already in use' });
        }

        await pool.query(
            'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
            [nextName, nextEmail, nextPhone, userId]
        );

        const token = signToken({ id: userId, role: current.role, name: nextName });

        res.json({
            id: userId,
            name: nextName,
            email: nextEmail,
            phone: nextPhone,
            role: current.role,
            token
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Change password
 */
export async function changePassword(req, res, next) {
    try {
        const { error, value } = changePasswordSchema.validate(req.body, { abortEarly: false });
        if (error) { error.status = 422; throw error; }

        const userId = req.user.id;
        const { currentPassword, newPassword } = value;

        const [rows] = await pool.query('SELECT id, password_hash FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = rows[0];
        const matches = await verifyPassword(currentPassword, user.password_hash);
        if (!matches) return res.status(401).json({ error: 'Current password is incorrect' });

        // Optional: block if new equals current
        const same = await verifyPassword(newPassword, user.password_hash);
        if (same) return res.status(422).json({ error: 'New password must be different from current password' });

        const newHash = await hashPassword(newPassword);
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

        // No need to reissue token on password change; keep current session
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        next(err);
    }
}
