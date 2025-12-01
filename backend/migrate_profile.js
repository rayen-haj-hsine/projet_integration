import pool from './src/config/db.js';

async function migrateProfileFields() {
    try {
        console.log('🔄 Starting database migration for Profile Enhancements...');

        // Add 'bio' column
        try {
            console.log('   Adding "bio" column...');
            await pool.query('ALTER TABLE users ADD COLUMN bio TEXT');
            console.log('   ✅ "bio" column added.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('   ℹ️ "bio" column already exists.');
            } else {
                throw err;
            }
        }

        // Add 'preferences' column
        try {
            console.log('   Adding "preferences" column...');
            // Storing preferences as a JSON string or JSON type if supported. 
            // Using JSON type for better flexibility if MySQL version supports it (MySQL 5.7+).
            // Aiven MySQL usually supports JSON.
            await pool.query('ALTER TABLE users ADD COLUMN preferences JSON');
            console.log('   ✅ "preferences" column added.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('   ℹ️ "preferences" column already exists.');
            } else {
                throw err;
            }
        }

        console.log('\n🎉 Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrateProfileFields();
