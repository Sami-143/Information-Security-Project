// src/api/authApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; 

const authApi = {
  signIn: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/signin`, { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Sign in failed';
    }
  },

  signUp: async (name, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, { name, email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Sign up failed';
    }
  },

  googleAuth: async (code) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/google/callback?code=${code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Google authentication failed';
    }
  },
};

export default authApi;
