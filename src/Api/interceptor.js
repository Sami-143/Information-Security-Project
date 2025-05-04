
import axios from 'axios';
import { store } from '../Redux/store.js';

const BASE_URL = 'https://dead-michele-sami-143-d0da6b25.koyeb.app';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

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
