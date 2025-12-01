import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

async function testAdminEndpoint() {
    try {
        // 1. Login as Admin
        console.log('1️⃣ Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@tripshare.com',
            password: 'adminpassword'
        });
        const token = loginRes.data.token;
        console.log('   ✅ Logged in successfully\n');

        // 2. Fetch Pending Drivers
        console.log('2️⃣ Fetching pending drivers from API...');
        const res = await axios.get(`${API_URL}/admin/pending-drivers`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`   ✅ API Response: Found ${res.data.length} pending driver(s)\n`);

        if (res.data.length > 0) {
            console.log('📋 Pending Drivers:\n');
            res.data.forEach((driver, i) => {
                console.log(`${i + 1}. ${driver.name}`);
                console.log(`   Email: ${driver.email}`);
                console.log(`   Phone: ${driver.phone || 'N/A'}`);
                console.log(`   Profile Photo: ${driver.profile_photo || 'None'}`);
                console.log(`   License: ${driver.license_document || 'None'}`);
                console.log('');
            });

            console.log('🎉 API is working correctly!');
            console.log('\n📝 Next steps:');
            console.log('   1. Go to http://localhost:5173');
            console.log('   2. Make sure you\'re logged in as admin');
            console.log('   3. Navigate to the Admin Dashboard (Driver Requests)');
            console.log('   4. Press F5 to refresh the page');
            console.log('   5. You should see the pending driver(s)');
        } else {
            console.log('⚠️  API returns no pending drivers');
            console.log('   But we know tlili@gmail.com is in the database...');
            console.log('   The backend controller might have an issue.');
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.log('\n⚠️  Authentication failed - check admin credentials');
        }
    }
}

testAdminEndpoint();
