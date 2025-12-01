import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

async function testApprovedDrivers() {
    try {
        // 1. Login as Admin
        console.log('1️⃣ Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@tripshare.com',
            password: 'adminpassword'
        });
        const token = loginRes.data.token;
        console.log('   ✅ Logged in successfully\n');

        // 2. Fetch Approved Drivers
        console.log('2️⃣ Fetching approved drivers from API...');
        const res = await axios.get(`${API_URL}/admin/drivers`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`   ✅ API Response: Found ${res.data.length} approved driver(s)\n`);

        if (res.data.length > 0) {
            console.log('📋 Approved Drivers:\n');
            res.data.forEach((driver, i) => {
                console.log(`${i + 1}. ${driver.name}`);
                console.log(`   Email: ${driver.email}`);
                console.log(`   Phone: ${driver.phone || 'N/A'}`);
                console.log(`   Profile Photo: ${driver.profile_photo || 'None'}`);
                console.log('');
            });
        } else {
            console.log('⚠️  No approved drivers found.');
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
    }
}

testApprovedDrivers();
