const API_BASE_URL = "http://localhost:8001/api";

const API = {
    destinations: `${API_BASE_URL}/destinations`,
    bookings: `${API_BASE_URL}/booking`, 
    auth: {
        register: `${API_BASE_URL}/auth/register`,
        login: `${API_BASE_URL}/auth/login`
    }
};

window.TraviaAPI = API;