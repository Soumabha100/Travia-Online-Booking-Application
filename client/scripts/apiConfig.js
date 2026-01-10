let apiBaseUrl;
const hostname = window.location.hostname;

if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // 1. Local Development
    apiBaseUrl = "http://localhost:8001/api";
    console.log('[Travia] Environment: LOCAL');
} 
else if (hostname.includes('dev') || hostname.includes('staging')) {
    apiBaseUrl = "https://travia-online-booking-application-backend.onrender.com/api";
    console.log('[Travia] Environment: STAGING/DEV');
} 
else {
    // 3. Production Environment (Live Site)
    apiBaseUrl = "https://travia-online-booking-application-backend.onrender.com/api";
    console.log('[Travia] Environment: PRODUCTION');
}

const API = {
    baseUrl: apiBaseUrl,
    admin: `${apiBaseUrl}/admin`,
    destinations: `${apiBaseUrl}/destinations`,
    bookings: `${apiBaseUrl}/booking`,
    auth: {
        register: `${apiBaseUrl}/auth/register`,
        login: `${apiBaseUrl}/auth/login`,
    }
};

window.TraviaAPI = API;