import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token if exists
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop if refresh token itself fails
    if (originalRequest.url?.includes('/auth/refresh')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.dispatchEvent(new Event('auth_session_expired'));
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('access_token');
        window.dispatchEvent(new Event('auth_session_expired'));
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the access token
        // TODO: no backend endpoint yet for token refresh — fallback to mock handling if 404
        let newAccessToken;
        try {
          const res = await axios.post(`${originalRequest.baseURL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          newAccessToken = res.data.data.access_token;
          localStorage.setItem('access_token', newAccessToken);
        } catch (refreshErr) {
          if (refreshErr.response?.status === 404 || refreshErr.code === 'ERR_NETWORK') {
            console.warn('// TODO: no backend endpoint yet for token refresh — using fallback mock refresh');
            // Mock refresh: just reuse existing token or simulate a fresh one
            newAccessToken = 'mock_access_token_' + Date.now();
            localStorage.setItem('access_token', newAccessToken);
          } else {
            throw refreshErr;
          }
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        isRefreshing = false;
        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new Event('auth_session_expired'));
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
