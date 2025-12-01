import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function removeLocationTracking() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
        });

        console.log('Connected to database');

        // Check if columns exist
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'trips' 
            AND COLUMN_NAME IN ('current_latitude', 'current_longitude', 'last_location_update')
        `, [process.env.DB_NAME]);

        if (columns.length === 0) {
            console.log('⚠️  Location tracking columns do not exist. Nothing to remove.');
            return;
        }

        console.log('Removing location tracking columns from trips table...');

        // Remove location tracking columns
        await connection.query(`
            ALTER TABLE trips
            DROP COLUMN current_latitude,
            DROP COLUMN current_longitude,
            DROP COLUMN last_location_update
        `);

        console.log('✅ Successfully removed location tracking columns');

    } catch (error) {
        console.error('❌ Removal failed:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nDatabase connection closed');
        }
    }
}

removeLocationTracking();
