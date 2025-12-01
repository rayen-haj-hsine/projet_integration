import pool from './src/config/db.js';

async function inspect() {
    try {
        console.log('Inspecting users table schema...');
        const [rows] = await pool.query('DESCRIBE users');
        rows.forEach(row => {
            console.log(`${row.Field}: ${row.Type}`);
        });
    } catch (err) {
        console.error('Inspection failed:', err);
    } finally {
        await pool.end();
    }
}

inspect();
