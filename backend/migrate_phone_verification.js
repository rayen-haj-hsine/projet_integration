import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function migratePhoneVerification() {
    let connection;
    try {
        console.log('🔄 Starting Phone Verification migration...');
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

        // Add 'is_phone_verified' column
        try {
            console.log('   Adding "is_phone_verified" column...');
            await connection.query('ALTER TABLE users ADD COLUMN is_phone_verified BOOLEAN DEFAULT FALSE');
            console.log('   ✅ "is_phone_verified" column added.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('   ℹ️ "is_phone_verified" column already exists.');
            } else {
                throw err;
            }
        }

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

migratePhoneVerification();
