import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Determine backend URL (from VITE_API_BASE_URL, or smart fallback based on hostname)
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // If running locally in browser
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000/api/v1';
  }
  // Production fallback for deployed web application
  return 'https://heatway-predict.onrender.com/api/v1';
};

const axiosClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.dispatchEvent(new Event('auth_session_expired'));
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
