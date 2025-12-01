import pool from './src/config/db.js';

async function inspectUsers() {
    try {
        const [rows] = await pool.query('SELECT id, name, email, role, is_verified FROM users');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

inspectUsers();
