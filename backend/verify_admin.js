import pool from './src/config/db.js';

async function verifyAdmin() {
    try {
        console.log('🔍 Checking database for admin user...\n');

        // Check all users
        const [users] = await pool.query('SELECT id, name, email, role, is_verified FROM users');

        if (users.length === 0) {
            console.log('⚠️  No users found in database!\n');
            console.log('Run this command to create admin:');
            console.log('   node create_admin.js\n');
        } else {
            console.log(`✅ Found ${users.length} user(s):\n`);
            users.forEach(user => {
                console.log(`   ID: ${user.id}`);
                console.log(`   Name: ${user.name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Verified: ${user.is_verified ? 'Yes' : 'No'}`);
                console.log('   ---');
            });

            const admin = users.find(u => u.role === 'admin');
            if (admin) {
                console.log('\n🎉 Admin user found!');
                console.log('\n📝 Login credentials:');
                console.log(`   Email: ${admin.email}`);
                console.log('   Password: adminpassword');
            } else {
                console.log('\n⚠️  No admin user found!');
                console.log('Run: node create_admin.js');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyAdmin();
