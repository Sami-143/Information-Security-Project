import axios from 'axios';

const API_BASE_URL = "http://localhost:8000";

export const verifyRecaptcha = async (token) => {
    const res = await axios.post(`${API_BASE_URL}/security/verify-recaptcha`, {
      token,
    });
    return res.data;
  }