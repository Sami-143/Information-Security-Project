// src/api/authApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // You can change this to your deployed URL when needed

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

  verifyOtp: async (email, otp_code) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/verify-email`, { email, otp_code });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'OTP verification failed';
    }
  },

  resendOtp: async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/resend-otp`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Resend OTP failed';
    }
  },
};

export default authApi;
