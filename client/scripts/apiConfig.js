const isLocalHost = false;


const LOCAL_URL = "http://localhost:8001/api"
const PROD_URL = "https://travia-online-booking-application-backend.onrender.com/api";

const API_BASE_URL = isLocalHost ? LOCAL_URL : PROD_URL ;

console.log(`%c [Travia API] Switched to: ${isLocalHost ? 'LOCALHOST' : 'PRODUCTION'} `, 'background: #002a3d; color: #1dd3b0; font-weight: bold;');

const API = {
    // 1. Base URL
    baseUrl: API_BASE_URL, 
    
    // 2. Admin Routes (For admin.js)
    admin: `${API_BASE_URL}/admin`,

    // 3. Public Routes (For destinations.js)
    destinations: `${API_BASE_URL}/destinations`,
    
    // 4. Booking & Auth
    bookings: `${API_BASE_URL}/booking`, 
    auth: {
        register: `${API_BASE_URL}/auth/register`,
        login: `${API_BASE_URL}/auth/login`,
    }
};

window.TraviaAPI = API;