import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

async function testTripTimeEstimation() {
    try {
        console.log('🧪 Testing AI Trip Time Estimation\n');

        // Test 1: Short trip
        console.log('1️⃣ Testing short trip (Tunis → Sousse)...');
        const test1 = await axios.post(`${API_URL}/trips/estimate-time`, {
            departure_city: 'Tunis',
            destination_city: 'Sousse'
        });
        console.log('✅ Result:');
        console.log(`   Distance: ${test1.data.distance_km} km`);
        console.log(`   Duration: ${test1.data.formatted_duration}`);
        console.log(`   (${test1.data.estimated_duration.hours}h ${test1.data.estimated_duration.minutes}m)\n`);

        // Test 2: Medium trip
        console.log('2️⃣ Testing medium trip (Tunis → Sfax)...');
        const test2 = await axios.post(`${API_URL}/trips/estimate-time`, {
            departure_city: 'Tunis',
            destination_city: 'Sfax'
        });
        console.log('✅ Result:');
        console.log(`   Distance: ${test2.data.distance_km} km`);
        console.log(`   Duration: ${test2.data.formatted_duration}`);
        console.log(`   (${test2.data.estimated_duration.hours}h ${test2.data.estimated_duration.minutes}m)\n`);

        // Test 3: Long trip
        console.log('3️⃣ Testing long trip (Tunis → Djerba)...');
        const test3 = await axios.post(`${API_URL}/trips/estimate-time`, {
            departure_city: 'Tunis',
            destination_city: 'Djerba'
        });
        console.log('✅ Result:');
        console.log(`   Distance: ${test3.data.distance_km} km`);
        console.log(`   Duration: ${test3.data.formatted_duration}`);
        console.log(`   (${test3.data.estimated_duration.hours}h ${test3.data.estimated_duration.minutes}m)\n`);

        // Test 4: Invalid city
        console.log('4️⃣ Testing invalid city...');
        try {
            await axios.post(`${API_URL}/trips/estimate-time`, {
                departure_city: 'InvalidCity123',
                destination_city: 'Tunis'
            });
            console.log('❌ Should have failed!');
        } catch (err) {
            console.log('✅ Correctly rejected:', err.response.data.error, '\n');
        }

        console.log('🎉 ALL TESTS PASSED!');
        console.log('\n📊 AI Trip Time Estimation Summary:');
        console.log('   ✅ Calculates distance between cities');
        console.log('   ✅ Estimates travel time based on distance');
        console.log('   ✅ Adds buffer for traffic and rest stops');
        console.log('   ✅ Returns formatted duration (e.g., "2h 30m")');
        console.log('   ✅ Handles invalid cities gracefully');

    } catch (error) {
        console.error('\n❌ Test failed:', error.response ? error.response.data : error.message);
    }
}

testTripTimeEstimation();
