import pool from './src/config/db.js';

async function checkDatabase() {
    try {
        console.log('🔍 Checking Aiven database connection...\n');

        // Test connection
        const connection = await pool.getConnection();
        console.log('✅ Connected to Aiven successfully!\n');

        // Check current database
        const [currentDb] = await connection.query('SELECT DATABASE() as db');
        console.log(`📊 Current database: ${currentDb[0].db}\n`);

        // List all tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`📋 Found ${tables.length} tables:`);
        if (tables.length > 0) {
            tables.forEach(table => {
                const tableName = Object.values(table)[0];
                console.log(`   - ${tableName}`);
            });
        } else {
            console.log('   ⚠️  No tables found!\n');
        }

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

checkDatabase();
