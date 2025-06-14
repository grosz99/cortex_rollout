import axios from 'axios';

// Determine the API base URL based on the environment
const getBaseUrl = () => {
  // When deployed on Vercel, use relative URL for API calls
  if (process.env.VERCEL_URL || process.env.NODE_ENV === 'production') {
    return '/api';
  }
  // In development, use the local server
  return 'http://localhost:3002';
};

// Create an axios instance with environment-aware configuration
const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export default axiosInstance;
