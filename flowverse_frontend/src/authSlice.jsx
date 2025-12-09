import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient.jsx';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/auth/register', userData);
      console.log('Register response:', response.data);
      
      // Handle same response format as login
      if (response.data.token) {
        // Store token in localStorage for persistence
        localStorage.setItem('authToken', response.data.token);
        return {
          token: response.data.token,
        };
      }
      
      return response.data.user;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Registration failed',
        status: error.response?.status,
      });
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      // Backend returns { message, token } instead of { user }
      if (response.data.token) {
        // Store token in localStorage for persistence
        localStorage.setItem('authToken', response.data.token);
        return {
          token: response.data.token,
        };
      }
      
      return response.data.user; // Fallback if backend changes
    } catch (error) {
      console.log('Login error:', error.response?.data);
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Login failed',
        status: error.response?.status,
      });
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/auth/check');
      
      // If backend returns user data, store it
      if (data.user) {
        return data.user;
      }
      
      // If we just need to verify token exists
      const token = localStorage.getItem('authToken');
      if (token) {
        return { token };
      }
      
      throw new Error('Not authenticated');
    } catch (error) {
      // Clear token if auth check fails
      localStorage.removeItem('authToken');
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Auth check failed',
        status: error.response?.status,
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/auth/logout');
      // Clear token from localStorage
      localStorage.removeItem('authToken');
      return null;
    } catch (error) {
      // Clear token even if logout fails
      localStorage.removeItem('authToken');
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Logout failed',
        status: error.response?.status,
      });
    }
  }
);

// Action to restore auth from localStorage on app load
export const restoreAuth = createAsyncThunk(
  'auth/restore',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Verify token with backend
        const { data } = await axiosClient.get('/auth/check');
        return data.user || { token };
      }
      throw new Error('No token found');
    } catch (error) {
      localStorage.removeItem('authToken');
      return rejectWithValue({
        message: 'Session expired',
      });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    initialized: false, // Track if we've checked for existing auth
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register User Cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        console.log('Register fulfilled, user:', action.payload);
        state.loading = false;
        state.isAuthenticated = !!(action.payload && action.payload.token);
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })
  
      // Login User Cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('Login fulfilled, user:', action.payload);
        state.loading = false;
        state.isAuthenticated = !!(action.payload && action.payload.token);
        state.user = action.payload;
        state.error = null;
        console.log('isAuthenticated set to:', state.isAuthenticated);
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log('Login rejected');
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })
  
      // Check Auth Cases
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.error = null;
        state.initialized = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.initialized = true;
        // Don't set error for checkAuth - it's normal to be unauthenticated
      })
      
      // Restore Auth Cases
      .addCase(restoreAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(restoreAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.initialized = true;
      })
  
      // Logout User Cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.user = null;
        state.isAuthenticated = false;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;