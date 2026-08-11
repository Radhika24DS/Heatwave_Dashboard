import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const axiosClient = axios.create({
  baseURL: 'https://heatway-predict.onrender.com/api/v1',
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
