import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function fixReservationStatus() {
    let connection;
    try {
        console.log('🔄 Fixing reservations status column...');
        console.log(`   Host: ${process.env.DB_HOST}`);

        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            ssl: { rejectUnauthorized: false },
            connectTimeout: 20000
        });

        console.log('   ✅ Connected to database.');

        // Check current column definition
        const [columns] = await connection.query(
            `SHOW COLUMNS FROM reservations WHERE Field = 'status'`
        );

        if (columns.length > 0) {
            console.log('   Current status column:', columns[0]);
        }

        // Fix the status column to have correct ENUM values
        console.log('   Modifying status column...');
        await connection.query(`
            ALTER TABLE reservations 
            MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending'
        `);
        console.log('   ✅ Status column fixed.');

        // Verify the fix
        const [newColumns] = await connection.query(
            `SHOW COLUMNS FROM reservations WHERE Field = 'status'`
        );
        console.log('   New status column:', newColumns[0]);

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

fixReservationStatus();
