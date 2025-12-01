import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

async function testProfileUpdate() {
    try {
        // 1. Login
        console.log('1️⃣ Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@tripshare.com',
            password: 'adminpassword'
        });
        const token = loginRes.data.token;
        console.log('   ✅ Logged in successfully\n');

        // 2. Update Profile with Bio and Preferences
        console.log('2️⃣ Updating profile...');
        const updateRes = await axios.put(`${API_URL}/auth/me`, {
            bio: 'I love coding and traveling! 🌍💻',
            preferences: {
                music: true,
                smoking: false,
                pets: true
            }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('   ✅ Profile updated:', updateRes.data);

        // 3. Verify Update
        console.log('\n3️⃣ Verifying update...');
        const getRes = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const profile = getRes.data;
        console.log('   Fetched Profile:', profile);

        if (profile.bio === 'I love coding and traveling! 🌍💻' &&
            profile.preferences.music === true &&
            profile.preferences.pets === true) {
            console.log('\n✅ TEST PASSED: Bio and Preferences saved correctly!');
        } else {
            console.log('\n❌ TEST FAILED: Data mismatch.');
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
    }
}

testProfileUpdate();
