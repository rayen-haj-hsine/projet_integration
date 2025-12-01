import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

async function testPhoneVerification() {
    try {
        // 1. Login
        console.log('1️⃣ Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@tripshare.com',
            password: 'adminpassword'
        });
        const token = loginRes.data.token;
        console.log('   ✅ Logged in successfully\n');

        // 2. Check Current Status
        console.log('2️⃣ Checking current verification status...');
        const getRes1 = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   is_phone_verified: ${getRes1.data.is_phone_verified}\n`);

        // 3. Verify Phone with Mock Code
        console.log('3️⃣ Verifying phone with code "123456"...');
        const verifyRes = await axios.post(`${API_URL}/auth/me/verify-phone`, {
            code: '123456'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   ✅ ${verifyRes.data.message}\n`);

        // 4. Verify Status Changed
        console.log('4️⃣ Verifying status changed...');
        const getRes2 = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   is_phone_verified: ${getRes2.data.is_phone_verified}`);

        if (getRes2.data.is_phone_verified) {
            console.log('\n✅ TEST PASSED: Phone verification successful!');
        } else {
            console.log('\n❌ TEST FAILED: Phone not verified.');
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
    }
}

testPhoneVerification();
