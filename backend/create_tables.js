import pool from './src/config/db.js';

async function createTables() {
    let connection;
    try {
        console.log('🔄 Connecting to Aiven database...\n');
        connection = await pool.getConnection();
        console.log('✅ Connected successfully!\n');

        // 1. Users table
        console.log('📦 Creating users table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                role ENUM('passenger', 'driver', 'admin') NOT NULL DEFAULT 'passenger',
                profile_photo VARCHAR(255),
                license_document VARCHAR(255),
                is_verified BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_role (role)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('   ✅ users table created\n');

        // 2. Trips table
        console.log('📦 Creating trips table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS trips (
                id INT AUTO_INCREMENT PRIMARY KEY,
                driver_id INT NOT NULL,
                departure_city VARCHAR(100) NOT NULL,
                destination_city VARCHAR(100) NOT NULL,
                departure_date DATETIME NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                available_seats INT NOT NULL,
                status ENUM('open', 'closed', 'cancelled') DEFAULT 'open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_driver (driver_id),
                INDEX idx_departure_date (departure_date),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('   ✅ trips table created\n');

        // 3. Reservations table
        console.log('📦 Creating reservations table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS reservations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                trip_id INT NOT NULL,
                passenger_id INT NOT NULL,
                status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
                FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_trip (trip_id),
                INDEX idx_passenger (passenger_id),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('   ✅ reservations table created\n');

        // 4. Notifications table
        console.log('📦 Creating notifications table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50),
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user (user_id),
                INDEX idx_is_read (is_read)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('   ✅ notifications table created\n');

        // 5. Chats table
        console.log('📦 Creating chats table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS chats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_sender (sender_id),
                INDEX idx_receiver (receiver_id),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('   ✅ chats table created\n');

        // 6. Ratings table
        console.log('📦 Creating ratings table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS ratings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reservation_id INT NOT NULL,
                user_id INT NOT NULL,
                trip_id INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
                UNIQUE KEY unique_reservation_rating (reservation_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('   ✅ ratings table created\n');

        // Verify all tables
        console.log('📊 Verifying tables...');
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`\n✅ Successfully created ${tables.length} tables:`);
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   ✓ ${tableName}`);
        });

        console.log('\n🎉 Database setup complete!');
        console.log('\n📝 Next step: Run create_admin.js to create admin user');

        connection.release();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error creating tables:', error.message);
        console.error('SQL State:', error.sqlState);
        console.error('Error Code:', error.code);
        if (connection) connection.release();
        process.exit(1);
    }
}

createTables();
