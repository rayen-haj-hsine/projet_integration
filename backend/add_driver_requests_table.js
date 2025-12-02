import pool from './src/config/db.js';

async function addDriverRequestsTable() {
    let connection;
    try {
        console.log('🔄 Connecting to database...\n');
        connection = await pool.getConnection();
        console.log('✅ Connected!\n');

        console.log('📦 Creating driver_requests table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS driver_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                profile_photo VARCHAR(255),
                license_document VARCHAR(255),
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TIMESTAMP NULL,
                admin_notes TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_status (status),
                INDEX idx_user (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('   ✅ driver_requests table created\n');

        console.log('🎉 Migration complete!');
        connection.release();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (connection) connection.release();
        process.exit(1);
    }
}

addDriverRequestsTable();
