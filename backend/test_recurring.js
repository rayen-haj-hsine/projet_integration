import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

async function testRecurringTrip() {
    try {
        // 0. Register new driver
        const email = `driver_${Date.now()}@example.com`;
        const password = 'password123';
        console.log(`Registering driver: ${email}...`);

        await axios.post(`${API_URL}/auth/register`, {
            name: 'Test Driver',
            email: email,
            password: password,
            role: 'driver',
            phone: '12345678'
        });

        // 0.5 Approve driver (Admin)
        console.log('Approving driver as Admin...');
        const adminLogin = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@tripshare.com',
            password: 'adminpassword'
        });
        const adminToken = adminLogin.data.token;

        // Find the pending driver
        const pendingDrivers = await axios.get(`${API_URL}/admin/pending-drivers`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        const driver = pendingDrivers.data.find(d => d.email === email);
        if (!driver) throw new Error('Driver not found in pending list');

        await axios.patch(`${API_URL}/admin/approve-driver/${driver.id}`, {}, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Driver approved');

        // 1. Login as driver
        console.log('Logging in as driver...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: email,
            password: password
        });
        const token = loginRes.data.token;
        console.log('✅ Login successful');

        // 2. Publish recurring trip
        console.log('Publishing recurring trip...');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 1); // Tomorrow
        startDate.setHours(8, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 5); // 5 days later

        const tripData = {
            departure_city: 'Test City A',
            destination_city: 'Test City B',
            departure_date: startDate.toISOString(),
            price: 20,
            available_seats: 3,
            is_recurring: true,
            recurrence_pattern: 'daily',
            recurrence_end_date: endDate.toISOString().split('T')[0]
        };

        const createRes = await axios.post(`${API_URL}/trips`, tripData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Trip published response:', createRes.data);

        if (createRes.data.generated_trips > 0) {
            console.log(`🎉 Success! Created ${createRes.data.generated_trips} additional recurring trips.`);
        } else {
            console.warn('⚠️ Warning: No recurring trips were generated.');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response ? error.response.data : error.message);
    }
}

testRecurringTrip();
