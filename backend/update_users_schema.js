import pool from './src/config/db.js';

async function updateSchema() {
    try {
        console.log('Updating users table schema...');

        // 1. Add new columns
        // We use separate queries to avoid errors if columns already exist (though in a real migration we'd check first)
        // Adding columns one by one or in a block.

        // Add profile_photo
        try {
            await pool.query('ALTER TABLE users ADD COLUMN profile_photo VARCHAR(255) DEFAULT NULL');
            console.log('Added profile_photo column.');
        } catch (e) { console.log('profile_photo column might already exist or error:', e.message); }

        // Add license_document
        try {
            await pool.query('ALTER TABLE users ADD COLUMN license_document VARCHAR(255) DEFAULT NULL');
            console.log('Added license_document column.');
        } catch (e) { console.log('license_document column might already exist or error:', e.message); }

        // Add is_verified
        try {
            await pool.query('ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT TRUE');
            // Default TRUE for backward compatibility/passengers. We will force FALSE for new drivers in code.
            console.log('Added is_verified column.');
        } catch (e) { console.log('is_verified column might already exist or error:', e.message); }

        // 2. Update role ENUM to include 'admin'
        try {
            await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('driver', 'passenger', 'admin') NOT NULL");
            console.log("Updated role ENUM to include 'admin'.");
        } catch (e) { console.error('Failed to update role ENUM:', e.message); }

        console.log('Schema update complete.');

    } catch (err) {
        console.error('Schema update failed:', err);
    } finally {
        await pool.end();
    }
}

updateSchema();
