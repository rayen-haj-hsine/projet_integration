import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function migrateRecurringTrips() {
    let connection;
    try {
        console.log('🔄 Migrating trips table for recurring trips...');

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

        // Add columns
        const columnsToAdd = [
            "ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE",
            "ADD COLUMN recurrence_pattern ENUM('none', 'daily', 'weekly', 'weekdays') DEFAULT 'none'",
            "ADD COLUMN recurrence_end_date DATE NULL",
            "ADD COLUMN parent_trip_id INT NULL"
        ];

        for (const col of columnsToAdd) {
            try {
                await connection.query(`ALTER TABLE trips ${col}`);
                console.log(`   ✅ Added column: ${col.split(' ')[2]}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`   ⚠️ Column already exists: ${col.split(' ')[2]}`);
                } else {
                    throw err;
                }
            }
        }

        // Add foreign key for parent_trip_id (self-referencing)
        try {
            await connection.query(`
                ALTER TABLE trips 
                ADD CONSTRAINT fk_parent_trip 
                FOREIGN KEY (parent_trip_id) REFERENCES trips(id) ON DELETE CASCADE
            `);
            console.log('   ✅ Added foreign key constraint for parent_trip_id');
        } catch (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log('   ⚠️ Foreign key constraint already exists');
            } else {
                console.warn('   ⚠️ Could not add foreign key (might be due to existing data or constraint):', err.message);
            }
        }

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

migrateRecurringTrips();
