import { createSlice } from '@reduxjs/toolkit';

// Helper function to safely parse JSON
const safeJSONParse = (data) => {
  try {
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    localStorage.removeItem('user'); // Clean up invalid data
    return null;
  }
};

// Helper function to safely get initial state
const getInitialState = () => {
  const token = localStorage.getItem('token');
  const userData = safeJSONParse(localStorage.getItem('user'));
  
  return {
    user: userData,
    token: token,
    isAuthenticated: !!(token && userData),
    loading: false,
    error: null,
    cartItemRefresher: false
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      
      // Validate required data
      if (!user || !token) {
        console.error('Invalid login data received:', action.payload);
        state.loading = false;
        state.error = 'Invalid login data';
        return;
      }

      // Update state
      state.loading = false;
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.error = null;

      // Save to localStorage
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setRefreshCartItems: (state) => {
      state.cartItemRefresher = !state.cartItemRefresher;
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, setRefreshCartItems } = authSlice.actions;
export default authSlice.reducer; 