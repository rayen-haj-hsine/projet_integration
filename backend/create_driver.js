import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

async function createDriver() {
    try {
        const email = `driver_${Date.now()}@example.com`;
        const password = 'password123';

        console.log(`Creating driver: ${email}`);

        const res = await axios.post(`${API_URL}/auth/register`, {
            name: 'Test Driver',
            email: email,
            password: password,
            role: 'driver',
            phone: '12345678'
        });

        console.log('✅ Driver created:', res.data);
        console.log(`Use EMAIL: ${email}`);
        console.log(`Use PASSWORD: ${password}`);

    } catch (error) {
        console.error('❌ Failed to create driver:', error.response ? error.response.data : error.message);
    }
}

createDriver();
