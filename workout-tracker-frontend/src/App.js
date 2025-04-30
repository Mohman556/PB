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
      store.dispatch(fetchCurrentUser(token));
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