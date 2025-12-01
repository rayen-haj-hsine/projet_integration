import pool from './src/config/db.js';

async function verify() {
    try {
        console.log('Verifying schema fix...');

        // Insert with the problematic type
        const [res] = await pool.query(
            'INSERT INTO notifications (user_id, message, type, is_read) VALUES (?, ?, "reservation_request", 0)',
            [1, 'Test fix'] // Assuming user ID 1 exists, if not it might fail foreign key constraint. 
            // Better to fetch a real user first.
        );

        // Fetch it back
        const [rows] = await pool.query('SELECT type FROM notifications WHERE id = ?', [res.insertId]);
        console.log('Inserted Type:', rows[0].type);

        // Cleanup
        await pool.query('DELETE FROM notifications WHERE id = ?', [res.insertId]);

    } catch (err) {
        // If user 1 doesn't exist, try to find one
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            console.log('User 1 not found, finding a valid user...');
            const [users] = await pool.query('SELECT id FROM users LIMIT 1');
            if (users.length) {
                const userId = users[0].id;
                const [res] = await pool.query(
                    'INSERT INTO notifications (user_id, message, type, is_read) VALUES (?, ?, "reservation_request", 0)',
                    [userId, 'Test fix']
                );
                const [rows] = await pool.query('SELECT type FROM notifications WHERE id = ?', [res.insertId]);
                console.log('Inserted Type:', rows[0].type);
                await pool.query('DELETE FROM notifications WHERE id = ?', [res.insertId]);
            }
        } else {
            console.error('Verification failed:', err);
        }
    } finally {
        await pool.end();
    }
}

verify();
