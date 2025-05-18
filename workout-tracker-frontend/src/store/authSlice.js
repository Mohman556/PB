import { createSlice } from '@reduxjs/toolkit';

const ensureNumeric = (value) => {
  if (value === null || value === undefined) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

// Process user data to ensure consistent numeric types
const processUserData = (userData) => {
  if (!userData) return null;
  
  return {
    ...userData,
    height: ensureNumeric(userData.height),
    weight: ensureNumeric(userData.weight),
    fitness_goal: ensureNumeric(userData.fitness_goal),
    initial_weight: ensureNumeric(userData.initial_weight || userData.weight),
    fat_percentage: ensureNumeric(userData.fat_percentage)
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token'),
    isAuthenticated: localStorage.getItem('token') ? true : false,
    user: null,
    loading: false,
    error: null
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      localStorage.setItem('token', action.payload.token);
    },
    getUserSuccess: (state, action) => {
      state.user = processUserData(action.payload);
      state.loading = false;
      state.isAuthenticated = true;
    },
    authError: (state, action) => {
      const errorMessage = typeof action.payload === 'object' 
        ? JSON.stringify(action.payload) 
        : action.payload;
      
      state.error = errorMessage;
      state.loading = false;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      localStorage.removeItem('token');
    },
    resetAuthState: (state) => {
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { 
  loginStart, 
  loginSuccess, 
  getUserSuccess, 
  authError, 
  logout, 
  resetAuthState, 
  clearError 
} = authSlice.actions;

export default authSlice.reducer;