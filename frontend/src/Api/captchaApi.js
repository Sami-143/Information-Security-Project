
import axios from 'axios';

const API_BASE_URL = "http://localhost:8000";

export const verifyRecaptcha = async (token) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/security/verify-recaptcha`, {
      token,
    });
    return res.data;
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error.response?.data || error.message);
    throw error;
  }
}
