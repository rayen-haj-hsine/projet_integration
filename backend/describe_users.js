import pool from './src/config/db.js';

async function describeUsers() {
    try {
        const [columns] = await pool.query('DESCRIBE users');
        console.log('\n📊 Users Table Structure:\n');
        console.log('Column'.padEnd(20), 'Type'.padEnd(30), 'Null', 'Key', 'Default');
        console.log('='.repeat(90));
        columns.forEach(col => {
            console.log(
                col.Field.padEnd(20),
                col.Type.padEnd(30),
                col.Null.padEnd(5),
                (col.Key || '').padEnd(5),
                col.Default || 'NULL'
            );
        });

        // Test the actual query
        console.log('\n🔍 Testing pending drivers query...\n');
        const [drivers] = await pool.query(
            `SELECT id, name, email FROM users WHERE role = 'driver' AND is_verified = 0`
        );
        console.log(`Result: Found ${drivers.length} pending driver(s)`);
        if (drivers.length > 0) {
            drivers.forEach(d => console.log(`  - ${d.name} (${d.email})`));
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('SQL State:', error.sqlState);
        process.exit(1);
    }
}

describeUsers();
