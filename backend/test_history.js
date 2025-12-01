import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function testHistory() {
    try {
        // 1. Login as passenger (assuming user exists from previous tests)
        console.log('Logging in as passenger...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'jane@example.com', // Adjust if needed
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('✅ Login successful');

        // 2. Fetch history
        console.log('Fetching trip history...');
        const historyRes = await axios.get(`${API_URL}/trips/history`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`✅ History fetched. Found ${historyRes.data.length} past trips.`);
        if (historyRes.data.length > 0) {
            console.log('Sample trip:', historyRes.data[0]);
        } else {
            console.log('No past trips found (expected if no past reservations exist).');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response ? error.response.data : error.message);
    }
}

testHistory();
