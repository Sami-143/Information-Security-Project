
import axios from 'axios';

const API_BASE_URL = "https://dead-michele-sami-143-d0da6b25.koyeb.app";

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
