import axios from 'axios';

async function testAdminFetch() {
    try {
        // Login as admin
        const loginRes = await axios.post('http://localhost:4000/api/auth/login', {
            email: 'admin@tripshare.com',
            password: 'adminpassword'
        });
        const token = loginRes.data.token;
        console.log('Admin logged in. Token:', token.substring(0, 20) + '...');

        // Fetch pending drivers
        const res = await axios.get('http://localhost:4000/api/admin/pending-drivers', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Pending drivers response:', res.data);
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

testAdminFetch();
