import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '../Api/authApi';


export const verifyOtp = createAsyncThunk(
  '/verify-email',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authApi.verifyOtp(payload); // payload = { email, otp_code }
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'OTP verification failed');
    }
  }
);

// OTP Resend
export const resendOtp = createAsyncThunk(
  'resend-otp',
  async (email, { rejectWithValue }) => {
    try {
      const res = await authApi.resendOtp(email);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to resend OTP');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  otpVerified: false,
  otpResent: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.otpVerified = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpVerified = true;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpResent = true;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
