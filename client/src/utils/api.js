import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Shared axios instance with CSRF protection
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Send cookies (session + CSRF)
});

// ─── CSRF Token Management ───
let csrfToken = null;

// Fetch a CSRF token from the server
async function fetchCsrfToken() {
    try {
        const res = await axios.get(`${API_URL}/auth/csrf-token`, {
            withCredentials: true,
        });
        csrfToken = res.data.csrfToken;
    } catch (err) {
        console.error('Failed to fetch CSRF token:', err.message);
    }
}

// Automatically attach the CSRF token to every state-changing request
api.interceptors.request.use(async (config) => {
    const method = config.method?.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        // Fetch token if we don't have one yet
        if (!csrfToken) {
            await fetchCsrfToken();
        }
        if (csrfToken) {
            config.headers['x-csrf-token'] = csrfToken;
        }
    }
    return config;
});

// If a request fails with 403 (CSRF invalid), refresh the token and retry once
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response?.status === 403 &&
            !originalRequest._csrfRetry &&
            error.response?.data?.message?.toLowerCase().includes('csrf')
        ) {
            originalRequest._csrfRetry = true;
            await fetchCsrfToken();
            originalRequest.headers['x-csrf-token'] = csrfToken;
            return api(originalRequest);
        }
        return Promise.reject(error);
    }
);

// Fetch the initial CSRF token on app load
fetchCsrfToken();

export default api;
