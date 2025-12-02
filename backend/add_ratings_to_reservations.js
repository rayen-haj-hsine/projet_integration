import pool from './src/config/db.js';

async function migrate() {
    try {
        console.log('📦 Adding rating columns to reservations table...');

        // Check if columns exist
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'reservations' 
            AND COLUMN_NAME IN ('rating', 'rating_comment')
        `);

        if (columns.length === 0) {
            await pool.query(`
                ALTER TABLE reservations
                ADD COLUMN rating INT CHECK (rating BETWEEN 1 AND 5),
                ADD COLUMN rating_comment TEXT
            `);
            console.log('✅ Added rating and rating_comment columns');
        } else {
            console.log('ℹ️ Columns already exist');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
