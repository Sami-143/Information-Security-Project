
import axios from 'axios';
import { store } from '../Redux/store.js';

const BASE_URL = 'http://localhost:8000'; // or your deployed URL

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Automatically attach token from redux state (or localStorage fallback)
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
