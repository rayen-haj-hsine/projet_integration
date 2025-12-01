import pool from './src/config/db.js';

async function checkPendingDrivers() {
    try {
        console.log('🔍 Checking for pending drivers (is_verified = 0)...\n');

        const [drivers] = await pool.query(
            'SELECT id, name, email, phone, profile_photo, license_document, created_at FROM users WHERE role = "driver" AND is_verified = 0'
        );

        console.log(`Found ${drivers.length} pending driver(s):\n`);

        if (drivers.length === 0) {
            console.log('✅ No pending drivers (all are verified or no drivers registered)');

            // Check if there are any drivers at all
            const [allDrivers] = await pool.query('SELECT id, name, email, is_verified FROM users WHERE role = "driver"');
            if (allDrivers.length > 0) {
                console.log(`\n📊 Total drivers in system: ${allDrivers.length}`);
                allDrivers.forEach(d => {
                    console.log(`   - ${d.name} (${d.email}) - Verified: ${d.is_verified ? 'YES' : 'NO'}`);
                });
            }
        } else {
            drivers.forEach((driver, i) => {
                console.log(`${i + 1}. ${driver.name}`);
                console.log(`   Email: ${driver.email}`);
                console.log(`   Phone: ${driver.phone || 'Not provided'}`);
                console.log(`   Profile Photo: ${driver.profile_photo ? 'Uploaded' : 'Missing'}`);
                console.log(`   License: ${driver.license_document ? 'Uploaded' : 'Missing'}`);
                console.log(`   Registered: ${new Date(driver.created_at).toLocaleString()}`);
                console.log('');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

checkPendingDrivers();
