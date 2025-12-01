import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

async function testEditTrip() {
    try {
        // 0. Register new driver
        const email = `driver_edit_${Date.now()}@example.com`;
        const password = 'password123';
        console.log(`Registering driver: ${email}...`);

        await axios.post(`${API_URL}/auth/register`, {
            name: 'Test Driver Edit',
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

        // 2. Publish trip
        console.log('Publishing trip...');
        const tripData = {
            departure_city: 'Edit City A',
            destination_city: 'Edit City B',
            departure_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            price: 50,
            available_seats: 4
        };

        const createRes = await axios.post(`${API_URL}/trips`, tripData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const tripId = createRes.data.id;
        console.log(`✅ Trip published (ID: ${tripId})`);

        // 3. Edit trip
        console.log('Editing trip...');
        const updateData = {
            price: 60,
            available_seats: 5
        };

        const updateRes = await axios.patch(`${API_URL}/trips/${tripId}`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Update response:', updateRes.data);

        // 4. Verify update
        const tripRes = await axios.get(`${API_URL}/trips/${tripId}`);
        const updatedTrip = tripRes.data;

        if (updatedTrip.price === 60 && updatedTrip.available_seats === 5) {
            console.log('🎉 Success! Trip updated correctly.');
        } else {
            console.error('❌ Verification failed. Trip data:', updatedTrip);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response ? error.response.data : error.message);
    }
}

testEditTrip();
