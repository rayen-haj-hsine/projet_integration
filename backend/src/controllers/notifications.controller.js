
import pool from '../config/db.js';

export async function listNotifications(req, res, next) {
    try {
        const [rows] = await pool.query(
            'SELECT id, message, type, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
}

export async function markRead(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        const [rows] = await pool.query(
            'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Notification not found' });
        await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
        res.json({ id, is_read: 1 });
    } catch (err) {
        next(err);
    }
}
