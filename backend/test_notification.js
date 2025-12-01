import pool from './src/config/db.js';

async function test() {
    try {
        console.log('Testing notification insertion...');

        // 1. Get a user to notify (driver)
        const [users] = await pool.query('SELECT id, name FROM users WHERE role = "driver" LIMIT 1');
        if (!users.length) {
            console.log('No drivers found to test with.');
            process.exit(1);
        }
        const driver = users[0];
        console.log(`Found driver: ${driver.name} (ID: ${driver.id})`);

        // 2. Insert notification
        const message = 'Test notification from script ' + Date.now();
        console.log(`Inserting notification for driver ${driver.id}...`);
        const [res] = await pool.query(
            'INSERT INTO notifications (user_id, message, type, is_read) VALUES (?, ?, "reservation_request", 0)',
            [driver.id, message]
        );
        console.log(`Insert result: ID ${res.insertId}`);

        // 3. Verify insertion
        const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [res.insertId]);
        if (rows.length) {
            console.log('SUCCESS: Notification found in DB:', rows[0]);
        } else {
            console.error('FAILURE: Notification NOT found in DB.');
        }

        // 4. Cleanup
        await pool.query('DELETE FROM notifications WHERE id = ?', [res.insertId]);
        console.log('Cleanup done.');

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await pool.end();
    }
}

test();
