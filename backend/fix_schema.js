import pool from './src/config/db.js';

async function fix() {
    try {
        console.log('Modifying notifications table schema...');
        // Change type column to VARCHAR(50) to allow any string value
        await pool.query('ALTER TABLE notifications MODIFY COLUMN type VARCHAR(50) NOT NULL');
        console.log('Schema updated successfully.');
    } catch (err) {
        console.error('Schema update failed:', err);
    } finally {
        await pool.end();
    }
}

fix();
