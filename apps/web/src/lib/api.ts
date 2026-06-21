import axios from 'axios';
import { toast } from 'react-hot-toast';

// Use environment variable for API URL or default to localhost
const API_BASE_URL = typeof window !== 'undefined' 
  ? `${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}`
  : 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized
        toast.error('Session expired. Please log in again.');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          // Delay redirect slightly so user can see the toast
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
      } else if (status >= 500) {
        toast.error('A server error occurred. Please try again later.');
      } else if (data && data.message) {
        // Validation or other client errors from backend
        const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        toast.error(msg);
      } else {
        toast.error('An unexpected error occurred.');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('Error processing request.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
