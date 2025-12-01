import axios from 'axios';

// CONFIGURATION FOR MULTI-PC ACCESS
// Change this based on your setup:

// Option 1: Same computer or local network
// Use 'localhost' if running frontend and backend on the same PC
// Use your local IP (e.g., '192.168.1.100') if accessing from another PC on same WiFi
const BACKEND_HOST = 'localhost';

// Option 2: Different networks (using ngrok or deployed backend)
// Example: 'https://your-app.ngrok.io' or 'https://your-backend.herokuapp.com'
// const BACKEND_HOST = 'https://abc123.ngrok.io';

const BACKEND_PORT = '4000';

// Build the base URL
const baseURL = BACKEND_HOST.startsWith('http')
    ? `${BACKEND_HOST}/api`  // Full URL (ngrok or deployed)
    : `http://${BACKEND_HOST}:${BACKEND_PORT}/api`;  // Local/IP address

const api = axios.create({
    baseURL: baseURL,
});

// Add auth token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
