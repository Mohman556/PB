import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { fetchCurrentUser } from './actions/authActions';
import Header from './components/Header';
import HomePage from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import PrivateRoute from './components/PrivateRoute';
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

// Create a wrapper component to access location
function AppContent() {
  const location = useLocation();
  const hideFooter = ['/login', '/register'].includes(location.pathname);
  
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token found in localStorage, fetching current user data...');
      
      const loadUserWithDebugging = async () => {
        try {
          console.log('Loading user data on application initialization');
          
          await store.dispatch(fetchCurrentUser(token));

          const currentState = store.getState();
          console.log('User data loaded into Redux:', currentState.auth.user);
          
          // Check if numeric fields are properly stored as numbers
          if (currentState.auth.user) {
            const { height, weight, fitness_goal } = currentState.auth.user;
            console.log('Field types check:');
            console.log('- height:', typeof height, height);
            console.log('- weight:', typeof weight, weight);
            console.log('- fitness_goal:', typeof fitness_goal, fitness_goal);

            if (height && typeof height !== 'number') {
              console.warn('Height is not stored as a number in Redux!');
            }
            if (weight && typeof weight !== 'number') {
              console.warn('Weight is not stored as a number in Redux!');
            }
            if (fitness_goal && typeof fitness_goal !== 'number') {
              console.warn('Fitness goal is not stored as a number in Redux!');
            }
          }
        } catch (error) {
          console.error('Failed to load user data on initialization:', error);
        }
      };
      
      loadUserWithDebugging();
    }
  }, []);

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <ThemeProvider>
          <Router>
            <AppContent />
          </Router>
        </ThemeProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;