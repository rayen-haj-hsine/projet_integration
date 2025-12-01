import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

async function testPassengerList() {
    try {
        // 1. Login as Admin
        console.log('Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@tripshare.com',
            password: 'adminpassword'
        });
        const token = loginRes.data.token;
        console.log('Admin logged in.');

        // 2. Fetch Passengers
        console.log('Fetching passengers...');
        const res = await axios.get(`${API_URL}/admin/passengers`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Passengers found:', res.data.length);
        if (res.data.length > 0) {
            console.log('Sample passenger:', JSON.stringify(res.data[0], null, 2));
        } else {
            console.log('No passengers found (this might be expected if none registered).');
        }

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

testPassengerList();
