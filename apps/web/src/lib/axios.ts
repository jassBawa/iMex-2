import axios from 'axios';

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401, it means the user is not authenticated
    if (error.response?.status === 401) {
      console.warn('Authentication failed, user may need to login again');
      // You could dispatch an action to clear user state here if using Redux/Context
    }
    return Promise.reject(error);
  }
);

export default api;
