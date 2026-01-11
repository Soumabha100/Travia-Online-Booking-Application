// Comment added to Test the new Work flow

let apiBaseUrl;
const hostname = window.location.hostname;

let localHostUrl = "http://localhost:8001/api";
let serverHostURL = "https://travia-online-booking-application-backend.onrender.com/api";

let isLocalHost = false;

if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // 1. Local Development
    
    apiBaseUrl = isLocalHost ? localHostUrl : serverHostURL;
    console.log('[Travia] Environment: LOCAL');
} 
else if (hostname.includes('dev') || hostname.includes('staging')) {
    // 2. User Acceptance Testing
    apiBaseUrl = serverHostURL;
    console.log('[Travia] Environment: STAGING/DEV');
} 
else {
    // 3. Production Environment (Live Site)
    apiBaseUrl = serverHostURL;
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