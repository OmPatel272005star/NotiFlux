import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add API key to headers
api.interceptors.request.use(
    (config) => {
        const apiKey = localStorage.getItem('apiKey');
        if (apiKey) {
            config.headers['x-api-key'] = apiKey;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';

        if (error.response?.status === 401) {
            toast.error('Authentication failed. Please login again.');
            localStorage.removeItem('apiKey');
            localStorage.removeItem('userEmail');
            window.location.href = '/login';
        } else if (error.response?.status === 403) {
            toast.error('Access forbidden. Invalid API key.');
        } else {
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

// ========================================
// API Methods
// ========================================

// Client APIs
export const registerClient = async (data) => {
    const response = await api.post('/client/register', data);
    return response.data;
};

export const getClientInfo = async () => {
    const response = await api.get('/client/me');
    return response.data;
};

// Notification APIs
export const sendNotification = async (data) => {
    const response = await api.post('/notifications', data);
    return response.data;
};

export const getNotifications = async (params) => {
    const response = await api.get('/notifications', { params });
    return response.data;
};

export const getNotificationById = async (id) => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
};

export default api;
