import axios from 'axios';
import { API_CONFIG } from '../config';

// Create a centralized axios instance that will be used for all API calls
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to attach the auth token to every request
axiosInstance.interceptors.request.use(
  config => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common error cases
axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle 401 Unauthorized errors (expired or invalid token)
    if (error.response && error.response.status === 401) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('role');
      
      // Redirect to login page
      window.location.href = '/auth/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;