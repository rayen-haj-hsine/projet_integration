import axios from 'axios';

async function check() {
    try {
        const res = await axios.get('http://localhost:4000/health');
        console.log('Server is UP:', res.data);
    } catch (err) {
        console.log('Server check failed:', err.message);
    }
}
check();
