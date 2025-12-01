import pool from './src/config/db.js';

async function showAllUsers() {
    try {
        console.log('👥 All Users in Database:\n');
        console.log('='.repeat(80));

        const [users] = await pool.query(
            'SELECT id, name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC'
        );

        if (users.length === 0) {
            console.log('No users found.');
        } else {
            users.forEach((user, index) => {
                console.log(`\n${index + 1}. ${user.name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Verified: ${user.is_verified ? 'YES' : 'NO (Pending)'}`);
                console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);

                if (user.role === 'driver' && !user.is_verified) {
                    console.log('   ⚠️  THIS DRIVER NEEDS ADMIN APPROVAL');
                }
            });

            console.log('\n' + '='.repeat(80));
            console.log(`\nTotal: ${users.length} user(s)`);

            const pendingDrivers = users.filter(u => u.role === 'driver' && !u.is_verified);
            if (pendingDrivers.length > 0) {
                console.log(`\n⚠️  ${pendingDrivers.length} driver(s) waiting for approval!`);
            } else {
                console.log('\n✅ No pending driver approvals');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

showAllUsers();
