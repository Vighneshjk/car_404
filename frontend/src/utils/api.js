import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Handle Token Refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const { data } = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', {
                        refresh: refreshToken,
                    });
                    localStorage.setItem('access_token', data.access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            }
        }

        // Global Error Handling
        let errorMessage = 'An unexpected error occurred.';
        if (!error.response) {
            errorMessage = 'Network Error: Cannot connect to the server. Please check your connection or ensures the backend is running.';
        } else if (error.response.status >= 500) {
            errorMessage = 'Server Error: The server encountered an issue. Please try again later.';
        } else if (error.response.data?.detail) {
            errorMessage = error.response.data.detail;
        } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
        }

        // Dispatch notification event
        window.dispatchEvent(new CustomEvent('app-notify', {
            detail: { message: errorMessage, type: 'error' }
        }));

        return Promise.reject(error);
    }
);

export default api;
