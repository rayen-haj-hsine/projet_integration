import pool from './src/config/db.js';
import { hashPassword } from './src/utils/password.js';

async function createAdmin() {
    try {
        const email = 'admin@tripshare.com';
        const password = 'adminpassword';
        const name = 'Super Admin';

        console.log('🔐 Hashing password...');
        const hash = await hashPassword(password);

        // Check if exists
        console.log('🔍 Checking if admin exists...');
        const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

        if (exists.length > 0) {
            console.log('👤 Admin already exists. Updating to ensure admin role...');
            await pool.query(
                'UPDATE users SET role = ?, is_verified = 1 WHERE email = ?',
                ['admin', email]
            );
            console.log('✅ Admin user updated!');
        } else {
            console.log('👤 Creating new admin user...');
            await pool.query(
                'INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, 1)',
                [name, email, hash, 'admin']
            );
            console.log('✅ Admin user created!');
        }

        console.log('\n📧 Email: ' + email);
        console.log('🔑 Password: ' + password);
        console.log('\n🎉 Admin setup complete!');

    } catch (err) {
        console.error('\n❌ Failed to create admin:', err.message);
        console.error('Full error:', err);
    } finally {
        await pool.end();
    }
}

createAdmin();
